import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Users, Check, AlertCircle } from 'lucide-react';
import { shareAPI } from '../services/api';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  videoTitle: string;
  onShareSuccess: () => void;
}

interface Share {
  id: string;
  email: string;
  role: string;
  userName: string;
  sharedAt: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  videoId,
  videoTitle,
  onShareSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [shares, setShares] = useState<Share[]>([]);
  const [loading, setLoading] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'share' | 'manage'>('share');

  useEffect(() => {
    if (isOpen && activeTab === 'manage') {
      loadShares();
    }
  }, [isOpen, activeTab]);

  const loadShares = async () => {
    try {
      setLoading(true);
      const response: any = await shareAPI.getVideoShares(videoId);
      setShares(response.data.shares || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load shares');
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return emailRegex.test(email);
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setShareLoading(true);
      await shareAPI.shareVideo(videoId, email, role);
      setSuccess(`Video shared with ${email} as ${role}`);
      setEmail('');
      setRole('viewer');
      onShareSuccess();
      setTimeout(() => {
        setActiveTab('manage');
        setSuccess('');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to share video');
    } finally {
      setShareLoading(false);
    }
  };

  const handleRemoveShare = async (shareId: string) => {
    if (!window.confirm('Remove this share?')) return;

    try {
      await shareAPI.unshareVideo(shareId);
      setShares(shares.filter(s => s.id !== shareId));
      setSuccess('Share removed successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove share');
    }
  };

  const handleUpdateRole = async (shareId: string, newRole: string) => {
    try {
      await shareAPI.updateShare(shareId, newRole);
      setShares(shares.map(s => (s.id === shareId ? { ...s, role: newRole } : s)));
      setSuccess('Role updated successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update role');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">Share Video</h2>
                <p className="text-sm text-neutral-600 mt-1">{videoTitle}</p>
              </div>
              <button
                onClick={onClose}
                className="text-neutral-400 hover:text-neutral-600 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-neutral-200">
              <button
                onClick={() => setActiveTab('share')}
                className={`flex-1 py-4 px-6 font-medium text-center transition ${
                  activeTab === 'share'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Share
              </button>
              <button
                onClick={() => setActiveTab('manage')}
                className={`flex-1 py-4 px-6 font-medium text-center transition ${
                  activeTab === 'manage'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Manage
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Share Tab */}
              {activeTab === 'share' && (
                <form onSubmit={handleShare} className="space-y-4">
                  {error && (
                    <motion.div
                      className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{error}</p>
                    </motion.div>
                  )}

                  {success && (
                    <motion.div
                      className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-3"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Check size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-green-700">{success}</p>
                    </motion.div>
                  )}

                  {/* Email Input */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-900 mb-2">
                      <div className="flex items-center gap-2">
                        <Mail size={16} />
                        Email Address
                      </div>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      placeholder="user@example.com"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    />
                  </div>

                  {/* Role Selection */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-900 mb-2">
                      <div className="flex items-center gap-2">
                        <Users size={16} />
                        Role
                      </div>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['viewer', 'editor'].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRole(r)}
                          className={`py-2 px-3 rounded-lg font-medium transition ${
                            role === r
                              ? 'bg-primary-100 text-primary-700 border-2 border-primary-600'
                              : 'bg-neutral-100 text-neutral-700 border-2 border-neutral-200 hover:border-primary-300'
                          }`}
                        >
                          {r.charAt(0).toUpperCase() + r.slice(1)}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-neutral-500 mt-2">
                      {role === 'viewer'
                        ? 'Can only watch the video'
                        : 'Can watch and edit the video'}
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={shareLoading || !email.trim()}
                    className="w-full bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 transition disabled:bg-neutral-300 disabled:cursor-not-allowed"
                  >
                    {shareLoading ? 'Sharing...' : 'Share Video'}
                  </button>
                </form>
              )}

              {/* Manage Tab */}
              {activeTab === 'manage' && (
                <div className="space-y-4">
                  {error && (
                    <motion.div
                      className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{error}</p>
                    </motion.div>
                  )}

                  {success && (
                    <motion.div
                      className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-3"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Check size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-green-700">{success}</p>
                    </motion.div>
                  )}

                  {loading ? (
                    <div className="flex justify-center py-6">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                  ) : shares.length === 0 ? (
                    <p className="text-center text-neutral-500 py-6">
                      No shares yet. Share this video with someone to see them here.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {shares.map((share) => (
                        <motion.div
                          key={share.id}
                          className="border border-neutral-200 rounded-lg p-4"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-medium text-neutral-900">{share.userName}</p>
                              <p className="text-sm text-neutral-500">{share.email}</p>
                            </div>
                            <button
                              onClick={() => handleRemoveShare(share.id)}
                              className="text-red-600 hover:text-red-700 font-medium text-sm"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="flex gap-2">
                            {['viewer', 'editor'].map((r) => (
                              <button
                                key={r}
                                onClick={() => handleUpdateRole(share.id, r)}
                                className={`px-3 py-1 rounded text-xs font-medium transition ${
                                  share.role === r
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                }`}
                              >
                                {r.charAt(0).toUpperCase() + r.slice(1)}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
