import express from "express";
import fact from './routes/fact.js';
import gif from './routes/gif.js';
import quote from './routes/quote.js';

const router = express.Router();

router.use("/fact", fact)
router.use("/gif", gif)
router.use("/quote", quote)

export default router;