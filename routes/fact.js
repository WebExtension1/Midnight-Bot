import express from "express";
import pool from './../db.js';

const router = express.Router();

router.get("/get", async (_req, res, next) => {
    try {
        const [result] = await pool.execute(`
            SELECT *
            FROM facts
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
})

export default router;