import React, { useState } from 'react';
import { ScreenView } from '../types';
import { Logo } from './Logo';
import { AUTHORIZED_ADMIN_EMAILS } from '../data/mockData';
import { saveUserProfile } from '../services/userService';
import { ShieldCheck, Lock, AlertTriangle, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';

interface AdminLoginViewProps {
  onNavigate: (view: ScreenView) => void;
  onAdminLoginSuccess: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  onNavigate,
  onAdminLoginSuccess,
}) => {
  const [email, setEmail] = useState('admin@ptit.edu.vn');
  const [password, setPassword] = useState('••••••••••••');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    setTimeout(() => {
      setLoading(false);
      const isAuthorized = AUTHORIZED_ADMIN_EMAILS.includes(email.trim().toLowerCase());
      if (isAuthorized) {
        saveUserProfile({ role: 'admin', email: email.trim() });
        onAdminLoginSuccess();
        onNavigate('admin-dashboard');
      } else {
        setError('Bạn không có quyền truy cập khu vực quản trị. Vui lòng sử dụng email quản trị viên được cấp phép của PTIT.');
      }
    }, 600);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-[0_10px_40px_rgba(15,23,42,0.06)] space-y-6">
        {/* Back link */}
        <button
          onClick={() => onNavigate('home')}
          className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về trang chủ sinh viên</span>
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#B90013] mx-auto flex items-center justify-center border border-red-100">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#131B2E]">
            Cổng Đăng Nhập Quản Trị
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">
            Khu vực giới hạn chỉ dành cho Ban giám hiệu, Phòng CTSV và Cán bộ Quản trị PTIT Career Hub.
          </p>
        </div>

        {/* Prototype Authorized Emails Info */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Tài khoản quản trị viên mẫu (Prototype):</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {AUTHORIZED_ADMIN_EMAILS.map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => setEmail(em)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-all ${
                  email === em
                    ? 'bg-red-50 text-[#B90013] border-red-200 font-bold'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {em}
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-shake">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAdminSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Email quản trị viên</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ptit.edu.vn"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#B90013] focus:ring-2 focus:ring-[#B90013]/10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Mật khẩu xác thực</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#B90013] focus:ring-2 focus:ring-[#B90013]/10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#B90013] hover:bg-[#A30010] text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all text-sm disabled:opacity-50"
          >
            {loading ? 'Đang xác thực bảo mật...' : 'Đăng nhập vào Bảng điều khiển Quản trị'}
          </button>
        </form>
      </div>
    </div>
  );
};
