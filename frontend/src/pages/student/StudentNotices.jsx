import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Megaphone, Calendar } from 'lucide-react';

const StudentNotices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await api.get('/notices');
        setNotices(res.data);
      } catch (error) {
        console.error('Error fetching notices', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotices();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="font-outfit text-2xl font-bold text-slate-800 dark:text-slate-200">
          Campus Notice Bulletin
        </h1>
        <p className="text-sm font-medium text-slate-500">
          Stay updated with important announcements and guidelines from college admin.
        </p>
      </div>

      {notices.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900 max-w-2xl">
          <Megaphone className="mx-auto text-slate-350 mb-3" size={32} />
          <p className="text-xs font-semibold text-slate-400">Bulletin is clean. No recent notices.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 max-w-5xl">
          {notices.map((notice) => (
            <div
              key={notice._id}
              className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between hover-lift dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-brand-600 dark:bg-brand-950/20 dark:text-brand-400">
                    {notice.targetDepartment === 'All' ? 'General Notice' : 'Department News'}
                  </span>
                  
                  <span className="flex items-center gap-1 text-[9px] font-semibold text-slate-400">
                    <Calendar size={11} />
                    {new Date(notice.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-outfit text-sm font-bold text-slate-805 dark:text-slate-200 leading-snug">
                  {notice.title}
                </h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-3 whitespace-pre-line leading-relaxed">
                  {notice.content}
                </p>
              </div>

              <div className="flex justify-between items-center mt-5 pt-3 border-t text-[10px] font-semibold text-slate-400 dark:border-slate-800/80">
                <span>Issued by: {notice.publishedBy?.username || 'Administrative Desk'}</span>
                <span>Time: {new Date(notice.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentNotices;
