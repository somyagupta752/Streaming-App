import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Play,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Clock,
  User,
  Edit2,
} from 'lucide-react';
import { shareAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { EditModal } from '../components/EditModal';

interface SharedVideo {
  _id: string;
  title: string;
  description: string;
  status: 'uploaded' | 'processing' | 'completed' | 'flagged';
  fileSize: number;
  duration?: number;
  uploadedAt: string;
  sharedBy: string;
  sharedByEmail: string;
  sharedRole: 'viewer' | 'editor';
  sharedAt: string;
  sensitivity?: {
    classification: string;
    score: number;
  };
}

export const SharedWithMe: React.FC = () => {
  const [videos, setVideos] = useState<SharedVideo[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<SharedVideo[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [editModal, setEditModal] = useState<{ isOpen: boolean; videoId?: string; title?: string; description?: string }>({
    isOpen: false,
  });

  useEffect(() => {
    loadSharedVideos();
  }, [currentPage]);

  const loadSharedVideos = async () => {
    try {
      setLoading(true);
      const params: any = { page: currentPage, limit: 12 };
      const response: any = await shareAPI.getSharedVideos(params);
      setVideos(response.data.videos || []);
      setTotalPages(response.data.pagination?.pages || 1);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load shared videos');
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = videos;
    if (search) {
      filtered = filtered.filter(v =>
        v.title.toLowerCase().includes(search.toLowerCase()) ||
        v.sharedBy.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (roleFilter !== 'all') {
      filtered = filtered.filter(v => v.sharedRole === roleFilter);
    }
    setFilteredVideos(filtered);
  }, [videos, search, roleFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success-50 text-success-600';
      case 'processing':
        return 'bg-warning-50 text-warning-600';
      case 'flagged':
        return 'bg-danger-50 text-danger-600';
      default:
        return 'bg-neutral-50 text-neutral-600';
    }
  };

  const getRoleColor = (role: string) => {
    return role === 'editor'
      ? 'bg-blue-50 text-blue-700'
      : 'bg-purple-50 text-purple-700';
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
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
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
        {/* Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="mb-2">Shared With Me</h1>
            <p className="text-neutral-600">
              Videos shared by others
            </p>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          className="mb-8 space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3.5 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search videos or people..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10 w-full"
              />
            </div>

            {/* Filter */}
            <div className="flex gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="input-field px-4 py-3 bg-white border border-neutral-200"
              >
                <option value="all">All Roles</option>
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-danger-50 border border-danger-200 rounded-lg text-danger-700 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Videos Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
            <p className="text-neutral-600 mt-4">Loading shared videos...</p>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-600 mb-4">No videos shared with you yet</p>
            <Link to="/library" className="btn-primary">
              Go to My Library
            </Link>
          </div>
        ) : (
          <>
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {filteredVideos.map((video, idx) => (
                <motion.div
                  key={video._id}
                  className="card group overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  {/* Thumbnail */}
                  <div className="relative mb-4 bg-gradient-to-br from-primary-100 to-accent-100 rounded-lg aspect-video flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => handlePlayVideo(video._id)}>
                    <Play className="w-12 h-12 text-primary-600/30" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                      <button onClick={() => handlePlayVideo(video._id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-3 bg-white rounded-full shadow-lg hover:shadow-xl">
                        <Play className="w-6 h-6 text-primary-600 fill-current" />
                      </button>
                    </div>
                    <span className={`absolute top-2 right-2 badge ${getStatusColor(video.status)}`}>
                      {video.status}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="space-y-3">
                    <h3 className="font-semibold line-clamp-2 group-hover:text-primary-700 transition-colors">
                      {video.title}
                    </h3>

                    {/* Shared By */}
                    <div className="text-sm bg-neutral-50 rounded-lg p-2 flex items-center gap-2">
                      <User className="w-4 h-4 text-neutral-600" />
                      <div>
                        <p className="text-neutral-700 font-medium">{video.sharedBy}</p>
                        <p className="text-xs text-neutral-500">{video.sharedByEmail}</p>
                      </div>
                    </div>

                    {/* Role Badge */}
                    <div className="flex gap-2 items-center">
                      <span className={`badge px-2 py-1 text-xs font-medium rounded ${getRoleColor(video.sharedRole)}`}>
                        {video.sharedRole === 'editor' ? 'Can Edit' : 'View Only'}
                      </span>
                      <span className="text-xs text-neutral-500">
                        Shared {formatDate(video.sharedAt)}
                      </span>
                    </div>

                    {video.sensitivity && (
                      <div className="text-sm text-neutral-600">
                        <p>Sensitivity: <span className="font-semibold">{video.sensitivity.classification}</span></p>
                        <p className="text-xs">Score: {video.sensitivity.score}%</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-neutral-600">
                      <span>{formatFileSize(video.fileSize)}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(video.uploadedAt)}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => handlePlayVideo(video._id)} className="flex-1 btn-secondary py-2 text-sm gap-2 flex items-center justify-center hover:shadow-lg transition-shadow">
                        <Play className="w-4 h-4" />
                        Play
                      </button>
                      {video.sharedRole === 'editor' && (
                        <button
                          onClick={() => setEditModal({ isOpen: true, videoId: video._id, title: video.title, description: video.description })}
                          className="btn-ghost py-2 px-3 flex items-center justify-center"
                          title="Edit video details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-neutral-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Modal */}
      <EditModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false })}
        videoId={editModal.videoId || ''}
        initialTitle={editModal.title || ''}
        initialDescription={editModal.description || ''}
        onEditSuccess={loadSharedVideos}
      />
    </div>
  );
};
