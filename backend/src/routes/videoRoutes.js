import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  uploadVideo,
  getVideos,
  getVideoDetails,
  deleteVideo,
  streamVideo,
  getJobProgress,
} from '../controllers/videoController.js';
import { authenticateToken, authorize } from '../middleware/auth.js';

const router = express.Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only video files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2GB
});

// Routes
router.post('/upload', authenticateToken, authorize('editor', 'admin'), upload.single('video'), uploadVideo);
router.get('/', authenticateToken, getVideos);
router.get('/:id', authenticateToken, getVideoDetails);
router.delete('/:id', authenticateToken, deleteVideo);
router.get('/:id/stream', authenticateToken, streamVideo);
router.get('/job/:jobId/progress', authenticateToken, getJobProgress);

export default router;
