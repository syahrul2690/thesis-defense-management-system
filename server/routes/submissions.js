import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { queryAll, queryOne, runSql } from '../db.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    }
});

const router = Router();

// GET /api/submissions
router.get('/', authMiddleware, (req, res) => {
    try {
        let submissions;
        if (req.user.role === 'student') {
            submissions = queryAll(`
                SELECT s.*, u.name as student_name, u.student_id as student_identifier, u.email as student_email
                FROM submissions s
                JOIN users u ON s.student_id = u.id
                WHERE s.student_id = ? 
                ORDER BY s.created_at DESC
            `, [req.user.id]);
        } else {
            submissions = queryAll(`
                SELECT s.*, u.name as student_name, u.student_id as student_identifier, u.email as student_email
                FROM submissions s
                JOIN users u ON s.student_id = u.id
                ORDER BY s.created_at DESC
            `);
        }
        res.json(submissions);
    } catch (err) {
        console.error('Get submissions error:', err);
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
});

// POST /api/submissions
router.post('/', authMiddleware, requireRole('student'), upload.single('file'), (req, res) => {
    try {
        const { type, document_name } = req.body;

        if (!type || !document_name || !req.file) {
            return res.status(400).json({ error: 'Type, document_name, and file are required' });
        }

        const file_path = `/uploads/${req.file.filename}`;

        const lastId = runSql(
            'INSERT INTO submissions (student_id, type, document_name, file_path, status) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, type, document_name, file_path, 'Pending']
        );

        const submission = queryOne(`
            SELECT s.*, u.name as student_name, u.student_id as student_identifier, u.email as student_email
            FROM submissions s
            JOIN users u ON s.student_id = u.id
            WHERE s.id = ?
        `, [lastId]);

        res.status(201).json(submission);
    } catch (err) {
        console.error('Create submission error:', err);
        res.status(500).json({ error: 'Failed to create submission' });
    }
});

// PUT /api/submissions/:id/file - re-upload file
router.put('/:id/file', authMiddleware, requireRole('student'), upload.single('file'), (req, res) => {
    try {
        const submission = queryOne('SELECT * FROM submissions WHERE id = ? AND student_id = ?', [Number(req.params.id), req.user.id]);

        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'File is required' });
        }

        const file_path = `/uploads/${req.file.filename}`;

        runSql("UPDATE submissions SET file_path = ?, status = 'Pending', is_reuploaded = 1, created_at = datetime('now') WHERE id = ?",
            [file_path, Number(req.params.id)]);

        const updated = queryOne(`
            SELECT s.*, u.name as student_name, u.student_id as student_identifier, u.email as student_email
            FROM submissions s
            JOIN users u ON s.student_id = u.id
            WHERE s.id = ?
        `, [Number(req.params.id)]);
        res.json(updated);
    } catch (err) {
        console.error('Re-upload error:', err);
        res.status(500).json({ error: 'Failed to re-upload' });
    }
});

// PUT /api/submissions/:id/status
router.put('/:id/status', authMiddleware, requireRole('verificator'), (req, res) => {
    try {
        const { status } = req.body;
        if (!['Verified', 'Rejected'].includes(status)) {
            return res.status(400).json({ error: 'Status must be Verified or Rejected' });
        }

        const submission = queryOne('SELECT * FROM submissions WHERE id = ?', [Number(req.params.id)]);
        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        runSql('UPDATE submissions SET status = ? WHERE id = ?', [status, Number(req.params.id)]);

        const updated = queryOne(`
            SELECT s.*, u.name as student_name, u.student_id as student_identifier, u.email as student_email
            FROM submissions s
            JOIN users u ON s.student_id = u.id
            WHERE s.id = ?
        `, [Number(req.params.id)]);
        res.json(updated);
    } catch (err) {
        console.error('Update status error:', err);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

export default router;
