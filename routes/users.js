import express from "express";
import pool from '../db.js';

const router = express.Router();

async function setupUser(user_id) {
    await pool.execute(`
        INSERT INTO users (user_id, balance) VALUES
        (?, 25)
    `, [user_id]);
}

router.post("/balance", async (req, res, next) => {
    try {
        const { user_id } = req.body;

        const [result] = await pool.execute(`
            SELECT balance
            FROM users
            WHERE user_id = ?
        `, [user_id]);

        if (result.length > 0) {
            return res.json({ balance: result[0].balance });
        }

        setupUser(user_id);

        res.json({ balance: 25 });
    }
    catch (error) {
        next(error);
    }
});

router.post("/daily", async (req, res, next) => {
    try {
        const { user_id } = req.body;

        let [result] = await pool.execute(`
            SELECT balance
            FROM users
            WHERE user_id = ?
        `, [user_id]);

        let balance = 0;
        if (result.length === 0) {
            setupUser(user_id);
            balance = 25;
        } else {
            balance = result[0].balance;
        }

        [result] = await pool.execute(
            "UPDATE users SET balance = balance + 10, daily = CURRENT_DATE WHERE user_id = ? AND daily != CURRENT_DATE",
            [user_id]
        );
        if (result.affectedRows > 0)
            balance += 10;

        if (result.affectedRows === 1)
            return res.json({ balance: balance, valid: 1 });
        return res.json({ balance: balance, valid: 0 });
    }
    catch (error) {
        next(error);
    }
});

router.post('/buy', async (req, res, next) => {
    try {
        const { user_id, price, pack, rarity, quantity } = req.body;

        let [result] = await pool.execute(
            "UPDATE users SET balance = balance - ? WHERE user_id = ?",
            [price, user_id]
        );

        [result] = await pool.execute(`
            INSERT INTO user_packs (user_id, pack_id, rarity, quantity)
            VALUES (?, (SELECT pack_id FROM packs WHERE name = ?), ?, ?)
            ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
        `,[user_id, pack, rarity, quantity]
        );

        if (result.affectedRows === 1)
            return res.json({ message: "Pack bought" });
        return res.json({ message: "Failed to buy pack" });
    }
    catch (error) {
        next(error);
    }
});

export default router;