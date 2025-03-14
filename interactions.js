import express from "express";
import {
    InteractionResponseType,
    InteractionType,
    verifyKeyMiddleware,
} from 'discord-interactions';
import { client } from './app.js';

const router = express.Router();

router.post('/', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
    // Interaction id, type and data
    const { id, type, data } = req.body;

    if (type === InteractionType.APPLICATION_COMMAND) {
        const { name, options } = data;

        // Complete

        if (name === 'react') {
            const emojis = client.guilds.cache.get("1171075530481737779").emojis.cache.map(emoji => emoji.toString());

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

        // Temporarily Complete

        // Needs frontend
        if (name === 'fact') {
            const data = await fetch(`http://${process.env.DB_HOST}:3333/router/fact/get`, {
                method: "GET"
            });
            const response = await data.json();

            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: `Did you know! ${response[Math.floor(Math.random() * response.length)].data}`,
                },
            });
        }

        // Incomplete

        // Needs to be in db

        function formatDate(inputDate) {
            const date = new Date(inputDate);
        
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const day = date.getDate();
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
        
            return `${day}/${month}/${year} at ${hours}:${minutes}`;
        }

        if (name === 'quote') {
            const data = await fetch(`http://${process.env.DB_HOST}:3333/router/quote/get`, {
                method: "GET"
            });
            const response = await data.json();
            let quote = await response[Math.floor(Math.random() * response.length)];

            if (options) {
                quote = response.find(quote => quote.quote_id = options?.find(opt => opt.name === 'id')?.value);
            }
            
            if (quote)
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
                                { name: "Date", value: `**${formatDate(quote.date)}**`, inline: true }
                            ],
                        }
                    ]
                },
            });
            else
            return res.status(400).json({ error: 'unknown id' });
        }

        if (name === 'test') {
            const data = await fetch(`http://${process.env.DB_HOST}:3333/router/quote/get`, {
                method: "GET"
            });
            const response = await data.json();
            let quote = await response[Math.floor(Math.random() * response.length)];
            const message = "";

            if (options) {
                const id = options?.find(opt => opt.name === 'id')?.value
                if (id) {
                    quote = response.find(quote => quote.quote_id = id);
                }
                else {
                    const quoted = options?.find(opt => opt.name === 'quoted')?.value;
                    const quoted_by = options?.find(opt => opt.name === 'quoted_by')?.value;
                    const game = options?.find(opt => opt.name === 'game')?.value;

                    const quotes = response.find(quote =>
                        quoted && quote.quoted == quote,
                        quoted_by && quote.quoted_by == quoted_by,
                        game && quote.game == game
                    );

                    if (!quotes) {
                        message = "We couldn't find a quote matching that criteria, so here's a random one!";
                    }
                    else {
                        quote = quotes[Math.floor(Math.random() * quotes.length)];
                    }
                }
            }
            
            if (quote)
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    embeds: [
                        {
                            content: `${message}`,
                            title: `Did you know! "${quote.data}"`,
                            description: `– ${quote.quoted}`,
                            color: 0x0099ff,
                            fields: [
                                { name: "Quoted by", value: `**${quote.user}**`, inline: true },
                                { name: "Game", value: `**${quote.game}**`, inline: true },
                                { name: "Date", value: `**${formatDate(quote.date)}**`, inline: true }
                            ],
                        }
                    ]
                },
            });
            else
            return res.status(400).json({ error: 'unknown id' });
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

        console.error(`unknown command: ${name}`);
        return res.status(400).json({ error: 'unknown command' });
    }

    console.error('unknown interaction type', type);
    return res.status(400).json({ error: 'unknown interaction type' });
});

export default router;