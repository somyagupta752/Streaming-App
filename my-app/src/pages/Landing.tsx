import React from 'react';
import { Link } from 'react-router-dom';
import {
  Upload,
  Play,
  Shield,
  Zap,
  Layers,
  Users,
  ArrowRight,
} from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export const Landing: React.FC = () => {
  const features = [
    {
      icon: Upload,
      title: 'Secure Upload',
      description: 'Upload videos securely with enterprise-grade encryption and validation.',
    },
    {
      icon: Zap,
      title: 'Real-time Processing',
      description: 'Get instant feedback on video processing with live progress tracking.',
    },
    {
      icon: Shield,
      title: 'Content Analysis',
      description: 'Intelligent sensitivity detection to classify and flag content automatically.',
    },
    {
      icon: Play,
      title: 'Smooth Streaming',
      description: 'Stream videos with adaptive bitrate and seamless playback experience.',
    },
    {
      icon: Layers,
      title: 'Multi-tenant',
      description: 'Enterprise-ready with complete data isolation and organization support.',
    },
    {
      icon: Users,
      title: 'Access Control',
      description: 'Role-based permissions for viewers, editors, and administrators.',
    },
  ];

  const steps = [
    { number: 1, title: 'Create Account', description: 'Sign up in seconds to get started' },
    { number: 2, title: 'Upload Video', description: 'Drag and drop your video file' },
    { number: 3, title: 'Real-time Processing', description: 'Watch live progress updates' },
    { number: 4, title: 'Stream & Share', description: 'Start streaming immediately' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 via-primary-50/30 to-neutral-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="mb-6">
              <span className="badge-primary">
                ✨ Welcome to VideoVault
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-gradient mb-6"
            >
              Upload, Analyze & Stream Videos with Confidence
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl text-neutral-600 mb-8 leading-relaxed"
            >
              Enterprise-grade video management platform with real-time processing, content analysis, and secure streaming. Perfect for content creators, teams, and organizations.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/register" className="btn-primary gap-2 group">
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="btn-secondary gap-2">
                <Play className="w-5 h-5" />
                Watch Demo
              </button>
            </motion.div>

            {/* Hero Stats */}
            <motion.div
              variants={itemVariants}
              className="mt-12 grid sm:grid-cols-3 gap-6 sm:gap-8"
            >
              {[
                { label: 'Active Users', value: '10K+' },
                { label: 'Videos Processed', value: '100K+' },
                { label: 'Uptime', value: '99.9%' },
              ].map((stat, idx) => (
                <div key={idx} className="text-center">
                  <p className="text-3xl sm:text-4xl font-bold text-gradient mb-2">
                    {stat.value}
                  </p>
                  <p className="text-neutral-600 text-sm">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero Image Placeholder */}
          <motion.div
            variants={itemVariants}
            className="mt-16 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-accent-500/20 rounded-2xl blur-3xl" />
            <div className="relative bg-white rounded-2xl border border-neutral-200 shadow-hover p-2">
              <div className="bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl aspect-video flex items-center justify-center">
                <Play className="w-16 h-16 text-primary-600/30" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mb-4">Powerful Features</h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Everything you need to manage, process, and stream videos at scale
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, staggerChildren: 0.1 }}
          >
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="card group hover:shadow-glow transition-all duration-300"
                >
                  <div className="inline-flex p-3 bg-gradient-to-br from-primary-600/10 to-accent-500/10 rounded-lg mb-4 group-hover:shadow-glow transition-all duration-300">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="mb-2">{feature.title}</h3>
                  <p className="text-neutral-600">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-32 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-4">How It Works</h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Get started in 4 simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary-600 to-transparent transform translate-y-8" />
                )}
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center text-white font-bold text-xl mb-4 shadow-lg">
                    {step.number}
                  </div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-neutral-600 text-sm">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="bg-gradient-to-r from-primary-600 to-accent-500 rounded-2xl p-12 text-white text-center relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute inset-0 bg-grid-pattern opacity-10" />
            <div className="relative z-10">
              <h2 className="mb-4 text-white">Ready to Get Started?</h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                Join thousands of creators and teams managing their video content efficiently.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 font-semibold rounded-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Create Your Account
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
