import mongoose from 'mongoose';

const shareSchema = new mongoose.Schema({
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true,
  },
  sharedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sharedWithEmail: {
    type: String,
    required: true,
    lowercase: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please enter a valid email'],
  },
  sharedWithUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  role: {
    type: String,
    enum: ['viewer', 'editor'],
    default: 'viewer',
  },
  canDownload: {
    type: Boolean,
    default: false,
  },
  canComment: {
    type: Boolean,
    default: false,
  },
  sharedAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

// Index for faster queries
shareSchema.index({ videoId: 1 });
shareSchema.index({ sharedWithEmail: 1 });
shareSchema.index({ sharedWithUser: 1 });

export default mongoose.model('Share', shareSchema);
