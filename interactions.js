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

const commandUsage = fs.existsSync(usageFile)
    ? JSON.parse(fs.readFileSync(usageFile, "utf-8"))
    : {};

function trackCommandUsage(commandName) {
    commandUsage[commandName] = (commandUsage[commandName] || 0) + 1;
    fs.writeFileSync(usageFile, JSON.stringify(commandUsage, null, 2));
}

router.post('/', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
    // Interaction id, type and data
    const { type, data } = req.body;

    if (type === InteractionType.APPLICATION_COMMAND) {
        const { name, options, guild_id } = data;

        if (guild_id === process.env.PUBLIC_GUILD_ID)
            trackCommandUsage(name);

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

                const gifs = response.filter(gif => gif.gif_id > ((page - 1) * 25) && gif.gif_id <= (page * 25)).map(gif => gif.gif_id + ': ' + gif.data);

                if (!gifs)
                    return res.send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: `Pagination was outside the scope of the array. There are ${response.length} gifs in the db.`,
                        },
                    });

                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `${gifs.join('\n')}`,
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
    
                const quotes = response.filter(quote => quote.quote_id > ((page - 1) * 10) && quote.quote_id <= (page * 10)).map(quote => `${quote.quote_id}: ${quote.data} - ${quote.quoted}.\nBy **${quote.user}** playing **${quote.game}** at **${formatDate(quote.date)}**\n`);
    
                if (!quotes)
                    return res.send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: `Pagination was outside the scope of the array. There are ${response.length} gifs in the db.`,
                        },
                    });
    
    
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
    
                const facts = response.filter(fact => fact.fact_id > ((page - 1) * 20) && fact.fact_id <= (page * 20)).map(fact => fact.fact_id + ': ' + fact.data);
    
                if (!facts)
                    return res.send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: `Pagination was outside the scope of the array. There are ${response.length} gifs in the db.`,
                        },
                    });
    
    
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
                const quote = options?.find(opt => opt.name === 'quote')?.value;
                const quoted_by = options?.find(opt => opt.name === 'quoted_by')?.value;
                const game = options?.find(opt => opt.name === 'game')?.value;
                const date = options?.find(opt => opt.name === 'date')?.value;
    
                if (!data && !quote && !quoted_by && !game && !date)
                    return res.send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: `You need to supply at least one of the optional commands.`,
                        },
                    });
    
                const query = await fetch(`http://${process.env.DB_HOST}:3333/router/quote/update`, {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, data, quote, user: quoted_by, game, date })
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