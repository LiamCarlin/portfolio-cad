'use client';

import React, { useState, useEffect } from 'react';
import { X, Lock, LogOut, Edit2 } from 'lucide-react';
import { usePortfolioStore } from '@/store/usePortfolioStore';

// Admin password - in production, use environment variables and proper auth
const ADMIN_PASSWORD = 'admin123'; // Change this!

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const { setAuthenticated } = usePortfolioStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setPassword('');
      onClose();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lock className="text-blue-500" size={20} />
            <h2 className="text-lg font-bold text-white">Admin Login</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className={`w-full bg-gray-800 border rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 text-white ${
                error ? 'border-red-500' : 'border-gray-700'
              }`}
              autoFocus
            />
            {error && (
              <p className="text-red-400 text-sm mt-2">Incorrect password</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Login
          </button>
        </form>
        
        <p className="text-xs text-gray-500 text-center mt-4">
          Login to enable edit mode
        </p>
      </div>
    </div>
  );
}

// User menu dropdown component
export function UserMenu() {
  const [showMenu, setShowMenu] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const { isAuthenticated, editMode, toggleEditMode, logout, theme } = usePortfolioStore();
  
  const lightMode = theme === 'light';

  // Check for existing auth on mount
  useEffect(() => {
    const auth = sessionStorage.getItem('admin-auth');
    if (auth === 'true') {
      usePortfolioStore.getState().setAuthenticated(true);
    }
  }, []);

  return (
    <>
      <div className="relative">
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className={`p-2 rounded transition-colors relative ${
            isAuthenticated 
              ? 'text-blue-400 hover:text-blue-300 hover:bg-gray-800' 
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          {isAuthenticated ? (
            <div className="relative">
              <Edit2 size={16} />
              {editMode && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
              )}
            </div>
          ) : (
            <Lock size={16} />
          )}
        </button>
        
        {showMenu && (
          <div 
            className={`absolute right-0 top-full mt-1 w-48 rounded-lg shadow-xl border z-50 ${
              lightMode ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'
            }`}
          >
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => {
                    toggleEditMode();
                    setShowMenu(false);
                  }}
                  className={`w-full px-4 py-3 text-left text-sm flex items-center gap-3 ${
                    lightMode 
                      ? 'hover:bg-gray-100 text-gray-700' 
                      : 'hover:bg-gray-700 text-gray-200'
                  }`}
                >
                  <Edit2 size={16} className={editMode ? 'text-green-500' : ''} />
                  {editMode ? 'Disable Edit Mode' : 'Enable Edit Mode'}
                </button>
                <div className={`border-t ${lightMode ? 'border-gray-200' : 'border-gray-700'}`} />
                <button
                  onClick={() => {
                    logout();
                    setShowMenu(false);
                  }}
                  className={`w-full px-4 py-3 text-left text-sm flex items-center gap-3 ${
                    lightMode 
                      ? 'hover:bg-gray-100 text-red-600' 
                      : 'hover:bg-gray-700 text-red-400'
                  }`}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setShowLogin(true);
                  setShowMenu(false);
                }}
                className={`w-full px-4 py-3 text-left text-sm flex items-center gap-3 ${
                  lightMode 
                    ? 'hover:bg-gray-100 text-gray-700' 
                    : 'hover:bg-gray-700 text-gray-200'
                }`}
              >
                <Lock size={16} />
                Admin Login
              </button>
            )}
          </div>
        )}
      </div>
      
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
      
      {/* Click outside to close */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowMenu(false)}
        />
      )}
    </>
  );
}

// Edit button for inline editing
interface EditButtonProps {
  onClick: () => void;
  className?: string;
}

export function EditButton({ onClick, className = '' }: EditButtonProps) {
  const { editMode } = usePortfolioStore();
  
  if (!editMode) return null;
  
  return (
    <button
      onClick={onClick}
      className={`p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg transition-colors ${className}`}
      title="Edit"
    >
      <Edit2 size={14} />
    </button>
  );
}

// Edit Mode Banner
export function EditModeBanner() {
  const { editMode, toggleEditMode, theme } = usePortfolioStore();
  
  if (!editMode) return null;
  
  const lightMode = theme === 'light';
  
  return (
    <div className={`${lightMode ? 'bg-blue-50 border-blue-200' : 'bg-blue-900/30 border-blue-700'} border-b px-4 py-2 flex items-center justify-between`}>
      <div className="flex items-center gap-2">
        <Edit2 size={16} className="text-blue-500" />
        <span className={`text-sm font-medium ${lightMode ? 'text-blue-700' : 'text-blue-400'}`}>
          Edit Mode Active
        </span>
        <span className={`text-xs ${lightMode ? 'text-blue-600' : 'text-blue-500'}`}>
          — Click edit buttons to modify content
        </span>
      </div>
      <button
        onClick={toggleEditMode}
        className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
      >
        Exit Edit Mode
      </button>
    </div>
  );
}
