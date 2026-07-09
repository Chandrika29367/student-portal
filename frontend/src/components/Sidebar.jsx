import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  CreditCard,
  CheckSquare,
  Megaphone,
  Settings,
  LogOut,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Students', path: '/admin/students', icon: Users },
    { name: 'Courses', path: '/admin/courses', icon: BookOpen },
    { name: 'Academics', path: '/admin/academics', icon: GraduationCap },
    { name: 'Fees & Dues', path: '/admin/fees', icon: CreditCard },
    { name: 'Announcements', path: '/admin/notices', icon: Megaphone },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const studentLinks = [
    { name: 'Dashboard', path: '/student', icon: LayoutDashboard },
    { name: 'My Profile', path: '/student/profile', icon: Users },
    { name: 'My Courses', path: '/student/courses', icon: BookOpen },
    { name: 'Attendance', path: '/student/attendance', icon: CheckSquare },
    { name: 'Academic Results', path: '/student/results', icon: GraduationCap },
    { name: 'Fee Details', path: '/student/fees', icon: CreditCard },
    { name: 'Notices', path: '/student/notices', icon: Megaphone },
    { name: 'Settings', path: '/student/settings', icon: Settings },
  ];

  const links = user.role === 'admin' ? adminLinks : studentLinks;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white border-r border-slate-200/80 transition-transform duration-300 dark:bg-slate-900 dark:border-slate-800 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white shadow-md shadow-brand-500/20 font-bold text-lg font-outfit">
              U
            </div>
            <span className="font-outfit text-lg font-bold tracking-tight bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent dark:from-brand-400 dark:to-indigo-400">
              CampusERP
            </span>
          </div>
          <button
            onClick={toggleSidebar}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 lg:hidden dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-950">
            <img
              src={
                user.student?.profilePicture ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                  user.role === 'admin' ? 'Admin User' : user.student?.name || 'Student'
                )}`
              }
              alt="Avatar"
              className="h-10 w-10 rounded-xl object-cover ring-2 ring-brand-500/20"
            />
            <div className="overflow-hidden">
              <h4 className="truncate font-outfit text-sm font-bold text-slate-800 dark:text-slate-200">
                {user.role === 'admin' ? 'Administrator' : user.student?.name}
              </h4>
              <p className="truncate text-xs font-medium text-slate-400 uppercase tracking-wider dark:text-slate-500">
                {user.role}
              </p>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.name}
                to={link.path}
                end={link.path === '/admin' || link.path === '/student'}
                onClick={() => {
                  if (window.innerWidth < 1024) toggleSidebar();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-50 text-brand-600 shadow-sm shadow-brand-500/5 dark:bg-brand-950/30 dark:text-brand-400'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-950/50 dark:hover:text-slate-200'
                  }`
                }
              >
                <Icon size={18} />
                <span>{link.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer logout */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
