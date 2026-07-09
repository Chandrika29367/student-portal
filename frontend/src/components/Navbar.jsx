import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Menu, Sun, Moon, Bell } from 'lucide-react';

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/80 px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/85">
      {/* Sidebar toggle button */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <Menu size={20} />
        </button>
        <div className="hidden sm:block">
          <h2 className="font-outfit text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Portal Control
          </h2>
          <p className="font-outfit text-base font-bold text-slate-800 dark:text-slate-200">
            Welcome back, {user.role === 'admin' ? 'Admin' : user.student?.name}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">
            <Bell size={18} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-500"></span>
          </button>
        </div>

        {/* Vertical divider */}
        <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800"></div>

        {/* Quick Profile info */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {user.role === 'admin' ? 'University Admin' : user.student?.rollNumber}
            </p>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
              {user.role === 'admin' ? 'Administration' : user.student?.department}
            </p>
          </div>
          <img
            src={
              user.student?.profilePicture ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                user.role === 'admin' ? 'Admin' : user.student?.name || 'Student'
              )}`
            }
            alt="Avatar"
            className="h-9 w-9 rounded-xl object-cover ring-2 ring-brand-500/10"
          />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
