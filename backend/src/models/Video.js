import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Video title is required'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    default: '0:00',
  },
  status: {
    type: String,
    enum: ['uploaded', 'processing', 'completed', 'flagged', 'error'],
    default: 'processing',
  },
  sensitivity: {
    classification: {
      type: String,
      enum: ['safe', 'warning', 'flagged'],
      default: 'safe',
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    reasons: {
      type: [String],
      default: [],
    },
  },
  views: {
    type: Number,
    default: 0,
  },
  tags: [String],
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  processedAt: {
    type: Date,
    default: null,
  },
  sharedWith: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      email: {
        type: String,
        lowercase: true,
      },
      role: {
        type: String,
        enum: ['viewer', 'editor'],
        default: 'viewer',
      },
      shareId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Share',
      },
    },
  ],
}, { timestamps: true });

// Index for faster queries
videoSchema.index({ userId: 1, uploadedAt: -1 });
videoSchema.index({ status: 1 });

export default mongoose.model('Video', videoSchema);
