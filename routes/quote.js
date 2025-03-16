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
        
        let params = [];
        if (data)
            params.push(data);
        if (quoted)
            params.push(quoted);
        if (user)
            params.push(user);
        if (game)
            params.push(game);
        if (date)
            params.push(date);
        params.push(id);

        const [result] = await pool.execute(`
            UPDATE quote
            SET
            ${data && 'data = ?'}
            ${quoted && 'quoted = ?'}
            ${user && 'user = ?'}
            ${game && 'game = ?'}
            ${date && 'date = ?'}
            WHERE quote_id = ?
        `, [params]);

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
            WHERE quotes_id = ?
        `, [id]);

        res.json({ message: "Quote deleted", affectedRows: result.affectedRows });
    }
    catch (error) {
        next(error);
    }
});

export default router;