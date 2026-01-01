import React from 'react';
import { Zap, Menu, X, LogOut, User } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthed = !!localStorage.getItem('token');
  const user = isAuthed ? JSON.parse(localStorage.getItem('user') || '{}') : null;

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/library', label: 'Library' },
    { path: '/shared-with-me', label: 'Shared' },
    { path: '/upload', label: 'Upload' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2 bg-gradient-to-br from-primary-600 to-accent-500 rounded-lg group-hover:shadow-glow transition-all duration-300">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="hidden sm:inline text-gradient font-bold text-xl">VideoVault</span>
          </Link>

          {/* Desktop Navigation */}
          {isAuthed && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive(link.path)
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-neutral-600 hover:text-primary-700 hover:bg-neutral-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Auth Actions */}
          <div className="flex items-center gap-4">
            {isAuthed ? (
              <>
                <Link
                  to="/profile"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-neutral-700">{user?.name || 'User'}</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="hidden sm:inline btn-ghost">
                  Sign In
                </Link>
                <Link to="/register" className="hidden sm:inline btn-primary">
                  Get Started
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden btn-ghost"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-neutral-200 py-4 space-y-2">
            {isAuthed && (
              <>
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isActive(link.path)
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="border-t border-neutral-100 mt-4 pt-4 space-y-2">
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 transition-colors rounded-lg"
                  >
                    View Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors rounded-lg"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            )}
            {!isAuthed && (
              <>
                <Link to="/login" className="block px-4 py-2 text-center font-medium text-primary-700 hover:bg-neutral-50 rounded-lg">
                  Sign In
                </Link>
                <Link to="/register" className="block px-4 py-2 text-center btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
