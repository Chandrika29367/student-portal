import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, RefreshCw } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoBack = () => {
    if (!user) {
      navigate('/login');
    } else if (user.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/student');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 py-12 dark:bg-slate-950">
      <div className="text-center max-w-md">
        <h1 className="font-outfit text-9xl font-black tracking-tight text-brand-500/20 dark:text-brand-500/10">
          404
        </h1>
        <h2 className="font-outfit text-2xl font-bold text-slate-800 dark:text-slate-200 mt-4">
          Page Not Found
        </h2>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <button
            onClick={handleGoBack}
            className="flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-sm font-bold text-white shadow-md shadow-brand-500/20 hover:bg-brand-600 transition-all active:scale-[0.98]"
          >
            <ArrowLeft size={16} />
            <span>Go to Dashboard</span>
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 transition-all active:scale-[0.98]"
          >
            <RefreshCw size={16} />
            <span>Reload Page</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
