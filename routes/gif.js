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

        res.json({ message: "Gif added", affectedRows: result.affectedRows });
    }
    catch (error) {
        next(error);
    }
});

router.post("/update", async (req, res, next) => {
    try {
        const { id, data } = req.body;

        const [result] = await pool.execute(`
            UPDATE gifs
            SET data = ?
            WHERE gif_id = ?
        `, [data, id]);

        res.json({ message: "Gif updated", affectedRows: result.affectedRows });
    }
    catch (error) {
        next(error);
    }
});

router.post("/delete", async (req, res, next) => {
    try {
        const { id } = req.body;

        const [result] = await pool.execute(`
            DELETE FROM gifs
            WHERE gif_id = ?
        `, [id]);

        res.json({ message: "Gif deleted", affectedRows: result.affectedRows });
    }
    catch (error) {
        next(error);
    }
});

export default router;