import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload as UploadIcon,
  CheckCircle,
  AlertCircle,
  X,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

export const Upload: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [generalError, setGeneralError] = useState('');
  const navigate = useNavigate();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const processFiles = (fileList: FileList) => {
    const newFiles: UploadedFile[] = [];
    
    Array.from(fileList).forEach((file) => {
      // Check if it's a video file
      if (!file.type.startsWith('video/')) {
        setGeneralError('Only video files are allowed');
        return;
      }

      const id = Date.now().toString() + Math.random();
      const size = (file.size / (1024 * 1024)).toFixed(2);

      const uploadedFile: UploadedFile = {
        id,
        name: file.name,
        size: `${size} MB`,
        progress: 0,
        status: 'uploading',
      };

      newFiles.push(uploadedFile);

      // Start upload
      uploadFile(uploadedFile, file);
    });

    setFiles(prev => [...prev, ...newFiles]);
  };

  const uploadFile = async (fileData: UploadedFile, file: File) => {
    try {
      setGeneralError('');

      const formData = new FormData();
      formData.append('video', file);
      formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
      formData.append('description', `Uploaded on ${new Date().toLocaleDateString()}`);

      // Create an XMLHttpRequest to track progress
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setFiles(prev =>
            prev.map(f =>
              f.id === fileData.id ? { ...f, progress: Math.round(progress) } : f
            )
          );
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status === 200 || xhr.status === 201) {
          setFiles(prev =>
            prev.map(f =>
              f.id === fileData.id
                ? { ...f, progress: 100, status: 'processing' }
                : f
            )
          );

          // Simulate processing delay
          setTimeout(() => {
            setFiles(prev =>
              prev.map(f =>
                f.id === fileData.id
                  ? { ...f, status: 'completed' }
                  : f
              )
            );
            setUploadedCount(prev => prev + 1);
          }, 2000);
        } else {
          const error = JSON.parse(xhr.responseText);
          setFiles(prev =>
            prev.map(f =>
              f.id === fileData.id
                ? {
                    ...f,
                    status: 'error',
                    error: error.message || 'Upload failed',
                  }
                : f
            )
          );
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        setFiles(prev =>
          prev.map(f =>
            f.id === fileData.id
              ? { ...f, status: 'error', error: 'Network error' }
              : f
          )
        );
      });

      // Send request
      const token = localStorage.getItem('token');
      xhr.open('POST', `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/videos/upload`);
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      xhr.send(formData);
    } catch (err: any) {
      setGeneralError(err.message || 'Upload failed');
      setFiles(prev =>
        prev.map(f =>
          f.id === fileData.id
            ? { ...f, status: 'error', error: 'Upload failed' }
            : f
        )
      );
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    processFiles(e.dataTransfer.files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const allCompleted =
    files.length > 0 && files.every(f => f.status === 'completed');

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-primary-50/20 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="inline-flex p-2 bg-gradient-to-br from-primary-600 to-accent-500 rounded-lg">
              <UploadIcon className="w-6 h-6 text-white" />
            </div>
            <h1>Upload Videos</h1>
          </div>
          <p className="text-neutral-600">
            Upload and process your videos for sensitivity analysis
          </p>
        </motion.div>

        {generalError && (
          <motion.div
            className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-lg text-danger-700 flex items-center gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle className="w-5 h-5" />
            {generalError}
          </motion.div>
        )}

        {/* Upload Area */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <label
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`card cursor-pointer transition-all duration-300 ${
              isDragActive
                ? 'border-primary-500 bg-primary-50 shadow-glow'
                : 'border-neutral-200 hover:border-primary-300'
            }`}
          >
            <div className="p-12 text-center">
              <motion.div
                animate={{ scale: isDragActive ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
                className="inline-flex p-4 bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl mb-4"
              >
                <UploadIcon
                  className={`w-8 h-8 ${
                    isDragActive
                      ? 'text-primary-600'
                      : 'text-primary-500'
                  }`}
                />
              </motion.div>

              <h3 className="mb-2">Drag and drop your videos here</h3>
              <p className="text-neutral-600 mb-4">
                or click to select files (MP4, WebM, AVI, etc.)
              </p>

              <input
                type="file"
                multiple
                accept="video/*"
                onChange={handleChange}
                className="hidden"
              />

              <span className="text-xs text-neutral-500">
                Max 2GB per file
              </span>
            </div>
          </label>
        </motion.div>

        {/* Files List */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6">
                <h2>Uploads ({files.length})</h2>
                {uploadedCount > 0 && (
                  <p className="text-success-600 text-sm mt-1">
                    ✓ {uploadedCount} file{uploadedCount > 1 ? 's' : ''} completed
                  </p>
                )}
              </div>

              <div className="space-y-3">
                {files.map((file, idx) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors group"
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="mt-1">
                        {file.status === 'completed' && (
                          <CheckCircle className="w-5 h-5 text-success-600" />
                        )}
                        {file.status === 'uploading' && (
                          <div className="w-5 h-5 rounded-full border-2 border-primary-600 border-t-transparent animate-spin" />
                        )}
                        {file.status === 'processing' && (
                          <div className="w-5 h-5 rounded-full border-2 border-warning-600 border-t-transparent animate-spin" />
                        )}
                        {file.status === 'error' && (
                          <AlertCircle className="w-5 h-5 text-danger-600" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-semibold truncate text-neutral-900">
                            {file.name}
                          </h4>
                          {file.status !== 'uploading' &&
                            file.status !== 'processing' && (
                              <button
                                onClick={() => removeFile(file.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-danger-50 rounded text-danger-600"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                        </div>

                        <p className="text-sm text-neutral-600 mb-2">
                          {file.size}
                          {file.status === 'uploading' && ` • ${file.progress}%`}
                          {file.status === 'processing' && ' • Processing...'}
                          {file.status === 'completed' && ' • Completed'}
                          {file.status === 'error' && ` • ${file.error}`}
                        </p>

                        {/* Progress Bar */}
                        {(file.status === 'uploading' ||
                          file.status === 'processing') && (
                          <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full ${
                                file.status === 'uploading'
                                  ? 'bg-gradient-to-r from-primary-600 to-accent-500'
                                  : 'bg-gradient-to-r from-warning-600 to-accent-500'
                              }`}
                              initial={{ width: '0%' }}
                              animate={{
                                width:
                                  file.status === 'uploading'
                                    ? `${file.progress}%`
                                    : '100%',
                              }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {allCompleted && (
                <motion.div
                  className="mt-6 p-4 bg-success-50 border border-success-200 rounded-lg flex items-center justify-between"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div>
                    <p className="font-semibold text-success-700">
                      All files uploaded successfully!
                    </p>
                    <p className="text-sm text-success-600">
                      Your videos are being processed for sensitivity analysis
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/library')}
                    className="btn-success ml-4 whitespace-nowrap"
                  >
                    View Library
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tips */}
        {files.length === 0 && (
          <motion.div
            className="card bg-primary-50/50 border-primary-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex gap-4">
              <Zap className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="mb-2 text-primary-900">Processing Features</h3>
                <ul className="space-y-2 text-sm text-primary-800">
                  <li>✓ Automatic metadata extraction</li>
                  <li>✓ Sensitivity analysis and content classification</li>
                  <li>✓ Thumbnail generation</li>
                  <li>✓ Format optimization for streaming</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
