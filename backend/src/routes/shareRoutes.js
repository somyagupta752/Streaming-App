import express from 'express';
import {
  shareVideo,
  getVideoShares,
  updateShare,
  unshareVideo,
  getSharedVideos,
} from '../controllers/shareController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Share a video with email
router.post('/videos/:id/share', authenticateToken, shareVideo);

// Get all shares for a video
router.get('/videos/:id/shares', authenticateToken, getVideoShares);

// Update a share (change role)
router.put('/shares/:shareId', authenticateToken, updateShare);

// Delete a share (unshare)
router.delete('/shares/:shareId', authenticateToken, unshareVideo);

// Get videos shared with current user
router.get('/shared', authenticateToken, getSharedVideos);

export default router;
