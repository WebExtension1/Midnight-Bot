import express from "express";
import pool from './../db.js';

const router = express.Router();

router.get("/count", async (_req, res, next) => {
    try {
        const [result] = await pool.execute(`
            SELECT COUNT(*) as pages
            FROM groups;
        `);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});

router.get("/page", async (_req, res, next) => {
    const { page } = req.body;

    try {
        const [result] = await pool.execute(`
            SELECT packs.name, packs.description, groups.name FROM packs
            INNER JOIN groups ON packs.group_id = groups.group_id
            WHERE groups.group_id = ?;
        `);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});

export default router;