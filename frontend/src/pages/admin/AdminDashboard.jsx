import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  Users,
  BookOpen,
  GraduationCap,
  CreditCard,
  TrendingUp,
  Megaphone,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const COLORS = ['#5677fc', '#3b51f5', '#6366f1', '#818cf8', '#a5b4fc'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsRes = await api.get('/dashboard/admin');
        const noticesRes = await api.get('/notices');
        setStats(statsRes.data);
        setNotices(noticesRes.data.slice(0, 3)); // show top 3 notices
      } catch (error) {
        console.error('Error fetching admin stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900">
        <p className="font-medium text-slate-500">Failed to load statistics.</p>
      </div>
    );
  }

  const metricCards = [
    { name: 'Total Students', value: stats.totalStudents, icon: Users, color: 'from-blue-500/10 to-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20' },
    { name: 'Active Courses', value: stats.totalCourses, icon: BookOpen, color: 'from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
    { name: 'Departments', value: stats.totalDepartments, icon: GraduationCap, color: 'from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
    { name: 'Average CGPA', value: stats.averageCgpa, icon: TrendingUp, color: 'from-violet-500/10 to-purple-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20' },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="font-outfit text-2xl font-bold text-slate-800 dark:text-slate-200">
          Dashboard Overview
        </h1>
        <p className="text-sm font-medium text-slate-500">
          Analytics, statistics and notifications for University operations.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.name}
              className={`rounded-2xl border bg-gradient-to-br p-5 hover-lift transition-all dark:bg-slate-900/40 ${card.color}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {card.name}
                  </p>
                  <p className="font-outfit text-3xl font-black mt-2 text-slate-800 dark:text-white">
                    {card.value}
                  </p>
                </div>
                <div className="rounded-xl bg-white p-3 shadow-sm dark:bg-slate-800">
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* CGPA Distribution Bar Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <h3 className="font-outfit text-base font-bold text-slate-800 dark:text-slate-200 mb-4">
            CGPA Grade Distribution
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.cgpaStats}>
                <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                  contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#5677fc" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department wise distribution Pie Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-outfit text-base font-bold text-slate-800 dark:text-slate-200 mb-4">
            Student Distribution by Department
          </h3>
          <div className="h-72 w-full flex flex-col justify-center">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.departmentStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {stats.departmentStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Custom Legend */}
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-semibold px-2 overflow-y-auto max-h-16">
              {stats.departmentStats.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1.5 truncate">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></span>
                  <span className="truncate">{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Fees status & Notices */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Fees Status Overview */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <h3 className="font-outfit text-base font-bold text-slate-800 dark:text-slate-200 mb-2">
              Fee Collection Status
            </h3>
            <p className="text-xs font-semibold text-slate-400 mb-4">
              Current Semester invoices payment comparison
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6 my-auto">
            <div className="h-32 w-32 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Paid', value: stats.feeStats.paid },
                      { name: 'Pending', value: stats.feeStats.pending }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={55}
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#f43f5e" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between border-b pb-2 dark:border-slate-800">
                <span className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                  Paid Dues
                </span>
                <span className="text-sm font-black text-slate-800 dark:text-white">
                  {stats.feeStats.paid} Students
                </span>
              </div>
              <div className="flex items-center justify-between border-b pb-2 dark:border-slate-800">
                <span className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
                  Pending Dues
                </span>
                <span className="text-sm font-black text-slate-800 dark:text-white">
                  {stats.feeStats.pending} Students
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <CreditCard size={14} /> Total Collected
                </span>
                <span className="text-sm font-black text-emerald-500">
                  ₹{stats.feeStats.totalCollected?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notices Bulletin */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-outfit text-base font-bold text-slate-800 dark:text-slate-200">
              Bulletin Announcements
            </h3>
            <Megaphone size={18} className="text-brand-500" />
          </div>
          <div className="space-y-4">
            {notices.length === 0 ? (
              <p className="text-center py-6 text-xs text-slate-400">No recent announcements.</p>
            ) : (
              notices.map((notice) => (
                <div
                  key={notice._id}
                  className="rounded-xl bg-slate-50 border border-slate-100 p-3.5 hover:bg-slate-100/50 transition-colors dark:bg-slate-950/40 dark:border-slate-800/60 dark:hover:bg-slate-950/80"
                >
                  <div className="flex items-center gap-2 text-[10px] font-bold text-brand-500 uppercase tracking-wider mb-1">
                    <span>{notice.targetDepartment === 'All' ? 'General' : notice.targetDepartment}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={10} />
                      {new Date(notice.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug truncate">
                    {notice.title}
                  </h4>
                  <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1 line-clamp-2">
                    {notice.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
