import express from "express";
import pool from '../db.js';

const router = express.Router();

router.get("/balance", async (_req, res, next) => {
    try {
        const { user_id } = req.body;

        const [result] = await pool.execute(`
            SELECT balance
            FROM users
            WHERE user_id = ?
        `, [user_id]);

        if (result.length > 0) {
            return res.json({ balance: rows[0].balance });
        }

        await pool.execute(`
            INSERT INTO users (user_id, balance) VALUES
            (?, 10)
        `, [user_id]);

        res.json({ balance: 10 });
    }
    catch (error) {
        next(error);
    }
});

export default router;