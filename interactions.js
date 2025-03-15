import express from "express";
import {
    InteractionResponseType,
    InteractionType,
    verifyKeyMiddleware,
} from 'discord-interactions';
import { client } from './app.js';
import { formatDate } from './utils.js';

const router = express.Router();

router.post('/', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
    // Interaction id, type and data
    const { id, type, data } = req.body;

    if (type === InteractionType.APPLICATION_COMMAND) {
        const { name, options } = data;

        if (name === 'react') {
            const emojis = client.guilds.cache.get($PUBLIC_GUILD_ID).emojis.cache.map(emoji => emoji.toString());

            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: emojis[Math.floor(Math.random() * emojis.length)],
                },
            });
        }

        if (name === 'linktree') {
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: `[Linktree](https://linktr.ee/bigladmelton)`,
                },
            });
        }

        if (name === 'fact') {
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

        if (name === 'quote') {
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

        if (name === 'gif') {
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

        if (name === 'gif-debug') {
            const data = await fetch(`http://${process.env.DB_HOST}:3333/router/gif/get`, {
                method: "GET"
            });
            const response = await data.json();
            let gifs = response.map(gif => gif.gif_id + ': ' + gif.data );

            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: `${gifs.join('\n')}`,
                },
            });
        }
        
        if (name === 'quote-debug') {
            const data = await fetch(`http://${process.env.DB_HOST}:3333/router/quote/get`, {
                method: "GET"
            });
            const response = await data.json();
            let quotes = response.map(quote => quote.quote_id + ': ' + quote.data + ' - ' + quote.quoted + '. By ' + quote.quoted_by + ' playing ' + quote.game + ' at ' + quote.date );

            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: `${quotes.join('\n')}`,
                },
            });
        }
        
        if (name === 'fact-debug') {
            const data = await fetch(`http://${process.env.DB_HOST}:3333/router/fact/get`, {
                method: "GET"
            });
            const response = await data.json();
            let facts = response.map(fact => fact.fact_id + ': ' + fact.data );

            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: `${fact.join('\n')}`,
                },
            });
        }

        if (name === 'quote-add') {
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

        if (name === 'gif-add') {
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

        if (name === 'fact-add') {
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

        console.error(`unknown command: ${name}`);
        return res.status(400).json({ error: 'unknown command' });
    }

    console.error('unknown interaction type', type);
    return res.status(400).json({ error: 'unknown interaction type' });
});

export default router;