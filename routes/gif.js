import express from "express";
import pool from './../db.js';

const router = express.Router();

router.get("/get", async (_req, res, next) => {
    try {
        const [result] = await pool.execute(`
            SELECT *
            FROM gifs
        `);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});

router.post("/add", async (req, res, next) => {
    try {
        const { data } = req.body;

        const [result] = await pool.execute(`
            INSERT INTO gifs (data) VALUES
            (?)
        `, [data]);

        res.json({ message: "Quote added", affectedRows: result.affectedRows });
    }
    catch (error) {
        next(error);
    }
});

export default router;