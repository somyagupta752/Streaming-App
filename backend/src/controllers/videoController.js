import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import Video from '../models/Video.js';
import ProcessingJob from '../models/ProcessingJob.js';
import User from '../models/User.js';

export const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title, description, tags } = req.body;

    // Validation
    if (!title) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Video title is required' });
    }

    // Create video document
    const video = new Video({
      title: title || req.file.originalname,
      description: description || '',
      userId: req.user._id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      status: 'processing',
    });

    await video.save();

    // Create processing job
    const jobId = uuidv4();
    const job = new ProcessingJob({
      videoId: video._id,
      userId: req.user._id,
      jobId,
      status: 'queued',
    });

    await job.save();

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        totalVideos: 1,
        totalStorage: req.file.size,
      },
    });

    // Simulate processing in background
    simulateVideoProcessing(video._id, job._id);

    res.status(201).json({
      message: 'Video uploaded successfully',
      video: {
        id: video._id,
        title: video.title,
        status: video.status,
        fileSize: video.fileSize,
        uploadedAt: video.uploadedAt,
      },
      jobId,
    });
  } catch (error) {
    // Clean up file if error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};

export const getVideos = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = { userId: req.user._id };
    if (status) {
      query.status = status;
    }

    const videos = await Video.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Video.countDocuments(query);

    res.status(200).json({
      message: 'Videos retrieved successfully',
      videos: videos.map(v => ({
        _id: v._id,
        title: v.title,
        description: v.description,
        status: v.status,
        sensitivity: v.sensitivity,
        fileSize: v.fileSize,
        views: v.views,
        uploadedAt: v.uploadedAt,
        processedAt: v.processedAt,
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({ message: 'Failed to retrieve videos' });
  }
};

export const getVideoDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findById(id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Check authorization
    if (video.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Get processing job details
    const job = await ProcessingJob.findOne({ videoId: id });

    res.status(200).json({
      message: 'Video details retrieved successfully',
      video: {
        id: video._id,
        title: video.title,
        description: video.description,
        status: video.status,
        sensitivity: video.sensitivity,
        fileSize: video.fileSize,
        duration: video.duration,
        views: video.views,
        uploadedAt: video.uploadedAt,
        processedAt: video.processedAt,
      },
      job: job ? {
        jobId: job.jobId,
        progress: job.progress,
        status: job.status,
        stage: job.stage,
      } : null,
    });
  } catch (error) {
    console.error('Get video details error:', error);
    res.status(500).json({ message: 'Failed to retrieve video details' });
  }
};

export const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findById(id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Check authorization
    if (video.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Delete file
    const filePath = path.join('uploads', video.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete video document
    await Video.findByIdAndDelete(id);

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        totalVideos: -1,
        totalStorage: -video.fileSize,
      },
    });

    res.status(200).json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ message: 'Failed to delete video' });
  }
};

export const streamVideo = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findById(id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Check authorization
    if (video.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const filePath = path.join('uploads', video.filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Video file not found' });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    // Update views
    await Video.findByIdAndUpdate(id, { $inc: { views: 1 } });

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': video.mimeType,
      });

      fs.createReadStream(filePath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': video.mimeType,
      });

      fs.createReadStream(filePath).pipe(res);
    }
  } catch (error) {
    console.error('Stream video error:', error);
    res.status(500).json({ message: 'Failed to stream video' });
  }
};

// Helper function to simulate video processing
function simulateVideoProcessing(videoId, jobId) {
  const stages = [
    { stage: 'extracting_metadata', duration: 3000 },
    { stage: 'analyzing_content', duration: 5000 },
    { stage: 'generating_thumbnail', duration: 2000 },
    { stage: 'optimizing', duration: 4000 },
  ];

  let currentStage = 0;
  let currentProgress = 0;

  const processStage = async () => {
    if (currentStage >= stages.length) {
      // Complete processing
      await ProcessingJob.findByIdAndUpdate(jobId, {
        status: 'completed',
        progress: 100,
        stage: 'completed',
        completedAt: new Date(),
      });

      // Simulate sensitivity analysis
      const sensitivityScore = Math.floor(Math.random() * 100);
      let classification = 'safe';
      const reasons = [];

      if (sensitivityScore > 75) {
        classification = 'flagged';
        reasons.push('Adult content detected');
      } else if (sensitivityScore > 50) {
        classification = 'warning';
        reasons.push('Content may need review');
      }

      // Update video with final status
      await Video.findByIdAndUpdate(videoId, {
        status: classification === 'flagged' ? 'flagged' : 'completed',
        processedAt: new Date(),
        duration: '12:45',
        sensitivity: {
          classification,
          score: sensitivityScore,
          reasons,
        },
      });

      return;
    }

    const { stage, duration } = stages[currentStage];

    // Update job with current stage
    await ProcessingJob.findByIdAndUpdate(jobId, {
      status: 'processing',
      stage,
      progress: Math.round((currentStage / stages.length) * 100),
      startedAt: currentStage === 0 ? new Date() : undefined,
    });

    currentProgress = Math.round((currentStage / stages.length) * 100);
    currentStage++;

    // Simulate processing time
    setTimeout(processStage, duration);
  };

  processStage();
}

export const getJobProgress = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await ProcessingJob.findOne({ jobId });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.status(200).json({
      message: 'Job progress retrieved successfully',
      job: {
        jobId: job.jobId,
        progress: job.progress,
        status: job.status,
        stage: job.stage,
      },
    });
  } catch (error) {
    console.error('Get job progress error:', error);
    res.status(500).json({ message: 'Failed to retrieve job progress' });
  }
};
