import { Router } from 'express';
import { queryAll, queryOne, runSql } from '../db.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/schedules
router.get('/', authMiddleware, (req, res) => {
    try {
        const schedules = queryAll('SELECT * FROM schedules ORDER BY event_date DESC');
        res.json(schedules);
    } catch (err) {
        console.error('Get schedules error:', err);
        res.status(500).json({ error: 'Failed to fetch schedules' });
    }
});

// POST /api/schedules
router.post('/', authMiddleware, requireRole('supervisor'), (req, res) => {
    try {
        const {
            submission_id, event_date, clocktime,
            chief_examiner, secretary,
            examiner_1, examiner_2, examiner_3, examiner_4
        } = req.body;

        if (!submission_id || !event_date || !clocktime) {
            return res.status(400).json({ error: 'submission_id, event_date, and clocktime are required' });
        }

        const submission = queryOne('SELECT * FROM submissions WHERE id = ?', [submission_id]);
        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }
        if (submission.status !== 'Verified') {
            return res.status(400).json({ error: 'Submission must be verified before scheduling' });
        }

        const lastId = runSql(
            `INSERT INTO schedules (submission_id, event_date, clocktime, chief_examiner, secretary, examiner_1, examiner_2, examiner_3, examiner_4)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [submission_id, event_date, clocktime, chief_examiner, secretary, examiner_1, examiner_2, examiner_3, examiner_4 || null]
        );

        const schedule = queryOne('SELECT * FROM schedules WHERE id = ?', [lastId]);

        res.status(201).json(schedule);
    } catch (err) {
        console.error('Create schedule error:', err);
        res.status(500).json({ error: 'Failed to create schedule' });
    }
});

export default router;
