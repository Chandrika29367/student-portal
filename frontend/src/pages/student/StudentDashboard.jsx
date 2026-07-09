import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  TrendingUp,
  Calendar,
  BookOpen,
  CreditCard,
  Megaphone,
  CheckSquare
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentStats = async () => {
      if (!user?.student?._id) return;
      try {
        const res = await api.get(`/dashboard/student/${user.student._id}`);
        setStats(res.data);
      } catch (error) {
        console.error('Error fetching student stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentStats();
  }, [user]);

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
        <p className="font-medium text-slate-500">Failed to load dashboard metrics.</p>
      </div>
    );
  }

  const { student, registeredCoursesCount, pendingFeesCount, gpaHistory, notices } = stats;

  const cardData = [
    { name: 'Cumulative CGPA', value: student.cgpa?.toFixed(2) || '0.00', sub: 'Academic standing', icon: TrendingUp, color: 'from-blue-500/10 to-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20' },
    { name: 'Average Attendance', value: `${student.attendancePercentage}%`, sub: 'Current semester', icon: CheckSquare, color: student.attendancePercentage >= 75 ? 'from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'from-rose-500/10 to-pink-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' },
    { name: 'Enrolled Courses', value: registeredCoursesCount, sub: 'Active subjects', icon: BookOpen, color: 'from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
    { name: 'Pending Dues', value: pendingFeesCount > 0 ? `${pendingFeesCount} Invoice` : 'None', sub: 'Accounts invoice', color: pendingFeesCount > 0 ? 'from-rose-500/10 to-pink-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' : 'from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-brand-950 to-indigo-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-500/10 blur-2xl"></div>
        <div className="relative max-w-lg space-y-2">
          <span className="rounded-full bg-brand-500/20 border border-brand-500/30 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-brand-300">
            {student.department} • Semester {student.semester}
          </span>
          <h1 className="font-outfit text-xl sm:text-2xl font-bold tracking-tight">
            Welcome back, {student.name}!
          </h1>
          <p className="text-xs font-semibold text-slate-400 leading-relaxed">
            Keep track of your classes, attendances, results, and billing. Make sure to review recent university notices below.
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cardData.map((card) => {
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
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {card.sub}
                  </span>
                </div>
                <div className="rounded-xl bg-white p-3 shadow-sm dark:bg-slate-800">
                  <Icon size={22} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* GPA Progress Area Chart */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 md:col-span-2">
          <h3 className="font-outfit text-base font-bold text-slate-800 dark:text-slate-200 mb-4">
            Academic Grade Progression
          </h3>
          <div className="h-64 w-full">
            {gpaHistory.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center">
                <p className="text-xs font-semibold text-slate-400">First semester - no historical grades recorded.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={gpaHistory}>
                  <defs>
                    <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5677fc" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#5677fc" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="semester" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} domain={[0, 10]} />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="sgpa" name="SGPA" stroke="#5677fc" strokeWidth={2} fillOpacity={1} fill="url(#colorGpa)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Notices Board for Student */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-outfit text-base font-bold text-slate-800 dark:text-slate-200">
              Bulletin Updates
            </h3>
            <Megaphone size={16} className="text-brand-500" />
          </div>
          <div className="space-y-4 max-h-[17rem] overflow-y-auto pr-1">
            {notices.length === 0 ? (
              <p className="text-center py-6 text-xs text-slate-400">No active notices.</p>
            ) : (
              notices.map((notice) => (
                <div
                  key={notice._id}
                  className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 hover:bg-slate-100/50 transition-colors dark:border-slate-800/80 dark:bg-slate-950/40"
                >
                  <div className="flex items-center justify-between gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    <span>{notice.targetDepartment === 'All' ? 'General' : 'Dept News'}</span>
                    <span className="flex items-center gap-0.5">
                      <Calendar size={10} />
                      {new Date(notice.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-850 dark:text-slate-200 leading-tight truncate">
                    {notice.title}
                  </h4>
                  <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
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

export default StudentDashboard;
