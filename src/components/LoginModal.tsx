import React, { useState } from 'react';
import { Logo } from './Logo';
import { UserAuth } from '../types';
import { X, ShieldCheck, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (auth: UserAuth) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState('minh.ptit@student.ptit.edu.vn');
  const [nameInput, setNameInput] = useState('Nguyễn Văn Minh');

  if (!isOpen) return null;

  const handleSimulatedLogin = (provider: 'google' | 'outlook' | 'demo') => {
    setLoadingProvider(provider);
    setTimeout(() => {
      setLoadingProvider(null);
      const authUser: UserAuth = {
        isLoggedIn: true,
        name: nameInput || 'Minh',
        email: emailInput || 'minh.ptit@student.ptit.edu.vn',
        avatarLetter: (nameInput || 'M').charAt(0).toUpperCase(),
        studentId: 'B22DCMK120',
        major: 'Marketing & Truyền thông Đa phương tiện',
        year: 'Năm 3',
        provider,
      };
      onLoginSuccess(authUser);
      onClose();
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch (e) {
        // silent
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 relative space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          title="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Logo variant="full" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#131B2E] tracking-tight">
            Đăng nhập vào PTIT Career Hub
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xs mx-auto">
            Đăng nhập để lưu lộ trình nghề nghiệp, CV, việc làm và nhận các đề xuất phù hợp với bạn.
          </p>
        </div>

        {/* Prototype notice badge */}
        <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200/70 text-amber-800 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>
            <strong>Chế độ Prototype:</strong> Bấm để mô phỏng luồng đăng nhập nhanh bằng tài khoản sinh viên PTIT.
          </span>
        </div>

        {/* Login Options */}
        <div className="space-y-3">
          {/* Google Button */}
          <button
            onClick={() => handleSimulatedLogin('google')}
            disabled={!!loadingProvider}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 font-semibold text-slate-700 text-sm transition-all shadow-2xs hover:shadow-xs disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>
              {loadingProvider === 'google' ? 'Đang kết nối Google...' : 'Tiếp tục với Google'}
            </span>
          </button>

          {/* Microsoft Outlook PTIT Button */}
          <button
            onClick={() => handleSimulatedLogin('outlook')}
            disabled={!!loadingProvider}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 font-semibold text-slate-700 text-sm transition-all shadow-2xs hover:shadow-xs disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 23 23">
              <path fill="#f35325" d="M1 1h10v10H1z" />
              <path fill="#81bc06" d="M12 1h10v10H12z" />
              <path fill="#05a6f0" d="M1 12h10v10H1z" />
              <path fill="#ffba08" d="M12 12h10v10H12z" />
            </svg>
            <span>
              {loadingProvider === 'outlook' ? 'Đang kết nối PTIT Mail...' : 'Tiếp tục với Outlook PTIT (@student.ptit.edu.vn)'}
            </span>
          </button>
        </div>

        {/* Quick Simulated Profile Info */}
        <div className="pt-3 border-t border-slate-100 text-center space-y-2">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Bảo mật thông tin sinh viên Học viện Công nghệ Bưu chính Viễn thông
          </p>
        </div>
      </div>
    </div>
  );
};
