import express from "express";
import fact from './routes/fact.js';
import gif from './routes/gif.js';
import quote from './routes/quote.js';
import groups from './routes/groups.js';

const router = express.Router();

router.use("/fact", fact)
router.use("/gif", gif)
router.use("/quote", quote)
router.use("/groups", groups);

export default router;