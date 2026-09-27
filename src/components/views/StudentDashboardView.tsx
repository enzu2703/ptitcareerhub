import React, { useState } from 'react';
import { ScreenView, StudentProfile, UserProfileState } from '../../types';
import { TARGET_JOBS } from '../../data/mockData';
import {
  Compass,
  TrendingUp,
  FileText,
  Bookmark,
  CheckCircle2,
  CircleDot,
  Circle,
  Plus,
  MoreVertical,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Edit3,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface StudentDashboardViewProps {
  onNavigate: (view: ScreenView) => void;
  profile?: StudentProfile;
  userProfile?: UserProfileState;
  onEditProfile?: () => void;
}

export const StudentDashboardView: React.FC<StudentDashboardViewProps> = ({
  onNavigate,
  profile: propProfile,
  userProfile,
  onEditProfile,
}) => {
  const profile: StudentProfile = {
    name: userProfile?.displayName || propProfile?.name || 'Minh',
    careerGoal: userProfile?.careerDirection || propProfile?.careerGoal || 'Digital Marketing Specialist',
    currentLevel: userProfile?.academicYear || propProfile?.currentLevel || 'Năm 3',
    roadmapProgress: userProfile?.careerCheckCompleted ? 65 : 20,
    cvMatchScore: userProfile?.skillGap?.matchScore || propProfile?.cvMatchScore || 85,
    topStrengths: userProfile?.skillGap?.strengths || propProfile?.topStrengths || [
      'Content Creation',
      'SEO Cơ bản',
      'Tư duy phân tích',
    ],
    growthAreas: userProfile?.skillGap?.missingSkills || propProfile?.growthAreas || [
      'Google Analytics 4',
      'Performance Ads',
    ],
    nextSteps: propProfile?.nextSteps || [
      {
        id: 's1',
        title: 'Hoàn thành bài viết mẫu chuẩn SEO',
        type: 'project',
        completed: true,
      },
      {
        id: 's2',
        title: 'Thực hành chạy thử nghiệm A/B Testing',
        type: 'action',
        completed: false,
      },
      {
        id: 's3',
        title: 'Tối ưu lại CV theo vị trí Performance Marketing Intern',
        type: 'cv',
        completed: false,
      },
    ],
  };

  const [portfolioStarted, setPortfolioStarted] = useState(false);
  const [savedJobs, setSavedJobs] = useState(TARGET_JOBS.filter((j) => j.isSaved));

  const handleStartProject = () => {
    setPortfolioStarted(true);
    try {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    } catch (e) {
      // silent
    }
  };

  const handleToggleSave = (jobId: string) => {
    setSavedJobs((prev) => {
      const exists = prev.find((j) => j.id === jobId);
      if (exists) {
        return prev.filter((j) => j.id !== jobId);
      } else {
        const found = TARGET_JOBS.find((j) => j.id === jobId);
        return found ? [...prev, { ...found, isSaved: true }] : prev;
      }
    });
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Welcome Header matching Image 10 */}
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#131B2E] tracking-tight flex items-center gap-2">
          Chào, {profile.name}! 👋 <span className="font-bold">Tiến độ sự nghiệp</span>
        </h1>
        <p className="text-slate-500 text-sm sm:text-base">
          Dưới đây là tổng quan nhanh về vị trí hiện tại của bạn.
        </p>
      </div>

      {/* 4 Bento Metrics Cards matching Image 10 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Định hướng nghề nghiệp */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_rgba(15,23,42,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">
            <span>Định hướng nghề nghiệp</span>
            <div className="w-7 h-7 rounded-full bg-red-50 text-[#B90013] flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#131B2E]">
            {profile.careerGoal}
          </h3>
        </div>

        {/* Card 2: Cấp độ hiện tại */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_rgba(15,23,42,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">
            <span>Cấp độ hiện tại</span>
            <div className="w-7 h-7 rounded-full bg-blue-50 text-[#0079BB] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#131B2E]">
            {profile.currentLevel}
          </h3>
        </div>

        {/* Card 3: Tiến độ lộ trình */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_rgba(15,23,42,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">
            <span>Tiến độ lộ trình</span>
            <span className="font-extrabold text-slate-700">{profile.roadmapProgress}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mt-3">
            <div
              className="h-full bg-[#B90013] rounded-full"
              style={{ width: `${profile.roadmapProgress}%` }}
            />
          </div>
        </div>

        {/* Card 4: Điểm khớp CV */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_rgba(15,23,42,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Điểm khớp CV
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-3xl font-extrabold text-emerald-600">
              {profile.cvMatchScore}%
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              {profile.cvMatchStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Main Action Grid: Lộ trình của tôi & CV của tôi */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lộ trình của tôi (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-[0_4px_20px_rgba(15,23,42,0.04)] space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">📖</span>
              <h2 className="text-xl font-bold text-[#131B2E]">Lộ trình của tôi</h2>
            </div>
            <button
              onClick={() => onNavigate('roadmap')}
              className="text-xs sm:text-sm font-bold text-slate-600 hover:text-[#B90013] transition-colors"
            >
              Xem toàn bộ kế hoạch
            </button>
          </div>

          <div className="space-y-6 relative pl-6 border-l-2 border-slate-200 ml-2">
            {/* Item 1: Done */}
            <div className="relative space-y-1">
              <div className="absolute -left-[31px] top-0.5 w-5 h-5 rounded-full bg-[#B90013] text-white flex items-center justify-center ring-4 ring-white shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <h4 className="font-bold text-sm text-[#131B2E]">Khóa học nền tảng</h4>
              <p className="text-xs sm:text-sm text-slate-600">
                Hoàn thành Giới thiệu về SEO & Chiến lược nội dung.
              </p>
            </div>

            {/* Item 2: In progress */}
            <div className="relative space-y-2">
              <div className="absolute -left-[31px] top-0.5 w-5 h-5 rounded-full bg-red-100 text-[#B90013] flex items-center justify-center ring-4 ring-white">
                <CircleDot className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-[#131B2E]">Xây dựng dự án Portfolio</h4>
              <p className="text-xs sm:text-sm text-slate-600">
                Tạo 2 chiến dịch mẫu cho doanh nghiệp địa phương hoặc câu lạc bộ PTIT.
              </p>
              <button
                onClick={handleStartProject}
                className="bg-white border border-slate-300 hover:border-[#B90013] text-slate-700 hover:text-[#B90013] font-bold text-xs px-4 py-2 rounded-lg transition-colors shadow-2xs"
              >
                {portfolioStarted ? '✓ Đang thực hiện dự án' : 'Bắt đầu dự án'}
              </button>
            </div>

            {/* Item 3: Upcoming */}
            <div className="relative space-y-1">
              <div className="absolute -left-[31px] top-0.5 w-5 h-5 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center ring-4 ring-white">
                <Circle className="w-3.5 h-3.5" />
              </div>
              <h4 className="font-bold text-sm text-slate-500">Ứng tuyển thực tập</h4>
              <p className="text-xs sm:text-sm text-slate-400">
                Mục tiêu Top 5 Agencies hoặc tập đoàn đối tác PTIT.
              </p>
            </div>
          </div>
        </div>

        {/* CV của tôi (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_rgba(15,23,42,0.04)] space-y-5">
          <div className="flex items-center gap-2">
            <span className="text-xl">📄</span>
            <h2 className="text-xl font-bold text-[#131B2E]">CV của tôi</h2>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-500 font-medium">
              <span>Dung lượng đã dùng</span>
              <span>{profile.resumeCount}/{profile.maxResumes}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 w-1/2 rounded-full" />
            </div>
          </div>

          {/* Resumes list */}
          <div className="space-y-2.5">
            {/* File 1 */}
            <div
              onClick={() => onNavigate('cv-builder')}
              className="p-3.5 rounded-xl border border-slate-200/80 hover:border-purple-300 hover:bg-purple-50/20 transition-all flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[10px] shrink-0 border border-blue-100">
                  PDF
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-800 truncate group-hover:text-purple-700">
                    Marketing_CV_2024.pdf
                  </h4>
                  <p className="text-[11px] text-slate-400">Cập nhật 2 ngày trước</p>
                </div>
              </div>
              <MoreVertical className="w-4 h-4 text-slate-400" />
            </div>

            {/* File 2 */}
            <div
              onClick={() => onNavigate('cv-builder')}
              className="p-3.5 rounded-xl border border-slate-200/80 hover:border-purple-300 hover:bg-purple-50/20 transition-all flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[10px] shrink-0 border border-blue-100">
                  PDF
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-800 truncate group-hover:text-purple-700">
                    General_Resume.pdf
                  </h4>
                  <p className="text-[11px] text-slate-400">Cập nhật 1 tháng trước</p>
                </div>
              </div>
              <MoreVertical className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          <button
            onClick={() => onNavigate('cv-builder')}
            className="w-full py-3 px-4 rounded-xl border border-[#B90013] text-[#B90013] hover:bg-red-50 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Tạo CV mới
          </button>
        </div>
      </div>

      {/* Bottom Grid: Việc làm đề xuất & Việc làm đã lưu */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Việc làm đề xuất (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-[0_4px_20px_rgba(15,23,42,0.04)] space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#712AE2]" />
              <h2 className="text-xl font-bold text-[#131B2E]">Việc làm đề xuất</h2>
            </div>
            <button
              onClick={() => onNavigate('jobs')}
              className="text-xs sm:text-sm font-bold text-slate-600 hover:text-[#B90013]"
            >
              Xem tất cả
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Job 1 */}
            <div
              onClick={() => onNavigate('jobs')}
              className="p-5 rounded-2xl border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer space-y-3 relative group"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleSave('job-3');
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-[#B90013]"
              >
                <Bookmark className="w-4 h-4" />
              </button>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 font-extrabold flex items-center justify-center text-base">
                V
              </div>
              <div>
                <h4 className="font-bold text-base text-[#131B2E] group-hover:text-[#B90013] transition-colors">
                  Junior Performance Marketer
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">VNG Corporation • Hồ Chí Minh</p>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                  Khớp cao
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  Mới đi làm
                </span>
              </div>
            </div>

            {/* Job 2 */}
            <div
              onClick={() => onNavigate('jobs')}
              className="p-5 rounded-2xl border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer space-y-3 relative group"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleSave('job-4');
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-[#B90013]"
              >
                <Bookmark className="w-4 h-4" />
              </button>
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 font-extrabold flex items-center justify-center text-base">
                S
              </div>
              <div>
                <h4 className="font-bold text-base text-[#131B2E] group-hover:text-[#B90013] transition-colors">
                  Thực tập sinh Content Marketing
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Shopee • Từ xa</p>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                  AI Chọn
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  Thực tập
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Việc làm đã lưu (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_rgba(15,23,42,0.04)] space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-[#B90013]" />
              <h2 className="text-xl font-bold text-[#131B2E]">Việc làm đã lưu</h2>
            </div>

            <div className="space-y-3">
              {savedJobs.slice(0, 3).map((job) => (
                <div
                  key={job.id}
                  onClick={() => onNavigate('jobs')}
                  className="p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#131B2E]">
                      {job.title}
                    </h4>
                    <p className="text-[11px] text-slate-400">{job.company}</p>
                  </div>
                  <Bookmark className="w-4 h-4 text-[#B90013] fill-[#B90013]" />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('jobs')}
            className="text-xs font-bold text-slate-600 hover:text-[#B90013] text-center pt-2 block"
          >
            Xem tất cả việc làm đã lưu
          </button>
        </div>
      </div>
    </div>
  );
};
