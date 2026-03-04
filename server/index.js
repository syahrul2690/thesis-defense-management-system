import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Import and initialize database
import { initDatabase } from './db.js';

// Import routes
import authRoutes from './routes/auth.js';
import submissionRoutes from './routes/submissions.js';
import examinerRoutes from './routes/examiners.js';
import scheduleRoutes from './routes/schedules.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/examiners', examinerRoutes);
app.use('/api/schedules', scheduleRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize database then start server
initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 TDMS Backend running on http://localhost:${PORT}`);
        console.log(`📁 Uploads directory: ${uploadsDir}`);
    });
}).catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});
