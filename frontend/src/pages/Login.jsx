import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, Eye, EyeOff, ShieldAlert } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setLoginError(null);
    try {
      const user = await login(data.username, data.password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/student');
      }
    } catch (err) {
      setLoginError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-900 px-4 py-12">
      {/* Background Decorative Gradients */}
      <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-brand-500/10 blur-3xl"></div>
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl"></div>

      <div className="relative w-full max-w-md rounded-3xl bg-slate-950/45 p-8 shadow-2xl backdrop-blur-md border border-slate-800">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-lg shadow-brand-500/30 mb-4 font-bold text-2xl font-outfit">
            U
          </div>
          <h1 className="font-outfit text-2xl font-bold text-white tracking-tight">
            Welcome to CampusERP
          </h1>
          <p className="text-sm font-medium text-slate-400 mt-1">
            Sign in to access your student or admin dashboard
          </p>
        </div>

        {/* Global Error Banner */}
        {loginError && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-400">
            <ShieldAlert size={18} className="shrink-0 mt-0.5" />
            <p className="font-medium">{loginError}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Username / Roll Number */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Username or Roll Number
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                <User size={18} />
              </span>
              <input
                type="text"
                {...register('username', { required: 'Username or Roll number is required' })}
                placeholder="admin or student roll number"
                className={`w-full rounded-2xl bg-slate-900 border py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all ${
                  errors.username ? 'border-rose-500/50' : 'border-slate-800 focus:border-brand-500'
                }`}
              />
            </div>
            {errors.username && (
              <p className="text-xs font-medium text-rose-400 mt-1.5">{errors.username.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password', { required: 'Password is required' })}
                placeholder="••••••••"
                className={`w-full rounded-2xl bg-slate-900 border py-3.5 pl-11 pr-11 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all ${
                  errors.password ? 'border-rose-500/50' : 'border-slate-800 focus:border-brand-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs font-medium text-rose-400 mt-1.5">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-2xl bg-brand-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600 hover:shadow-brand-600/30 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 transition-all mt-6"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Credentials Quick Help */}
        <div className="mt-8 rounded-2xl bg-slate-900/50 border border-slate-800/60 p-4 text-xs text-slate-400 text-center">
          <p className="font-semibold text-slate-300">Quick Seed Credentials:</p>
          <div className="mt-1.5 flex justify-around text-[11px] text-slate-500">
            <span>Admin: <strong className="text-slate-400">admin / adminpassword</strong></span>
            <span>Student: <strong className="text-slate-400">26CS001 / password123</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
