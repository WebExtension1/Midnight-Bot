import express from "express";
import fs from "fs";
import {
    InteractionResponseType,
    InteractionType,
    verifyKeyMiddleware,
} from 'discord-interactions';
import { client } from './app.js';
import { formatDate } from './utils.js';

const router = express.Router();

const usageFile = process.env.USAGE_FILE;

let commandStats = {};
if (fs.existsSync(usageFile)) {
    commandStats = JSON.parse(fs.readFileSync(usageFile, 'utf8'));
} else {
    fs.writeFileSync(usageFile, JSON.stringify(commandStats), 'utf8');
}

function trackCommandUsage(userId, commandName) {
    if (!commandStats[userId]) {
        commandStats[userId] = {};
    }

    if (!commandStats[userId][commandName]) {
        commandStats[userId][commandName] = 0;
    }
    commandStats[userId][commandName]++;

    fs.writeFileSync(usageFile, JSON.stringify(commandStats), 'utf8');
}

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'back_gif') {
        await interaction.update({
            content: "Test back",
        });
    } else if (interaction.customId === 'next_gif') {
        await interaction.update({
            content: "Test forward",
        });
    }
});


router.post('/', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
    const { type, data, guild_id, member } = req.body;

    if (type === InteractionType.APPLICATION_COMMAND) {
        const { name, options } = data;

        if (guild_id === process.env.PUBLIC_GUILD_ID)
            trackCommandUsage(member.user.id, name);

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
                if (server) {
                    const details = JSON.parse(fs.readFileSync(usageFile, 'utf8'));
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
                    const details = JSON.parse(fs.readFileSync(usageFile, 'utf8'));
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
                const emojis = client.guilds.cache.get(process.env.PUBLIC_GUILD_ID).emojis.cache.map(emoji => emoji.toString());

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

        if (name === 'gif-debug') {
            try {
                const data = await fetch(`http://${process.env.DB_HOST}:3333/router/gif/get`, {
                    method: "GET"
                });
                const response = await data.json();

                const page = options?.find(opt => opt.name === 'pagination')?.value;
                const pagination_amount = 25;

                const gifs = response.filter(gif => gif.gif_id > ((page - 1) * pagination_amount) && gif.gif_id <= (page * pagination_amount)).map(gif => gif.gif_id + ': ' + gif.data);

                if (gifs.length === 0) {
                    const pages = Math.ceil(response.length / pagination_amount);
                    return res.send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: `Pagination was outside the scope of the array. There are ${response.length} gifs in the db and pagination is set to ${pagination_amount}, so there are ${pages} page${pages !== 1 && 's'}.`,
                        },
                    });
                }

                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `${gifs.join('\n')}`,
                        components: [
                            {
                                type: 1,
                                components: [
                                    {
                                        type: 2,
                                        label: "<--",
                                        style: 1,
                                        custom_id: "back_page",
                                    },
                                    {
                                        type: 2,
                                        label: "-->",
                                        style: 1,
                                        custom_id: "next_page",
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

        if (name === 'quote-debug') {
            try {
                const data = await fetch(`http://${process.env.DB_HOST}:3333/router/quote/get`, {
                    method: "GET"
                });
                const response = await data.json();
    
                const page = options?.find(opt => opt.name === 'pagination')?.value;
                const pagination_amount = 10;
    
                const quotes = response.filter(quote => quote.quote_id > ((page - 1) * pagination_amount) && quote.quote_id <= (page * pagination_amount)).map(quote => `${quote.quote_id}: ${quote.data} - ${quote.quoted}.\nBy **${quote.user}** playing **${quote.game}** at **${formatDate(quote.date)}**\n`);
    
                if (!quotes) {
                    const pages = Math.ceil(response.length / pagination_amount);
                    return res.send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: `Pagination was outside the scope of the array. There are ${response.length} gifs in the db and pagination is set to ${pagination_amount}, so there are ${pages} page${pages !== 1 && 's'}.`,
                        },
                    });
                }
    
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `${quotes.join('\n')}`,
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

        if (name === 'fact-debug') {
            try {
                const data = await fetch(`http://${process.env.DB_HOST}:3333/router/fact/get`, {
                    method: "GET"
                });
                const response = await data.json();
    
                const page = options?.find(opt => opt.name === 'pagination')?.value;
                const pagination_amount = 20;
    
                const facts = response.filter(fact => fact.fact_id > ((page - 1) * pagination_amount) && fact.fact_id <= (page * pagination_amount)).map(fact => fact.fact_id + ': ' + fact.data);
    
                if (facts.length === 0) {
                    const pages = Math.ceil(response.length / pagination_amount);
                    return res.send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: `Pagination was outside the scope of the array. There are ${response.length} gifs in the db and pagination is set to ${pagination_amount}, so there are ${pages} page${pages !== 1 && 's'}.`,
                        },
                    });
                }

                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `${facts.join('\n')}`,
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

        if (name === 'gif-add') {
            try {
                const data = options?.find(opt => opt.name === 'data')?.value;
    
                if (!data) {
                    return res.send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: `All details need to be specified.`,
                        },
                    });
                }
    
                const query = await fetch(`http://${process.env.DB_HOST}:3333/router/gif/add`, {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ data })
                });
                const response = await query.json();
    
                if (response.affectedRows > 0) {
                    return res.send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: `Gif successfully added.`,
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

        if (name === 'fact-add') {
            try {
                const data = options?.find(opt => opt.name === 'data')?.value;
    
                if (!data) {
                    return res.send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: `All details need to be specified.`,
                        },
                    });
                }
    
                const query = await fetch(`http://${process.env.DB_HOST}:3333/router/fact/add`, {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ data })
                });
                const response = await query.json();
    
                if (response.affectedRows > 0) {
                    return res.send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: `Fact successfully added.`,
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

        if (name === 'gif-update') {
            try {
                const id = options?.find(opt => opt.name === 'id')?.value;
                const data = options?.find(opt => opt.name === 'data')?.value;
    
                const query = await fetch(`http://${process.env.DB_HOST}:3333/router/gif/update`, {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, data })
                });
                const response = await query.json();
    
                if (response.affectedRows > 0) {
                    return res.send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: `Gif successfully updated.`,
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

        if (name === 'fact-update') {
            try {
                const id = options?.find(opt => opt.name === 'id')?.value;
                const data = options?.find(opt => opt.name === 'data')?.value;
    
                const query = await fetch(`http://${process.env.DB_HOST}:3333/router/fact/update`, {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, data })
                });
                const response = await query.json();
    
                if (response.affectedRows > 0) {
                    return res.send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: `Fact successfully updated.`,
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

        if (name === 'gif-delete') {
            try {
                const id = options?.find(opt => opt.name === 'id')?.value;
    
                const query = await fetch(`http://${process.env.DB_HOST}:3333/router/gif/delete`, {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id })
                });
                const response = await query.json();
    
                if (response.affectedRows > 0) {
                    return res.send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: `Gif successfully deleted.`,
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

        if (name === 'quote-delete') {
            try {
                const id = options?.find(opt => opt.name === 'id')?.value;
    
                const query = await fetch(`http://${process.env.DB_HOST}:3333/router/quote/delete`, {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id })
                });
                const response = await query.json();
    
                if (response.affectedRows > 0) {
                    return res.send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: `Quote successfully deleted.`,
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

        if (name === 'fact-delete') {
            try {
                const id = options?.find(opt => opt.name === 'id')?.value;
    
                const query = await fetch(`http://${process.env.DB_HOST}:3333/router/fact/delete`, {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id })
                });
                const response = await query.json();
    
                if (response.affectedRows > 0) {
                    return res.send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: `Fact successfully deleted.`,
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

        console.error(`unknown command: ${name}`);
        return res.status(400).json({ error: 'unknown command' });
    }

    console.error('unknown interaction type', type);
    return res.status(400).json({ error: 'unknown interaction type' });
});

export default router;