import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

// Video endpoints
export const videoAPI = {
  upload: (formData: any) =>
    api.post('/videos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getVideos: (params: any) => api.get('/videos', { params }),
  getVideoDetails: (id: any) => api.get(`/videos/${id}`),
  updateVideo: (id: any, data: any) => api.patch(`/videos/${id}`, data),
  deleteVideo: (id: any) => api.delete(`/videos/${id}`),
  streamVideo: (id: any) => api.get(`/videos/${id}/stream`),
  getJobProgress: (jobId: any) => api.get(`/videos/job/${jobId}/progress`),
};

// Sharing endpoints
export const shareAPI = {
  shareVideo: (videoId: any, email: string, role: string) =>
    api.post(`/videos/${videoId}/share`, { email, role }),
  getVideoShares: (videoId: any) => api.get(`/videos/${videoId}/shares`),
  updateShare: (shareId: any, role: string) =>
    api.put(`/shares/${shareId}`, { role }),
  unshareVideo: (shareId: any) => api.delete(`/shares/${shareId}`),
  getSharedVideos: (params: any) => api.get('/shared', { params }),
};

export default api;
