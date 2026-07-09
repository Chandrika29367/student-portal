import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Award, BookOpen, GraduationCap } from 'lucide-react';

const StudentResults = () => {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSem, setActiveSem] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!user?.student?._id) return;
      try {
        const res = await api.get(`/results/student/${user.student._id}`);
        setResults(res.data);
        if (res.data.length > 0) {
          // Set active semester tab as the latest semester result available
          setActiveSem(res.data[res.data.length - 1].semester);
        }
      } catch (error) {
        console.error('Error fetching results details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-outfit text-2xl font-bold text-slate-800 dark:text-slate-200">
            My Semester Results
          </h1>
          <p className="text-sm font-medium text-slate-500">
            View your semester grades, SGPA reports and CGPA records.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900 max-w-2xl">
          <GraduationCap className="mx-auto text-slate-300 mb-3" size={36} />
          <p className="text-xs font-semibold text-slate-400">
            Academic results have not been posted for your courses yet.
          </p>
        </div>
      </div>
    );
  }

  const activeResultObj = results.find((r) => r.semester === activeSem);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="font-outfit text-2xl font-bold text-slate-800 dark:text-slate-200">
          My Semester Results
        </h1>
        <p className="text-sm font-medium text-slate-500">
          View your semester grades, SGPA reports and CGPA records.
        </p>
      </div>

      {/* Semester selection tabs */}
      <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800 gap-1">
        {results.map((r) => (
          <button
            key={r.semester}
            onClick={() => setActiveSem(r.semester)}
            className={`px-5 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeSem === r.semester
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-650'
            }`}
          >
            Semester {r.semester}
          </button>
        ))}
      </div>

      {activeResultObj && (
        <div className="grid gap-6 md:grid-cols-3 max-w-5xl">
          {/* GPA status card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 h-fit space-y-6">
            <h3 className="font-outfit text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Performance Index
            </h3>

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                <Award size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Semester SGPA</p>
                <p className="font-outfit text-2xl font-black text-slate-800 dark:text-white">
                  {activeResultObj.sgpa?.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <GraduationCap size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Cumulative CGPA</p>
                <p className="font-outfit text-2xl font-black text-slate-800 dark:text-white">
                  {activeResultObj.cgpaAtSemester?.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Grades grid sheet table */}
          <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-900 md:col-span-2">
            <div className="border-b p-4 bg-slate-50/50 dark:bg-slate-950/20 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-705 dark:text-slate-250 uppercase tracking-wider">
                Subjects Mark Sheet
              </h3>
            </div>
            
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/40">
                  <th className="px-5 py-3">Subject / Code</th>
                  <th className="px-5 py-3">Credits</th>
                  <th className="px-5 py-3">Marks</th>
                  <th className="px-5 py-3 text-right">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {activeResultObj.grades.map((g) => (
                  <tr key={g._id} className="hover:bg-slate-50/10">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="font-bold text-slate-800 dark:text-slate-200 leading-tight">
                        {g.course?.title || 'Subject Lecture'}
                      </div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        {g.course?.courseCode || 'N/A'}
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-slate-500 font-semibold">
                      {g.course?.credits || 3} Credits
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-slate-500 font-semibold">
                      {g.marks} / 100
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap font-black font-outfit text-brand-600 dark:text-brand-400">
                      {g.grade}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentResults;
