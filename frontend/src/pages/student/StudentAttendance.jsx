import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Calendar, CheckSquare, AlertCircle } from 'lucide-react';

const StudentAttendance = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!user?.student?._id) return;
      try {
        const res = await api.get(`/attendance/student/${user.student._id}`);
        setData(res.data);
      } catch (error) {
        console.error('Error fetching attendance details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900">
        <p className="font-medium text-slate-500">Failed to load attendance summary.</p>
      </div>
    );
  }

  const { overallPercentage, totalLogs, presentLogs, courseStats, logs } = data;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="font-outfit text-2xl font-bold text-slate-800 dark:text-slate-200">
          My Attendance Records
        </h1>
        <p className="text-sm font-medium text-slate-500">
          Verify your daily class attendance logs and overall course percentages.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 max-w-5xl">
        {/* Attendance Summary Circle */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900 h-fit">
          <h3 className="font-outfit text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-6">
            Overall Attendance
          </h3>
          
          <div className="relative inline-flex items-center justify-center mb-6">
            {/* Simple SVG circular progress bar */}
            <svg className="h-32 w-32 shrink-0">
              <circle
                className="text-slate-100 dark:text-slate-800"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r="52"
                cx="64"
                cy="64"
              />
              <circle
                className={overallPercentage >= 75 ? 'text-emerald-500' : 'text-rose-500'}
                strokeWidth="8"
                strokeDasharray={326.5}
                strokeDashoffset={326.5 - (326.5 * overallPercentage) / 100}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="52"
                cx="64"
                cy="64"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="font-outfit text-2xl font-black text-slate-850 dark:text-white">
                {overallPercentage}%
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase">
                Overall
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t pt-5 dark:border-slate-800 text-xs">
            <div>
              <p className="text-slate-400 mb-0.5">Total Logs</p>
              <strong className="text-slate-700 dark:text-slate-200">{totalLogs} Classes</strong>
            </div>
            <div>
              <p className="text-slate-400 mb-0.5">Attended</p>
              <strong className="text-slate-700 dark:text-slate-200">{presentLogs} Days</strong>
            </div>
          </div>

          {overallPercentage < 75 && (
            <div className="mt-6 flex items-start gap-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 text-[11px] text-rose-500 text-left">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p className="font-semibold leading-normal">
                Attendance is below the minimum required 75%. Please contact your counselor.
              </p>
            </div>
          )}
        </div>

        {/* Course-wise Breakdown & Logs */}
        <div className="md:col-span-2 space-y-6">
          {/* Table */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b p-4 bg-slate-50/50 dark:bg-slate-950/20 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-705 dark:text-slate-250 uppercase tracking-wider">
                Course-wise Breakdown
              </h3>
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/40">
                  <th className="px-5 py-3">Course</th>
                  <th className="px-5 py-3">Schedules Logged</th>
                  <th className="px-5 py-3 text-right">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {courseStats.map((c) => (
                  <tr key={c.courseId} className="hover:bg-slate-50/10">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="font-outfit font-bold text-slate-800 dark:text-slate-255">
                        {c.courseTitle}
                      </div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        {c.courseCode}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-500 font-semibold">
                      {c.presentClasses} / {c.totalClasses} classes
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap font-black font-outfit text-slate-800 dark:text-white">
                      <span className={c.percentage >= 75 ? 'text-emerald-500' : 'text-rose-500'}>
                        {c.percentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Daily logs summary */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-xs font-bold text-slate-705 dark:text-slate-250 uppercase tracking-wider mb-4">
              Recent Attendance Reports (Last 10 Logs)
            </h3>
            
            <div className="space-y-3.5">
              {logs.slice(0, 10).map((log) => (
                <div key={log._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 text-xs">
                  <div className="flex items-center gap-3">
                    <Calendar size={14} className="text-slate-400 shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-250">
                        {log.course?.title || 'Course Lecture'}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-semibold">
                        {new Date(log.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                      log.status === 'Present'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                        : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400'
                    }`}
                  >
                    {log.status}
                  </span>
                </div>
              ))}
              {logs.length === 0 && (
                <p className="text-center py-4 text-slate-400">No attendance reports recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance;
