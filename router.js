import express from "express";

import fact from './routes/fact.js';
import gif from './routes/gif.js';
import quote from './routes/quote.js';
import clip from './routes/clip.js'
import groups from './routes/groups.js';
import users from './routes/users.js';
import packs from './routes/packs.js';

const router = express.Router();

router.use("/fact", fact);
router.use("/gif", gif);
router.use("/quote", quote);
router.use("/clip", clip);
router.use("/groups", groups);
router.use("/users", users);
router.use("/packs", packs);

export default router;