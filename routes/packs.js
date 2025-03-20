import express from "express";
import pool from './../db.js';

const router = express.Router();

router.get("/get", async (_req, res, next) => {
    try {
        const [result] = await pool.execute(`
            SELECT packs.name
            FROM packs
        `);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});

export default router;