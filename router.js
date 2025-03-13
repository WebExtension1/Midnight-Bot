import express from "express";
import fact from './routes/fact.js';
import gif from './routes/gif.js';

const router = express.Router();

router.use("/fact", fact)
router.use("/gif", gif)

export default router;