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

        if (result.length === 0) {
            setupUser(user_id);
        }

        [result] = await pool.execute(
            "UPDATE users SET balance = balance + ?, daily = CURRENT_DATE WHERE user_id = ? AND daily != CURRENT_DATE",
            [amount, user_id]
        );

        if (result.affectedRows === 1){
            return res.json({ balance: result[0].balance + 10, valid: 1 });
        }
        return res.json({ balance: result[0].balance + 10, valid: 0 });
    }
    catch (error) {
        next(error);
    }
});


export default router;