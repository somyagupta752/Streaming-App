import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, LogOut, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UserData {
  _id: string;
  fullName: string;
  email: string;
  createdAt: string;
}

export const Profile: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Unknown';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-primary-50/20 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Profile Card */}
        <motion.div
          className="card p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header with Avatar */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-neutral-200">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white shadow-lg">
              <User className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">{user.fullName}</h1>
              <p className="text-neutral-600 mt-1">{user.email}</p>
            </div>
          </div>

          {/* Profile Details */}
          <div className="space-y-6">
            {/* Name */}
            <motion.div
              className="flex items-start gap-4 p-4 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="p-3 bg-blue-100 rounded-lg">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600 font-medium">Full Name</p>
                <p className="text-lg text-neutral-900 font-semibold mt-1">{user.fullName}</p>
              </div>
            </motion.div>

            {/* Email */}
            <motion.div
              className="flex items-start gap-4 p-4 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="p-3 bg-green-100 rounded-lg">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600 font-medium">Email Address</p>
                <p className="text-lg text-neutral-900 font-semibold mt-1">{user.email}</p>
              </div>
            </motion.div>

            {/* Member Since */}
            {user.createdAt && (
              <motion.div
                className="flex items-start gap-4 p-4 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-neutral-600 font-medium">Member Since</p>
                  <p className="text-lg text-neutral-900 font-semibold mt-1">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Logout Button */}
          <motion.button
            onClick={handleLogout}
            className="w-full mt-8 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <LogOut className="w-5 h-5" />
            Logout
          </motion.button>
        </motion.div>

        {/* Account Info */}
        <motion.div
          className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="font-semibold text-blue-900 mb-2">Account Information</h3>
          <p className="text-sm text-blue-800">
            Your account is secure and protected. All your videos and shares are safely stored.
          </p>
        </motion.div>
      </div>
    </div>
  );
};
