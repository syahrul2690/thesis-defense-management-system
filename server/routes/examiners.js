import { Router } from 'express';
import { queryAll, queryOne, runSql } from '../db.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/examiners
router.get('/', authMiddleware, (req, res) => {
    try {
        const examiners = queryAll('SELECT * FROM examiners ORDER BY name');
        res.json(examiners);
    } catch (err) {
        console.error('Get examiners error:', err);
        res.status(500).json({ error: 'Failed to fetch examiners' });
    }
});

// POST /api/examiners
router.post('/', authMiddleware, requireRole('verificator'), (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const lastId = runSql('INSERT INTO examiners (name) VALUES (?)', [name.trim()]);
        const examiner = queryOne('SELECT * FROM examiners WHERE id = ?', [lastId]);

        res.status(201).json(examiner);
    } catch (err) {
        console.error('Add examiner error:', err);
        res.status(500).json({ error: 'Failed to add examiner' });
    }
});

// DELETE /api/examiners/:id
router.delete('/:id', authMiddleware, requireRole('verificator'), (req, res) => {
    try {
        const examiner = queryOne('SELECT * FROM examiners WHERE id = ?', [Number(req.params.id)]);
        if (!examiner) {
            return res.status(404).json({ error: 'Examiner not found' });
        }

        runSql('DELETE FROM examiners WHERE id = ?', [Number(req.params.id)]);
        res.json({ message: 'Examiner removed' });
    } catch (err) {
        console.error('Remove examiner error:', err);
        res.status(500).json({ error: 'Failed to remove examiner' });
    }
});

export default router;
