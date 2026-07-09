import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  BookOpen,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  HelpCircle
} from 'lucide-react';

const StudentCourses = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regMessage, setRegMessage] = useState(null);
  const [regError, setRegError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const student = user?.student;

  const fetchCourseData = async () => {
    if (!student?._id) return;
    try {
      const regRes = await api.get(`/registrations/student/${student._id}`);
      setRegistrations(regRes.data);

      const availRes = await api.get('/courses/available');
      setAvailableCourses(availRes.data);
    } catch (error) {
      console.error('Error fetching student course data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [student]);

  const handleSelfRegister = async (courseId) => {
    setActionLoading(true);
    setRegMessage(null);
    setRegError(null);
    try {
      await api.post('/registrations/register', {
        studentId: student._id,
        courseIds: [courseId],
      });
      setRegMessage('Course registration completed successfully!');
      fetchCourseData();
    } catch (error) {
      setRegError(error.response?.data?.message || 'Registration failed.');
    } finally {
      setActionLoading(false);
    }
  };

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
          Course Registration & Curriculum
        </h1>
        <p className="text-sm font-medium text-slate-500">
          View your currently enrolled subjects and register for pending courses.
        </p>
      </div>

      {regError && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-500 max-w-2xl">
          <AlertCircle size={14} />
          <span>{regError}</span>
        </div>
      )}

      {regMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-600 max-w-2xl">
          <CheckCircle size={14} />
          <span>{regMessage}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3 max-w-6xl">
        {/* Enrolled Courses */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-outfit text-sm font-bold text-slate-705 dark:text-slate-200 uppercase tracking-wider">
            Enrolled Subjects ({registrations.length})
          </h3>

          {registrations.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
              <BookOpen className="mx-auto text-slate-350 mb-3" size={32} />
              <p className="text-xs font-semibold text-slate-400">You are not registered in any course.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {registrations.map((reg) => (
                <div
                  key={reg._id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between hover-lift dark:border-slate-800 dark:bg-slate-900"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-outfit text-xs font-black text-brand-500 uppercase tracking-wider">
                        {reg.course.courseCode}
                      </span>
                      <span className="rounded-lg bg-slate-50 border px-2 py-0.5 text-[9px] font-bold text-slate-500 uppercase dark:bg-slate-950 dark:border-slate-800">
                        {reg.course.credits} Credits
                      </span>
                    </div>
                    <h4 className="font-outfit text-sm font-bold text-slate-850 dark:text-slate-200 leading-snug">
                      {reg.course.title}
                    </h4>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                      Sem {reg.semester} • {reg.course.department}
                    </p>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t flex justify-between items-center text-[10px] font-semibold text-slate-400 dark:border-slate-800">
                    <span>Grade: <strong className="text-slate-700 dark:text-slate-300 font-bold">{reg.grade}</strong></span>
                    <span>Attendance: <strong className="text-slate-700 dark:text-slate-300 font-bold">{reg.attendance}%</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Registrations */}
        <div className="space-y-4">
          <h3 className="font-outfit text-sm font-bold text-slate-705 dark:text-slate-200 uppercase tracking-wider">
            Available Registrations
          </h3>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <p className="text-xs font-semibold text-slate-400 leading-normal">
              Register for available courses for your department and current semester:
            </p>

            {availableCourses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-slate-300 dark:text-slate-650">
                <HelpCircle size={28} />
                <p className="text-[11px] font-bold text-slate-450 mt-1.5">No new courses available to register.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto pr-1">
                {availableCourses.map((course) => (
                  <div key={course._id} className="py-3 flex items-center justify-between gap-3">
                    <div className="overflow-hidden">
                      <span className="font-outfit text-[10px] font-black text-brand-500 uppercase">
                        {course.courseCode} ({course.credits} Cr)
                      </span>
                      <h5 className="text-xs font-bold text-slate-850 dark:text-slate-250 truncate leading-snug">
                        {course.title}
                      </h5>
                    </div>
                    <button
                      onClick={() => handleSelfRegister(course._id)}
                      disabled={actionLoading}
                      className="rounded-lg p-1.5 text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950/20 transition-colors"
                      title="Register Course"
                    >
                      <PlusCircle size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCourses;
