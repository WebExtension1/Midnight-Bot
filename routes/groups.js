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

router.post("/get", async (req, res, next) => {
    const { page } = req.body;

    try {
        const [result] = await pool.execute(`
            SELECT packs.name AS packName, packs.description AS description, groups.name AS groupName FROM packs
            INNER JOIN groups ON packs.group_id = groups.group_id
            WHERE groups.group_id = ?;
        `, [page]);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});

export default router;