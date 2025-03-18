import express from "express";
import pool from './../db.js';

const router = express.Router();

router.get("/get", async (_req, res, next) => {
    try {
        const [result] = await pool.execute(`
            SELECT *
            FROM clips
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
            INSERT INTO clips (data) VALUES
            (?)
        `, [data]);

        res.json({ message: "Clip added", affectedRows: result.affectedRows });
    }
    catch (error) {
        next(error);
    }
});

router.post("/update", async (req, res, next) => {
    try {
        const { id, data } = req.body;

        const [result] = await pool.execute(`
            UPDATE clips
            SET data = ?
            WHERE clip_id = ?
        `, [data, id]);

        res.json({ message: "Clip updated", affectedRows: result.affectedRows });
    }
    catch (error) {
        next(error);
    }
});

router.post("/delete", async (req, res, next) => {
    try {
        const { id } = req.body;

        const [result] = await pool.execute(`
            DELETE FROM clips
            WHERE clip_id = ?
        `, [id]);

        res.json({ message: "Clip deleted", affectedRows: result.affectedRows });
    }
    catch (error) {
        next(error);
    }
});

export default router;