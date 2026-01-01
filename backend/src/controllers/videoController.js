import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import Video from '../models/Video.js';
import ProcessingJob from '../models/ProcessingJob.js';
import User from '../models/User.js';
import { extractFrames, cleanupFrames } from '../utils/frameExtractor.js';
import { analyzeFrames } from '../utils/frameAnalyzer.js';
import { classifyContent } from '../utils/contentClassifier.js';

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

    // Check authorization - owner or shared user
    const isOwner = video.userId.toString() === req.user._id.toString();
    const isSharedUser = video.sharedWith.some(
      s => s.userId && s.userId.toString() === req.user._id.toString()
    );

    if (!isOwner && !isSharedUser) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Get processing job details (only for owner)
    let job = null;
    if (isOwner) {
      job = await ProcessingJob.findOne({ videoId: id });
    }

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
      isOwner,
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

export const updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    if (!title && !description) {
      return res.status(400).json({ message: 'At least title or description is required' });
    }

    const video = await Video.findById(id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Check authorization - owner or editor role user can update
    const isOwner = video.userId.toString() === req.user._id.toString();
    const isEditorShared = video.sharedWith.some(
      s => s.userId && s.userId.toString() === req.user._id.toString() && s.role === 'editor'
    );

    if (!isOwner && !isEditorShared) {
      return res.status(403).json({ message: 'Unauthorized. Only video owner or editor role user can edit' });
    }

    // Update fields
    if (title) {
      video.title = title.trim();
    }
    if (description) {
      video.description = description.trim();
    }

    await video.save();

    res.status(200).json({
      message: 'Video updated successfully',
      video: {
        id: video._id,
        title: video.title,
        description: video.description,
        updatedAt: video.updatedAt,
      },
    });
  } catch (error) {
    console.error('Update video error:', error);
    res.status(500).json({ message: 'Failed to update video', error: error.message });
  }
};

export const streamVideo = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findById(id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Check authorization - owner or shared user
    const isOwner = video.userId.toString() === req.user._id.toString();
    const isSharedUser = video.sharedWith.some(
      s => s.userId && s.userId.toString() === req.user._id.toString()
    );

    if (!isOwner && !isSharedUser) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const filePath = path.join('uploads', video.filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Video file not found' });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    // Ensure we have a reasonable mime type for streaming clients
    const ext = path.extname(filePath).toLowerCase();
    let mimeType = video.mimeType;
    if (!mimeType) {
      if (ext === '.mov') mimeType = 'video/quicktime';
      else if (ext === '.webm') mimeType = 'video/webm';
      else if (ext === '.ogv' || ext === '.ogg') mimeType = 'video/ogg';
      else if (ext === '.avi') mimeType = 'video/x-msvideo';
      else mimeType = 'video/mp4';
    }

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
        'Content-Type': mimeType,
        'Content-Disposition': 'inline',
      });

      fs.createReadStream(filePath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': mimeType,
        'Content-Disposition': 'inline',
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
    { stage: 'extracting_metadata', duration: 2000 },
    { stage: 'analyzing_content', duration: 3000 },
    { stage: 'classifying_content', duration: 4000 },
    { stage: 'generating_thumbnail', duration: 2000 },
  ];

  let currentStage = 0;
  let currentProgress = 0;

  const processStage = async () => {
    if (currentStage >= stages.length) {
      // Perform content classification
      try {
        const video = await Video.findById(videoId);
        if (!video) {
          throw new Error('Video not found');
        }

        let videoPath = path.join('uploads', video.filename);

        // If uploaded file is not MP4, transcode to MP4 for browser compatibility
        const { transcodeToMp4 } = await import('../utils/transcode.js');
        const ext = path.extname(videoPath).toLowerCase();
        if (ext !== '.mp4') {
          try {
            const mp4Name = `${path.parse(video.filename).name}.mp4`;
            const mp4Path = path.join('uploads', mp4Name);
            console.log('Transcoding to mp4:', videoPath, '->', mp4Path);
            await transcodeToMp4(videoPath, mp4Path, {
              onProgress: (p) => {
                // Optionally update job progress based on transcoding
                ProcessingJob.findByIdAndUpdate(jobId, { progress: 10 });
              },
            });

            // Update DB to point to MP4
            const stats = fs.statSync(mp4Path);
            await Video.findByIdAndUpdate(videoId, {
              filename: mp4Name,
              mimeType: 'video/mp4',
              fileSize: stats.size,
            });

            // Remove original file to save space
            try {
              if (fs.existsSync(videoPath) && videoPath !== mp4Path) fs.unlinkSync(videoPath);
            } catch (e) {
              console.warn('Failed to delete original file after transcode:', e.message || e);
            }

            videoPath = mp4Path;
            console.log('Transcode completed, using:', videoPath);
          } catch (err) {
            console.warn('Transcode failed, continuing with original file:', err.message || err);
          }
        }

        // Extract frames every 2 seconds, max 30 frames
        console.log('Extracting frames from video...');
        const framePaths = await extractFrames(videoPath, 2, 30);
        console.log(`Extracted ${framePaths.length} frames`);

        // Analyze frames
        console.log('Analyzing frames...');
        const frameAnalysis = await analyzeFrames(framePaths);
        console.log('Frame analysis complete:', frameAnalysis);

        // Classify content based on heuristics
        console.log('Classifying content...');
        const classification = await classifyContent(videoPath, frameAnalysis);
        console.log('Classification complete:', classification);

        // Clean up extracted frames
        cleanupFrames(framePaths);

        // Update video with classification results
        await Video.findByIdAndUpdate(videoId, {
          status: classification.classification === 'flagged' ? 'flagged' : 'completed',
          processedAt: new Date(),
          duration: formatDuration(classification.metadata.duration),
          sensitivity: {
            classification: classification.classification,
            score: classification.score,
            reasons: classification.reasons,
          },
        });

        // Complete processing
        await ProcessingJob.findByIdAndUpdate(jobId, {
          status: 'completed',
          progress: 100,
          stage: 'completed',
          completedAt: new Date(),
        });

        console.log(
          `Video ${videoId} classification: ${classification.classification} (score: ${classification.score})`
        );
      } catch (err) {
        console.error('Content classification error:', err);

        // Fallback: mark as completed with safe classification
        await ProcessingJob.findByIdAndUpdate(jobId, {
          status: 'completed',
          progress: 100,
          stage: 'completed',
          completedAt: new Date(),
        });

        await Video.findByIdAndUpdate(videoId, {
          status: 'completed',
          processedAt: new Date(),
          duration: '0:00',
          sensitivity: {
            classification: 'safe',
            score: 0,
            reasons: ['Classification encountered errors, defaulting to safe'],
          },
        });
      }

      return;
    }

    const { stage, duration } = stages[currentStage];

    // Update job with current stage
    await ProcessingJob.findByIdAndUpdate(jobId, {
      status: 'processing',
      stage,
      progress: Math.round(((currentStage + 1) / stages.length) * 100),
      startedAt: currentStage === 0 ? new Date() : undefined,
    });

    currentProgress = Math.round(((currentStage + 1) / stages.length) * 100);
    currentStage++;

    // Simulate processing time
    setTimeout(processStage, duration);
  };

  processStage();
}

/**
 * Format duration in seconds to HH:MM:SS format
 */
function formatDuration(seconds) {
  if (!seconds || seconds === 0) return '0:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
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
