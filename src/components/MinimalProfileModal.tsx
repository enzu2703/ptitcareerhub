import React, { useState } from 'react';
import { UserProfileState, CareerGoalOption } from '../types';
import { Logo } from './Logo';
import { trackEvent } from '../utils/analytics';
import {
  Sparkles,
  GraduationCap,
  Target,
  ArrowRight,
  Check,
  User,
  BookOpen,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MinimalProfileModalProps {
  isOpen: boolean;
  initialProfile?: UserProfileState;
  userProfile?: UserProfileState;
  onComplete?: (updated: Partial<UserProfileState>) => void;
  onSave?: (updated: Partial<UserProfileState>) => void;
  onSkip?: () => void;
  onClose?: () => void;
}

const PTIT_MAJORS = [
  'Marketing & Truyền thông số',
  'Quản trị kinh doanh',
  'Thương mại điện tử',
  'Kinh tế số',
  'Công nghệ tài chính (Fintech)',
  'Kế toán',
  'Truyền thông đa phương tiện',
];

const ACADEMIC_YEARS = [
  'Năm 1 (Tân sinh viên)',
  'Năm 2 (Cơ sở ngành)',
  'Năm 3 (Chuẩn bị thực tập)',
  'Năm 4 (Tốt nghiệp & Đi làm)',
  'Năm 5 / Sau đại học',
];

const CAREER_GOALS: { id: CareerGoalOption; label: string; desc: string }[] = [
  {
    id: 'Chưa biết mình phù hợp nghề gì',
    label: 'Chưa biết mình phù hợp nghề gì',
    desc: 'Cần trắc nghiệm để tìm ra điểm mạnh & định hướng tự nhiên',
  },
  {
    id: 'Đang tìm hiểu các hướng nghề nghiệp',
    label: 'Đang tìm hiểu các hướng nghề nghiệp',
    desc: 'Muốn khám phá các vị trí công việc và lộ trình ngành học',
  },
  {
    id: 'Đã có nghề mục tiêu',
    label: 'Đã có nghề mục tiêu',
    desc: 'Đã xác định vị trí mong muốn, cần lộ trình trau dồi kỹ năng',
  },
  {
    id: 'Đang tìm internship',
    label: 'Đang tìm internship',
    desc: 'Ưu tiên kết nối việc làm thực tập sinh và tạo CV chuẩn',
  },
  {
    id: 'Đang chuẩn bị đi làm',
    label: 'Đang chuẩn bị đi làm',
    desc: 'Chuẩn bị phỏng vấn Fresher/Full-time và hoàn thiện hồ sơ',
  },
];

export const MinimalProfileModal: React.FC<MinimalProfileModalProps> = ({
  isOpen,
  initialProfile,
  userProfile,
  onComplete,
  onSave,
  onSkip,
  onClose,
}) => {
  const profile = userProfile || initialProfile;
  const [displayName, setDisplayName] = useState(profile?.displayName || 'Minh');
  const [major, setMajor] = useState(profile?.major || 'Marketing & Truyền thông số');
  const [academicYear, setAcademicYear] = useState(profile?.academicYear || 'Năm 3 (Chuẩn bị thực tập)');
  const [careerGoal, setCareerGoal] = useState<CareerGoalOption>(
    (profile?.careerGoal as CareerGoalOption) || 'Đang tìm hiểu các hướng nghề nghiệp'
  );

  if (!isOpen) return null;

  const handleDismiss = () => {
    if (onSkip) onSkip();
    else if (onClose) onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Partial<UserProfileState> = {
      displayName: displayName.trim() || 'Sinh viên PTIT',
      major,
      academicYear: academicYear.split(' ')[0], // normalize to "Năm 1", "Năm 2", "Năm 3", etc.
      careerGoal,
      onboardingCompleted: true,
    };

    trackEvent('onboarding_complete', {
      major: updated.major,
      academicYear: updated.academicYear,
      careerGoal: updated.careerGoal,
    });

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // silent
    }

    if (onComplete) onComplete(updated);
    if (onSave) onSave(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto space-y-6">
        {/* Header with PTIT logo & context */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <Logo variant="full" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-[#B90013] text-xs font-bold border border-red-100">
            <Sparkles className="w-3.5 h-3.5 text-[#B90013]" />
            <span>Thiết lập hồ sơ nhanh (30 giây)</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#131B2E] tracking-tight">
            Chào mừng bạn đến với Career Hub!
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
            Chỉ cần 4 thông tin cơ bản để hệ thống cá nhân hóa gợi ý việc làm, sự kiện và lộ trình kỹ năng phù hợp nhất với bạn.
          </p>
        </div>

        {/* Minimal Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Tên / Nickname */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#B90013]" />
              <span>Tên hoặc nickname của bạn</span>
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="VD: Minh, Lan Anh, Đức..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 text-sm focus:outline-none focus:border-[#B90013] focus:bg-white focus:ring-2 focus:ring-[#B90013]/10 transition-all font-medium"
            />
          </div>

          {/* 2. Ngành học */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#B90013]" />
              <span>Ngành học (Khối ngành Kinh tế PTIT)</span>
            </label>
            <select
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 text-sm focus:outline-none focus:border-[#B90013] focus:bg-white focus:ring-2 focus:ring-[#B90013]/10 transition-all font-medium cursor-pointer"
            >
              {PTIT_MAJORS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Năm học */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-[#B90013]" />
              <span>Năm học hiện tại</span>
            </label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 text-sm focus:outline-none focus:border-[#B90013] focus:bg-white focus:ring-2 focus:ring-[#B90013]/10 transition-all font-medium cursor-pointer"
            >
              {ACADEMIC_YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Mục tiêu hiện tại */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[#B90013]" />
              <span>Mục tiêu hiện tại của bạn</span>
            </label>
            <div className="space-y-2">
              {CAREER_GOALS.map((g) => {
                const isSelected = careerGoal === g.id;
                return (
                  <button
                    type="button"
                    key={g.id}
                    onClick={() => setCareerGoal(g.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-[#B90013] bg-red-50/60 shadow-2xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'border-[#B90013] bg-[#B90013] text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-slate-900">
                        {g.label}
                      </p>
                      <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        {g.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 space-y-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-[#B90013] hover:bg-[#A30010] text-white font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Hoàn tất & Bắt đầu trải nghiệm</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {(onSkip || onClose) && (
              <button
                type="button"
                onClick={handleDismiss}
                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors text-center cursor-pointer"
              >
                Để sau (sử dụng thông tin mặc định)
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
