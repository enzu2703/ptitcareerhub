import React from 'react';
import { Logo } from './Logo';
import { ScreenView } from '../types';
import { Lock, Heart, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: ScreenView) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-slate-200/80 bg-white pt-12 pb-8 mt-auto font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <div onClick={() => onNavigate('home')} className="cursor-pointer">
              <Logo />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Hệ sinh thái hướng nghiệp và phát triển nghề nghiệp dành cho sinh viên Học viện Công nghệ Bưu chính Viễn thông (PTIT).
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-[#B90013] rounded-full text-[10px] font-bold border border-red-100">
                <ShieldCheck className="w-3 h-3 text-[#B90013]" />
                PTIT Career Ecosystem
              </span>
            </div>
          </div>

          {/* Col 2: Khám phá */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Khám phá
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button
                  onClick={() => onNavigate('assessment-intro')}
                  className="hover:text-[#B90013] transition-colors"
                >
                  Đánh giá nghề nghiệp (Assessment)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('roadmap')}
                  className="hover:text-[#B90013] transition-colors"
                >
                  Lộ trình kỹ năng theo cấp độ
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('jobs')}
                  className="hover:text-[#B90013] transition-colors"
                >
                  Cổng việc làm & Thực tập
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('events')}
                  className="hover:text-[#B90013] transition-colors"
                >
                  Sự kiện & Workshop định hướng
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('cv-builder')}
                  className="hover:text-[#B90013] transition-colors"
                >
                  Tối ưu hóa CV với AI
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Hỗ trợ & Chính sách */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Hỗ trợ & Pháp lý
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <a href="#contact" className="hover:text-[#B90013] transition-colors">
                  Liên hệ Phòng CTSV PTIT
                </a>
              </li>
              <li>
                <a href="#feedback" className="hover:text-[#B90013] transition-colors">
                  Đóng góp ý kiến & Báo lỗi
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-[#B90013] transition-colors">
                  Chính sách bảo mật dữ liệu
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-[#B90013] transition-colors">
                  Quy định sử dụng nền tảng
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Mạng xã hội */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Kết nối cộng đồng
            </h4>
            <p className="text-xs text-slate-500">
              Theo dõi các bản tin việc làm thực tập mới nhất qua các kênh chính thức:
            </p>
            <div className="flex flex-wrap gap-2 pt-1 text-xs font-semibold">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors"
              >
                Facebook
              </a>
              <a
                href="https://threads.net"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors"
              >
                Threads
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors"
              >
                TikTok
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Admin Link */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 PTIT Career Hub. Bản quyền thuộc Học viện Công nghệ Bưu chính Viễn thông.</p>
          
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-slate-400">Phiên bản Prototype v2.4</span>
            <button
              onClick={() => onNavigate('admin-login')}
              className="text-xs font-bold text-slate-600 hover:text-[#B90013] flex items-center gap-1.5 transition-colors group"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#B90013]" />
              <span>Dành cho quản trị viên →</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
