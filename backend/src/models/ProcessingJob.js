import mongoose from 'mongoose';

const processingJobSchema = new mongoose.Schema({
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  jobId: {
    type: String,
    unique: true,
    required: true,
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  status: {
    type: String,
    enum: ['queued', 'processing', 'completed', 'failed'],
    default: 'queued',
  },
  stage: {
    type: String,
    enum: ['extracting_metadata', 'analyzing_content', 'generating_thumbnail', 'optimizing', 'completed'],
    default: 'extracting_metadata',
  },
  errorMessage: {
    type: String,
    default: null,
  },
  startedAt: {
    type: Date,
    default: null,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Index for faster queries
processingJobSchema.index({ videoId: 1 });
processingJobSchema.index({ userId: 1 });
processingJobSchema.index({ status: 1 });

export default mongoose.model('ProcessingJob', processingJobSchema);
