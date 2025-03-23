// Server
import express from "express";
import fs from "fs";

// Discord
import { InteractionResponseType, InteractionType, verifyKeyMiddleware } from 'discord-interactions';
import { client } from './app.js';

// Utils
import { formatDate, capitalise } from './utils.js';
import getPaginatedShop from './utils/paginatedShop.js';
import getPaginatedItem from './utils/paginatedItem.js';
import { trackCommandUsage, getCommandUsageDetails } from "./utils/commandUsage.js";

const router = express.Router();

const usageFile = process.env.USAGE_FILE;

let commandStats = {};
if (fs.existsSync(usageFile)) {
    commandStats = JSON.parse(fs.readFileSync(usageFile, 'utf8'));
} else {
    fs.writeFileSync(usageFile, JSON.stringify(commandStats), 'utf8');
}

router.post('/', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
    const { type, data, guild_id, member } = req.body;

    if (type === InteractionType.MESSAGE_COMPONENT) {
        const custom_id = data.custom_id;

        const items = custom_id.split('_');

        if (items[0] === 'buy') {
            const pack = items[1];
            const quantity = items[2];
            const rarity = items[3];
            const user_id = items[4];

            if (member.user.id !== user_id)
                return;

            const pricing = {
                "common": 10,
                "uncommon": 18,
                "rare": 31,
                "epic": 52,
                "legendary": 86,
                "deluxe": 141
            }

            const price = pricing[rarity] * quantity;

            let query = await fetch(`http://${process.env.DB_HOST}:3333/router/users/balance`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id })
            });
            let response = await query.json();

            if (response.balance < price) {
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `Sorry, you don't have enough cat treats to complete this purchase! You only have ${response.balance} cat treats.`,
                    },
                });
            }

            query = await fetch(`http://${process.env.DB_HOST}:3333/router/users/buy`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id, price, pack, quantity, rarity })
            });
            response = await query.json();

            if (response.message === 'Pack bought') {
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `Successfully bought ${quantity} ${rarity} ${pack} ${quantity === 1 ? 'pack' : 'packs'}.`,
                    },
                });
            }
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: `Failed to buy pack.`,
                },
            });
        }

        const type = items[1];
        const direction = items[0];
        let page = items[2];

        if (type === "gif" || type === "quote" || type === "fact") {
            if (direction === 'next1')
                page++;
            else if (direction === 'back1')
                page--;
            else if (direction === 'next2')
                page = 0;
            else
                page = 1000000;

            let pagination = 25;
            if (type === 'quote')
                pagination = 10;
            else if (type === 'fact')
                pagination = 20;

            try {
                getPaginatedItem(res, type, pagination, page, InteractionResponseType.UPDATE_MESSAGE);
            }
            catch (error) {
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `Error: ${error}`,
                    },
                });
            }
        }
        else if (type === "shop") {
            if (direction === "next")
                page++;
            else
                page--;

            try {
                getPaginatedShop(res, page, InteractionResponseType.UPDATE_MESSAGE);
            }
            catch (error) {
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `Error: ${error}`,
                    },
                });
            }
        }
    }

    if (type === InteractionType.APPLICATION_COMMAND) {
        const { name, options } = data;

        if (guild_id === process.env.PUBLIC_GUILD_ID)
            trackCommandUsage(member.user.id, name, commandStats);

        if (name === 'example') {
            try {

            }
            catch (error) {
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `Error: ${error}`,
                    },
                });
            }
        }

        if (name === 'stats') {
            try {
                let server = false;
                if (options && options?.find(opt => opt.name === 'server')?.value === true) {
                    server = true;
                }

                let response = {};
                const details = getCommandUsageDetails();
                if (server) {
                    response = {
                        fact: 0,
                        react: 0,
                        quote: 0,
                        gif: 0,
                        linktree: 0,
                        stats: 0,
                    };

                    for (const userId in details) {
                        const userStats = details[userId];
                        response.fact += userStats.fact || 0;
                        response.react += userStats.react || 0;
                        response.quote += userStats.quote || 0;
                        response.gif += userStats.gif || 0;
                        response.linktree += userStats.linktree || 0;
                        response.stats += userStats.stats || 0;
                    }
                } else {
                    const sender_id = member.user.id;
                    response = details[sender_id];
                }

                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        embeds: [
                            {
                                title: `Midnight command stats for ${server ? "the server" : member.user.username}.`,
                                description: `
/fact: ${response["fact"] || 0}
/react: ${response["react"] || 0}
/quote: ${response["quote"] || 0}
/gif: ${response["gif"] || 0}
/stats: ${response["stats"] || 0}
/linktree: ${response["linktree"] || 0}
                                `,
                                color: 0x0099ff,
                                ...(!server && {
                                    thumbnail: {
                                        url: `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.jpg`
                                    }
                                })
                            }
                        ]
                    },
                });
            }
            catch (error) {
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `Error: ${error}`,
                    },
                });
            }
        }

        if (name === 'react') {
            try {
                const emojis = client.guilds.cache.get(process.env.PUBLIC_GUILD_ID).emojis.cache.map(emoji => emoji.toString()).filter(emoji => !emoji.includes('biglad2'));

                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: emojis[Math.floor(Math.random() * emojis.length)],
                    },
                });
            }
            catch (error) {
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `Error: ${error}`,
                    },
                });
            }
        }

        if (name === 'linktree') {
            try {
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `[Linktree](https://linktr.ee/bigladmelton)`,
                    },
                });
            }
            catch (error) {
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `Error: ${error}`,
                    },
                });
            }
        }

        if (name === 'gif') {
            try {
                const data = await fetch(`http://${process.env.DB_HOST}:3333/router/gif/get`, {
                    method: "GET"
                });
                const response = await data.json();

                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `${response[Math.floor(Math.random() * response.length)].data}`,
                    },
                });
            }
            catch (error) {
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `Error: ${error}`,
                    },
                });
            }
        }

        if (name === 'quote') {
            try {
                const data = await fetch(`http://${process.env.DB_HOST}:3333/router/quote/get`, {
                    method: "GET"
                });
                const response = await data.json();
                let quote = await response[Math.floor(Math.random() * response.length)];

                if (options) {
                    const id = options?.find(opt => opt.name === 'id')?.value
                    if (id) {
                        quote = response.find(quote => quote.quote_id === id);
                    }
                    else {
                        const quoted = options?.find(opt => opt.name === 'quoted')?.value;
                        const quoted_by = options?.find(opt => opt.name === 'quoted_by')?.value;
                        const game = options?.find(opt => opt.name === 'game')?.value;

                        const quotes = response.filter(quote =>
                            (!quoted || quote.quoted === quoted) &&
                            (!quoted_by || quote.user === quoted_by) &&
                            (!game || quote.game === game)
                        );

                        if (quotes.length > 0) {
                            quote = quotes[Math.floor(Math.random() * quotes.length)];
                        }
                    }
                }

                if (!quote)
                    return res.status(400).json({ error: 'Error resolving the request' });

                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        embeds: [
                            {
                                title: `"${quote.data}"`,
                                description: `– ${quote.quoted}`,
                                color: 0x0099ff,
                                fields: [
                                    { name: "Quoted by", value: `**${quote.user}**`, inline: true },
                                    { name: "Game", value: `**${quote.game}**`, inline: true },
                                    { name: "Date", value: `**${formatDate(quote.date)}**`, inline: true },
                                    { name: "ID", value: `**${quote.quote_id}**`, inline: true }
                                ],
                            }
                        ]
                    },
                });
            }
            catch (error) {
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `Error: ${error}`,
                    },
                });
            }
        }

        if (name === 'fact') {
            try {
                const data = await fetch(`http://${process.env.DB_HOST}:3333/router/fact/get`, {
                    method: "GET"
                });
                const response = await data.json();
                let fact = response[Math.floor(Math.random() * response.length)];

                if (options) {
                    const id = options?.find(opt => opt.name === 'id')?.value
                    if (id) {
                        fact = response.find(fact => fact.fact_id === id);
                    }
                }

                if (!fact)
                    return res.status(400).json({ error: 'Error resolving the request' });

                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        embeds: [
                            {
                                title: `Did you know!`,
                                description: `${fact.data}`,
                                color: 0x0099ff,
                                fields: [
                                    { name: "ID", value: `**${fact.fact_id}**`, inline: true }
                                ],
                            }
                        ]
                    },
                });
            }
            catch (error) {
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `Error: ${error}`,
                    },
                });
            }
        }

        if (name === "clip") {
            try {
                const query = await fetch(`http://${process.env.DB_HOST}:3333/router/clip/get`, {
                    method: "GET",
                    headers: { 'Content-Type': 'application/json' },
                });
                const response = await query.json();

                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `${response[Math.floor(Math.random() * response.length)].data}`,
                    },
                });

            }
            catch (error) {
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `Error: ${error}`,
                    },
                });
            }
        }

        if (name === 'react-debug') {
            try {
                const emojis = client.guilds.cache.get(process.env.PUBLIC_GUILD_ID).emojis.cache.map(emoji => emoji.toString()).filter(emoji => !emoji.includes('biglad2'));

                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: emojis.join(' '),
                    },
                });
            }
            catch (error) {
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `Error: ${error}`,
                    },
                });
            }
        }

        if (name.split('-')[1] === 'debug') {
            try {
                const type = name.split('-')[0];
                const paginations = { 'clip': 25, 'gif': 25, 'quote': 10, 'fact': 20 };
                await getPaginatedItem(res, type, paginations[type], options?.find(opt => opt.name === 'pagination')?.value || 1, InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE);
            }
            catch (error) {
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `Error: ${error}`,
                    },
                });
            }
        }

        if (name === 'quote-add') {
            try {
                const data = options?.find(opt => opt.name === 'data')?.value;
                const quoted = options?.find(opt => opt.name === 'quoted')?.value;
                const quoted_by = options?.find(opt => opt.name === 'quoted_by')?.value;
                const game = options?.find(opt => opt.name === 'game')?.value;

                if (!data || !quoted || !quoted_by || !game) {
                    return res.send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: `All details need to be specified.`,
                        },
                    });
                }

                const query = await fetch(`http://${process.env.DB_HOST}:3333/router/quote/add`, {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ data, quoted, quoted_by, game })
                });
                const response = await query.json();

                if (response.affectedRows > 0) {
                    return res.send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: `Quote successfully added.`,
                        },
                    });
                }

                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `Database insertion failed.`,
                    },
                });
            }
            catch (error) {
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `Error: ${error}`,
                    },
                });
            }
        }

        if (name.split('-')[1] === 'add') {
            try {
                const type = name.split('-')[0];
                const data = options?.find(opt => opt.name === 'data')?.value;

                if (!data) {
                    return res.send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: `All details need to be specified.`,
                        },
                    });
                }

                const query = await fetch(`http://${process.env.DB_HOST}:3333/router/${type}/add`, {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ data })
                });
                const response = await query.json();

                if (response.affectedRows > 0) {
                    return res.send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: `${capitalise(type)} successfully added.`,
                        },
                    });
                }

                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `Database insertion failed.`,
                    },
                });
            }
            catch (error) {
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `Error: ${error}`,
                    },
                });
            }
        }

        if (name === 'quote-update') {
            try {
                const id = options?.find(opt => opt.name === 'id')?.value;
                const data = options?.find(opt => opt.name === 'data')?.value;
                const quoted = options?.find(opt => opt.name === 'quoted')?.value;
                const quoted_by = options?.find(opt => opt.name === 'quoted_by')?.value;
                const game = options?.find(opt => opt.name === 'game')?.value;
                const date = options?.find(opt => opt.name === 'date')?.value;

                if (!data && !quoted && !quoted_by && !game && !date)
                    return res.send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: `You need to supply at least one of the optional commands.`,
                        },
                    });

                const query = await fetch(`http://${process.env.DB_HOST}:3333/router/quote/update`, {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, data, quoted, user: quoted_by, game, date })
                });
                const response = await query.json();

                if (response.affectedRows > 0) {
                    return res.send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: `Quote successfully updated.`,
                        },
                    });
                }

                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `Database update failed.`,
                    },
                });
            }
            catch (error) {
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `Error: ${error}`,
                    },
                });
            }
        }

        if (name.split('-')[1] === 'update') {
            try {
                const type = name.split('-')[0];
                const id = options?.find(opt => opt.name === 'id')?.value;
                const data = options?.find(opt => opt.name === 'data')?.value;

                const query = await fetch(`http://${process.env.DB_HOST}:3333/router/${type}/update`, {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, data })
                });
                const response = await query.json();

                if (response.affectedRows > 0) {
                    return res.send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: `${capitalise(type)} successfully updated.`,
                        },
                    });
                }

                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `Database update failed.`,
                    },
                });
            }
            catch (error) {
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `Error: ${error}`,
                    },
                });
            }
        }

        if (name.split('-')[1] === 'delete') {
            try {
                const type = name.split('-')[0];
                const id = options?.find(opt => opt.name === 'id')?.value;

                const query = await fetch(`http://${process.env.DB_HOST}:3333/router/${type}/delete`, {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id })
                });
                const response = await query.json();

                if (response.affectedRows > 0) {
                    return res.send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: `${capitalise(type)} successfully deleted.`,
                        },
                    });
                }

                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `Database deletion failed.`,
                    },
                });
            }
            catch (error) {
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `Error: ${error}`,
                    },
                });
            }
        }

        if (name === "shop") {
            getPaginatedShop(res, 1, InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE);
        }

        if (name === 'inventory') {
            try {
                const user_id = member.user.id;

                const query = await fetch(`http://${process.env.DB_HOST}:3333/router/users/packs`, {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id })
                });
                const response = await query.json();

                const grouped = response.reduce((pack, { name, rarity, quantity }) => {
                    if (!pack[name]) {
                        pack[name] = [];
                    }
                    pack[name].push(`${capitalise(rarity)} (${quantity})`);
                    return pack;
                }, {});

                let output = '';
                for (const [name, rarities] of Object.entries(grouped)) {
                    output += `# ${name}\n${rarities.join('\n')}\n\n`;
                }

                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        embeds: [
                            {
                                title: `${member.user.username}'s Inventory.`,
                                description: output,
                                color: 0x0099ff,
                                thumbnail: {
                                    url: `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.jpg`
                                }
                            }
                        ]
                    },
                });
            }
            catch (error) {
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `Error: ${error}`,
                    },
                });
            }
        }

        if (name === 'buy') {
            try {
                const user_id = member.user.id;
                const name = options?.find(opt => opt.name === 'name')?.value;
                const rarity = options?.find(opt => opt.name === 'rarity')?.value || "common";
                const quantity = options?.find(opt => opt.name === 'quantity')?.value || 1;

                let query = await fetch(`http://${process.env.DB_HOST}:3333/router/packs/get`, {
                    method: "GET",
                    headers: { 'Content-Type': 'application/json' }
                });
                let response = await query.json();
                const foundPack = response.find(pack => pack.name.toLowerCase() === name.toLowerCase());

                if (!foundPack)
                    return res.send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: `Pack not found`,
                        },
                    });

                const pricing = {
                    "common": 10,
                    "uncommon": 18,
                    "rare": 31,
                    "epic": 52,
                    "legendary": 86,
                    "deluxe": 141
                }

                const price = pricing[rarity] * quantity;

                query = await fetch(`http://${process.env.DB_HOST}:3333/router/users/balance`, {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id })
                });
                response = await query.json();

                if (response.balance < price) {
                    return res.send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: `Sorry, you don't have enough cat treats to complete this purchase! You only have ${response.balance} cat treats.`,
                        },
                    });
                }
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `Are you sure you would like to buy ${quantity} ${foundPack.name} ${quantity === 1 ? 'pack' : 'packs'} for a total of ${price} cat treats?`,
                        components: [
                            {
                                type: 1,
                                components: [
                                    {
                                        type: 2,
                                        label: "Buy",
                                        style: 1,
                                        custom_id: `buy_${foundPack.name}_${quantity}_${rarity}_${user_id}`
                                    }
                                ]
                            }
                        ]
                    },
                });
            }
            catch (error) {
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `Error: ${error}`,
                    },
                });
            }
        }

        if (name === 'open') {
            try {
                const [image1Data, image2Data] = await Promise.all([
                    axios.get('https://static.wikia.nocookie.net/freddy-fazbears-pizza/images/6/6b/FFInfoboxImage.png/revision/latest?cb=20231216120333', { responseType: 'arraybuffer' }),
                    axios.get('https://cdn.imgchest.com/files/7mmc9wedzd7.png', { responseType: 'arraybuffer' })
                ]);

                const image1 = await loadImage(Buffer.from(image1Data.data, 'binary'));
                const image2 = await loadImage(Buffer.from(image2Data.data, 'binary'));

                const canvas = createCanvas(image1.width, image1.height);
                const context = canvas.getContext('2d');

                context.drawImage(image1, 0, 0);
                context.drawImage(image2, 0, 0, image1.width, image1.height);

                const buffer = canvas.toBuffer('image/png');

                return interaction.reply({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        files: [{ attachment: buffer, name: 'overlay.png' }]
                    }
                });
            }
            catch (error) {
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `Error: ${error}`,
                    },
                });
            }
        }

        if (name === "balance") {
            try {
                const user_id = member.user.id;

                const query = await fetch(`http://${process.env.DB_HOST}:3333/router/users/balance`, {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id })
                });
                const response = await query.json();

                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `Balance: ${Math.round(response.balance * 100) / 100}`,
                    },
                });
            }
            catch (error) {
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `Error: ${error}`,
                    },
                });
            }
        }

        if (name === "daily") {
            try {
                const user_id = member.user.id;

                const query = await fetch(`http://${process.env.DB_HOST}:3333/router/users/daily`, {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id })
                });
                const response = await query.json();

                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `${response.valid === 1 ? 'Daily redeemed!' : 'You have already claimed your daily today.'} Your balance is ${response.balance}.`,
                    },
                });
            }
            catch (error) {
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `Error: ${error}`,
                    },
                });
            }
        }

        // console.error(`unknown command: ${name}`);
        // return res.status(400).json({ error: 'unknown command' });
    }

    // console.error('unknown interaction type', type);
    // return res.status(400).json({ error: 'unknown interaction type' });
});

export default router;