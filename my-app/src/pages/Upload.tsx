import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload as UploadIcon,
  CheckCircle,
  AlertCircle,
  X,
  Zap,
  File,
  Loader,
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

  const handleResetForm = () => {
    setFiles([]);
    setUploadedCount(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-primary-50/20 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="inline-flex p-2.5 bg-gradient-to-br from-primary-600 to-accent-500 rounded-lg">
              <UploadIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Upload Videos</h1>
              <p className="text-neutral-600 text-sm mt-1">
                Upload and process your videos with automatic optimization
              </p>
            </div>
          </div>
        </motion.div>

        {generalError && (
          <motion.div
            className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-lg text-danger-700 flex items-center gap-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{generalError}</span>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Upload Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <label
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`block card cursor-pointer transition-all duration-300 border-2 ${
                  isDragActive
                    ? 'border-primary-500 bg-primary-50/80 shadow-lg'
                    : 'border-dashed border-neutral-300 hover:border-primary-400 hover:bg-primary-50/40'
                }`}
              >
                <div className="p-12 text-center">
                  <motion.div
                    animate={{ scale: isDragActive ? 1.15 : 1, y: isDragActive ? -6 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="inline-flex p-4 bg-gradient-to-br from-primary-100 to-accent-100 rounded-2xl mb-4"
                  >
                    <UploadIcon
                      className={`w-10 h-10 transition-colors ${
                        isDragActive ? 'text-primary-600' : 'text-primary-500'
                      }`}
                    />
                  </motion.div>

                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                    {isDragActive ? 'Drop your videos here' : 'Drag and drop videos here'}
                  </h3>
                  <p className="text-neutral-600 mb-4">
                    or <span className="font-semibold text-primary-600 cursor-pointer">click to browse</span>
                  </p>

                  <input
                    type="file"
                    multiple
                    accept="video/*"
                    onChange={handleChange}
                    className="hidden"
                  />

                  <p className="text-xs text-neutral-500">
                    Supports MP4, WebM, MOV, AVI • Max 2GB per file
                  </p>
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
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-200">
                    <div>
                      <h2 className="text-lg font-bold text-neutral-900">
                        Upload Progress
                      </h2>
                      <p className="text-sm text-neutral-600 mt-1">
                        {uploadedCount} of {files.length} completed
                      </p>
                    </div>
                    {allCompleted && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                      >
                        <CheckCircle className="w-8 h-8 text-success-600" />
                      </motion.div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {files.map((file, idx) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-4 border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors group"
                      >
                        <div className="flex items-start gap-4">
                          {/* Status Icon */}
                          <div className="mt-0.5 flex-shrink-0">
                            {file.status === 'completed' && (
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 200 }}
                              >
                                <CheckCircle className="w-6 h-6 text-success-600" />
                              </motion.div>
                            )}
                            {file.status === 'uploading' && (
                              <div className="w-6 h-6 rounded-full border-2 border-primary-600 border-t-transparent animate-spin" />
                            )}
                            {file.status === 'processing' && (
                              <div className="w-6 h-6 rounded-full border-2 border-warning-600 border-t-transparent animate-spin" />
                            )}
                            {file.status === 'error' && (
                              <AlertCircle className="w-6 h-6 text-danger-600" />
                            )}
                          </div>

                          {/* File Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <File className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                                <h4 className="font-semibold text-neutral-900 truncate">
                                  {file.name}
                                </h4>
                              </div>
                              {file.status !== 'uploading' &&
                                file.status !== 'processing' && (
                                  <button
                                    onClick={() => removeFile(file.id)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-danger-50 rounded text-danger-600 flex-shrink-0"
                                    title="Remove file"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                            </div>

                            <div className="flex items-center justify-between gap-3 mb-2">
                              <p className="text-sm text-neutral-600">
                                {file.size}
                              </p>
                              <p className="text-xs font-medium text-neutral-500">
                                {file.status === 'uploading' && (
                                  <span className="text-primary-600">{file.progress}%</span>
                                )}
                                {file.status === 'processing' && (
                                  <span className="text-warning-600 flex items-center gap-1">
                                    <Loader className="w-3 h-3 animate-spin" />
                                    Processing...
                                  </span>
                                )}
                                {file.status === 'completed' && (
                                  <span className="text-success-600">✓ Completed</span>
                                )}
                                {file.status === 'error' && (
                                  <span className="text-danger-600">{file.error}</span>
                                )}
                              </p>
                            </div>

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
                                  transition={{ duration: 0.5, ease: 'easeOut' }}
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
                      className="mt-6 pt-6 border-t border-neutral-200 p-4 bg-success-50 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div>
                        <p className="font-semibold text-success-700">
                          All videos processed successfully!
                        </p>
                        <p className="text-sm text-success-600 mt-1">
                          Your videos are ready to stream and share
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleResetForm}
                          className="btn-secondary whitespace-nowrap"
                        >
                          Upload More
                        </button>
                        <button
                          onClick={() => navigate('/library')}
                          className="btn-success whitespace-nowrap"
                        >
                          View Library
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar Info */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="card bg-primary-50/50 border-primary-200 sticky top-8">
              <div className="flex gap-3 mb-0">
                <Zap className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-primary-900 mb-4">Processing</h3>
                  <ul className="space-y-3 text-xs text-primary-800">
                    <li className="flex items-start gap-2">
                      <span className="text-primary-600 font-bold mt-0.5">✓</span>
                      <span>Automatic format optimization</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary-600 font-bold mt-0.5">✓</span>
                      <span>Metadata extraction</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary-600 font-bold mt-0.5">✓</span>
                      <span>Sensitivity analysis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary-600 font-bold mt-0.5">✓</span>
                      <span>Streaming optimization</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
