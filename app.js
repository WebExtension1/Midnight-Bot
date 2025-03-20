import dotenv from "dotenv";
import express from 'express';

import cors from "cors";
import { Client, GatewayIntentBits } from 'discord.js';

import router from './router.js'
import interactions from './interactions.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors({ origin: `http://localhost:${PORT}` }));
app.use(express.json());

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once('ready', () => {
  client.user.setPresence({
    activities: [{
      name: 'Eating Cat Treats',
      type: 4,
      // emoji: { name: "CatTreat", id: 1349755255675556080, },
      state: "🐱 Eating Cat Treats",
    }],
    status: 'online',
  });
});

client.login(process.env.BOT_TOKEN);

export { client };

app.use("/router", router);
app.use("/interactions", interactions)

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
