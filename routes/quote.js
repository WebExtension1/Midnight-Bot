import express from "express";
import pool from './../db.js';

const router = express.Router();

router.get("/get", async (_req, res, next) => {
    try {
        const [result] = await pool.execute(`
            SELECT *
            FROM quotes
        `);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});

router.post("/add", async (req, res, next) => {
    try {
        const { data, quoted, quoted_by, game } = req.body;

        const [result] = await pool.execute(`
            INSERT INTO quotes (data, quoted, user, game) VALUES
            (?, ?, ?, ?)
        `, [data, quoted, quoted_by, game]);

        res.json({ message: "Quote added", affectedRows: result.affectedRows });
    }
    catch (error) {
        next(error);
    }
});

router.post("/update", async (req, res, next) => {
    try {
        const { id, data, quoted, user, game, date } = req.body;
        
        let updates = [];
        let params = [];

        if (data) {
            updates.push('data = ?');
            params.push(data);
        }
        if (quoted) {
            updates.push('quoted = ?');
            params.push(quoted);
        }
        if (user) {
            updates.push('user = ?');
            params.push(user);
        }
        if (game) {
            updates.push('game = ?');
            params.push(game);
        }
        if (date) {
            updates.push('date = ?');
            params.push(date);
        }
        params.push(id);

        const query = `
            UPDATE quotes
            SET ${updates.join(", ")}
            WHERE quote_id = ?
        `;

        const [result] = await pool.execute(query, params);

        res.json({ message: "Quote updated", affectedRows: result.affectedRows });
    }
    catch (error) {
        next(error);
    }
});

router.post("/delete", async (req, res, next) => {
    try {
        const { id } = req.body;

        const [result] = await pool.execute(`
            DELETE FROM quotes
            WHERE quote_id = ?
        `, [id]);

        res.json({ message: "Quote deleted", affectedRows: result.affectedRows });
    }
    catch (error) {
        next(error);
    }
});

export default router;