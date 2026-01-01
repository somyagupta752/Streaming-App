import Share from '../models/Share.js';
import Video from '../models/Video.js';
import User from '../models/User.js';

export const shareVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role } = req.body;

    // Validation
    if (!email || !role) {
      return res.status(400).json({ message: 'Email and role are required' });
    }

    if (!['viewer', 'editor'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be viewer or editor' });
    }

    // Check if email is valid
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check if user is trying to share with themselves
    if (req.user.email.toLowerCase() === email.toLowerCase()) {
      return res.status(400).json({ message: 'Cannot share video with yourself' });
    }

    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Check authorization - only owner can share
    if (video.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized. Only video owner can share' });
    }

    // Check if already shared with this email
    const existingShare = await Share.findOne({
      videoId: id,
      sharedWithEmail: email.toLowerCase(),
    });

    if (existingShare) {
      return res.status(400).json({ message: 'Video already shared with this email' });
    }

    // Find user with this email - MUST be registered
    // IMPORTANT: Check registration BEFORE creating any Share document
    const sharedWithUser = await User.findOne({ email: email.toLowerCase() });

    if (!sharedWithUser) {
      return res.status(400).json({ 
        message: 'User with this email is not registered. Please share only with registered users.' 
      });
    }

    // User is registered, now create the Share record
    const share = new Share({
      videoId: id,
      sharedBy: req.user._id,
      sharedWithEmail: email.toLowerCase(),
      sharedWithUser: sharedWithUser._id,
      role,
    });

    await share.save();

    // Update video sharedWith array
    video.sharedWith.push({
      userId: sharedWithUser._id,
      email: email.toLowerCase(),
      role,
      shareId: share._id,
    });

    await video.save();

    res.status(201).json({
      message: 'Video shared successfully',
      share: {
        id: share._id,
        videoId: share.videoId,
        email: share.sharedWithEmail,
        role: share.role,
        sharedAt: share.sharedAt,
      },
    });
  } catch (error) {
    console.error('Share video error:', error);
    res.status(500).json({ message: 'Failed to share video', error: error.message });
  }
};

export const getVideoShares = async (req, res) => {
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

    const shares = await Share.find({ videoId: id })
      .select('_id sharedWithEmail role sharedAt sharedWithUser')
      .populate('sharedWithUser', 'fullName email');

    res.status(200).json({
      message: 'Shares retrieved successfully',
      shares: shares.map(s => ({
        id: s._id,
        email: s.sharedWithEmail,
        role: s.role,
        userName: s.sharedWithUser?.fullName || 'Unregistered',
        sharedAt: s.sharedAt,
      })),
    });
  } catch (error) {
    console.error('Get shares error:', error);
    res.status(500).json({ message: 'Failed to retrieve shares' });
  }
};

export const updateShare = async (req, res) => {
  try {
    const { shareId } = req.params;
    const { role } = req.body;

    if (!['viewer', 'editor'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be viewer or editor' });
    }

    const share = await Share.findById(shareId);
    if (!share) {
      return res.status(404).json({ message: 'Share not found' });
    }

    // Check authorization
    if (share.sharedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    share.role = role;
    await share.save();

    // Update video sharedWith array
    const video = await Video.findById(share.videoId);
    const sharedWithIndex = video.sharedWith.findIndex(
      s => s.shareId.toString() === shareId
    );
    if (sharedWithIndex !== -1) {
      video.sharedWith[sharedWithIndex].role = role;
      await video.save();
    }

    res.status(200).json({
      message: 'Share updated successfully',
      share: {
        id: share._id,
        role: share.role,
      },
    });
  } catch (error) {
    console.error('Update share error:', error);
    res.status(500).json({ message: 'Failed to update share' });
  }
};

export const unshareVideo = async (req, res) => {
  try {
    const { shareId } = req.params;

    const share = await Share.findById(shareId);
    if (!share) {
      return res.status(404).json({ message: 'Share not found' });
    }

    // Check authorization
    if (share.sharedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Remove from video sharedWith array
    const video = await Video.findById(share.videoId);
    video.sharedWith = video.sharedWith.filter(
      s => s.shareId.toString() !== shareId
    );
    await video.save();

    // Delete share record
    await Share.findByIdAndDelete(shareId);

    res.status(200).json({
      message: 'Video unshared successfully',
    });
  } catch (error) {
    console.error('Unshare video error:', error);
    res.status(500).json({ message: 'Failed to unshare video' });
  }
};

export const getSharedVideos = async (req, res) => {
  try {
    const userEmail = req.user.email.toLowerCase();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Get all shares for current user's email
    const shares = await Share.find({
      $or: [
        { sharedWithEmail: userEmail },
        { sharedWithUser: req.user._id },
      ],
    });

    const videoIds = shares.map(s => s.videoId);

    // Get videos
    const videos = await Video.find({ _id: { $in: videoIds } })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'fullName email');

    const total = videoIds.length;

    // Enrich videos with share info
    const videosWithShareInfo = videos.map(video => {
      const share = shares.find(s => s.videoId.toString() === video._id.toString());
      return {
        _id: video._id,
        title: video.title,
        description: video.description,
        status: video.status,
        sensitivity: video.sensitivity,
        fileSize: video.fileSize,
        duration: video.duration,
        views: video.views,
        uploadedAt: video.uploadedAt,
        sharedBy: video.userId.fullName,
        sharedByEmail: video.userId.email,
        sharedRole: share?.role || 'viewer',
        sharedAt: share?.sharedAt,
      };
    });

    res.status(200).json({
      message: 'Shared videos retrieved successfully',
      videos: videosWithShareInfo,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get shared videos error:', error);
    res.status(500).json({ message: 'Failed to retrieve shared videos' });
  }
};
