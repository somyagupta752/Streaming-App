import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Film,
  Clock,
  AlertCircle,
  TrendingUp,
  PlayCircle,
  Plus,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { videoAPI } from '../services/api';

interface Video {
  _id: string;
  title: string;
  status: 'processing' | 'completed' | 'flagged' | 'uploaded';
  progress: number;
  fileSize: number;
  duration?: number;
  uploadedAt: string;
  jobId?: string;
}

export const Dashboard: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [stats, setStats] = useState({
    totalVideos: 0,
    processingVideos: 0,
    flaggedVideos: 0,
    storageUsed: '0 GB',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  // Get processing video IDs and jobIds for polling
  const processingVideoIds = useMemo(() => {
    return videos
      .filter(v => v.status === 'processing' && v.jobId)
      .map(v => ({ id: v._id, jobId: v.jobId! }));
  }, [videos]);

  // Poll for progress updates on processing videos
  useEffect(() => {
    if (processingVideoIds.length === 0) {
      return;
    }

    const updateProgress = async () => {
      try {
        const progressPromises = processingVideoIds.map(async ({ id, jobId }) => {
          try {
            const response = await videoAPI.getJobProgress(jobId);
            return {
              id,
              progress: response.data.job.progress,
              status: response.data.job.status,
            };
          } catch (err) {
            console.error(`Error fetching progress for video ${id}:`, err);
            return null;
          }
        });

        const results = await Promise.all(progressPromises);
        
        setVideos(prevVideos => {
          let needsReload = false;
          const updatedVideos = prevVideos.map(video => {
            const result = results.find(r => r && r.id === video._id);
            if (result) {
              // Update progress and status if job is completed
              const newStatus = result.status === 'completed' ? 'completed' : video.status;
              if (result.status === 'completed' && video.status === 'processing') {
                needsReload = true;
              }
              return {
                ...video,
                progress: result.progress,
                status: newStatus as Video['status'],
              };
            }
            return video;
          });

          // If any videos completed, reload dashboard to get updated status
          if (needsReload) {
            setTimeout(() => loadDashboard(), 100);
          }

          return updatedVideos;
        });
      } catch (err) {
        console.error('Error updating progress:', err);
      }
    };

    // Update immediately
    updateProgress();

    // Poll every 2 seconds
    const interval = setInterval(updateProgress, 2000);

    return () => clearInterval(interval);
  }, [processingVideoIds]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      
      // Load all videos to calculate stats
      const response = await videoAPI.getVideos({ limit: 50 });
      const allVideos = response.data.videos || [];
      
      // Get recent videos (first 3)
      const recentVideos = allVideos.slice(0, 3);
      
      // Calculate stats
      const totalVideos = allVideos.length;
      const processingVideos = allVideos.filter((v: any) => v.status === 'processing').length;
      const flaggedVideos = allVideos.filter((v: any) => v.status === 'flagged').length;
      const totalSize = allVideos.reduce((sum: number, v: any) => sum + (v.fileSize || 0), 0);
      
      // Format storage
      const formatSize = (bytes: number) => {
        const gb = bytes / (1024 * 1024 * 1024);
        return gb.toFixed(2) + ' GB';
      };

      // Fetch progress for processing videos
      const videosWithProgress = await Promise.all(
        recentVideos.map(async (v: any) => {
          let progress = v.status === 'completed' ? 100 : 0;
          
          // If processing and has jobId, fetch current progress
          if (v.status === 'processing' && v.jobId) {
            try {
              const progressResponse = await videoAPI.getJobProgress(v.jobId);
              progress = progressResponse.data.job.progress || 0;
            } catch (err) {
              console.error(`Error fetching progress for video ${v._id}:`, err);
              progress = 0;
            }
          }
          
          return {
            ...v,
            progress,
          };
        })
      );

      setVideos(videosWithProgress);
      
      setStats({
        totalVideos,
        processingVideos,
        flaggedVideos,
        storageUsed: formatSize(totalSize),
      });
      
      setError('');
    } catch (err: any) {
      console.error('Error loading dashboard:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success-50 text-success-700';
      case 'processing':
        return 'bg-warning-50 text-warning-700';
      case 'flagged':
        return 'bg-danger-50 text-danger-700';
      default:
        return 'bg-neutral-50 text-neutral-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'processing':
        return '⏳';
      case 'flagged':
        return '⚠';
      default:
        return '•';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Unknown';
      }
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);
      
      if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } catch (e) {
      return 'Unknown';
    }
  };

  const handlePlayVideo = (videoId: string) => {
    const token = localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const videoStreamUrl = `${apiUrl}/videos/${videoId}/stream?token=${token}`;
    window.open(videoStreamUrl, 'VideoPlayer', 'width=1200,height=800');
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-primary-50/20 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h1 className="mb-2">Welcome Back!</h1>
              <p className="text-neutral-600">
                Here's what's happening with your videos today.
              </p>
            </div>
            <Link to="/upload" className="btn-primary gap-2 w-fit">
              <Plus className="w-5 h-5" />
              Upload Video
            </Link>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-danger-50 border border-danger-200 rounded-lg text-danger-700 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
            <p className="text-neutral-600 mt-4">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <motion.div
              className="grid md:grid-cols-4 gap-6 mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, staggerChildren: 0.1 }}
            >
              {[
                { icon: Film, label: 'Total Videos', value: stats.totalVideos, color: 'primary' },
                { icon: Clock, label: 'Processing', value: stats.processingVideos, color: 'warning' },
                { icon: AlertCircle, label: 'Flagged', value: stats.flaggedVideos, color: 'danger' },
                { icon: TrendingUp, label: 'Storage Used', value: stats.storageUsed, color: 'accent' },
              ].map((stat, idx) => {
                const Icon = stat.icon;
                const colorClass = {
                  primary: 'from-primary-600/20 to-primary-600/5 text-primary-600',
                  warning: 'from-warning-600/20 to-warning-600/5 text-warning-600',
                  danger: 'from-danger-600/20 to-danger-600/5 text-danger-600',
                  accent: 'from-accent-600/20 to-accent-600/5 text-accent-600',
                }[stat.color];

                return (
                  <motion.div
                    key={idx}
                    className="card"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div className={`inline-flex p-3 bg-gradient-to-br rounded-lg mb-3 ${colorClass}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <p className="text-neutral-600 text-sm mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-neutral-900">
                      {stat.value}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Recent Videos */}
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="mb-6">
                <h2>Recent Videos</h2>
                <p className="text-neutral-600 mt-1">Your latest uploads and their processing status</p>
              </div>

              {videos.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-neutral-600 mb-4">No videos uploaded yet</p>
                  <Link to="/upload" className="btn-primary">
                    Upload Your First Video
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {videos.map((video, idx) => (
                    <motion.div
                      key={video._id}
                      className="p-4 border border-neutral-200 rounded-lg hover:border-primary-300 hover:shadow-card transition-all duration-300 group"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <PlayCircle className="w-5 h-5 text-primary-600 flex-shrink-0" />
                            <h4 className="font-semibold truncate group-hover:text-primary-700 transition-colors">
                              {video.title}
                            </h4>
                            <span className={`badge ${getStatusColor(video.status)} flex-shrink-0`}>
                              {getStatusIcon(video.status)} {video.status}
                            </span>
                          </div>

                          {/* Progress Bar */}
                          {video.status === 'processing' && (
                            <div className="mb-2">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-neutral-600">Processing</span>
                                <span className="text-xs font-semibold text-neutral-700">
                                  {video.progress}%
                                </span>
                              </div>
                              <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full bg-gradient-to-r from-warning-600 to-accent-500"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${video.progress}%` }}
                                  transition={{ duration: 0.5 }}
                                />
                              </div>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-4 text-xs text-neutral-600">
                            <span>{formatFileSize(video.fileSize)}</span>
                            {video.duration && <span>{video.duration}s</span>}
                            <span>{formatDate(video.uploadedAt)}</span>
                          </div>
                        </div>

                        <button 
                          onClick={() => handlePlayVideo(video._id)}
                          className="btn-secondary p-2 h-fit opacity-0 group-hover:opacity-100 transition-opacity hover:shadow-md"
                        >
                          <PlayCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="mt-6 text-center">
                <Link to="/library" className="text-primary-600 font-semibold hover:text-primary-700">
                  View All Videos →
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};
