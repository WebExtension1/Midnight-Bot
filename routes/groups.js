import express from "express";
import pool from './../db.js';

const router = express.Router();

router.get("/count", async (_req, res, next) => {
    try {
        const [result] = await pool.execute(`
            SELECT COUNT(*) as pages
            FROM groups;
        `);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});

export default router;