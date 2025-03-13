import express from "express";
import { getRandomQuote } from './utils.js';
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
        const { name } = data;

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
            const data = await fetch("http://localhost:3333/router/fact/get", {
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

        // Incomplete

        // Needs to be in db
        if (name === 'quote') {
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: `${getRandomQuote()}`,
                },
            });
        }

        if (name === 'gif') {
            const data = await fetch("http://localhost:3333/router/gif/get", {
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