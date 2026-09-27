import React from 'react';
import { ScreenView, UserAuth, TargetJob, CareerEvent } from '../../types';
import { INITIAL_STUDENT_PROFILE, TARGET_JOBS, CAREER_EVENTS } from '../../data/mockData';
import {
  Compass,
  FileText,
  Bookmark,
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  User,
  ShieldCheck,
  Building2,
  ExternalLink,
} from 'lucide-react';

interface MyCareerViewProps {
  onNavigate: (view: ScreenView) => void;
  auth: UserAuth;
  jobs?: TargetJob[];
  events?: CareerEvent[];
  onSelectJobDetail?: (job: TargetJob) => void;
  onSelectEventDetail?: (event: CareerEvent) => void;
}

export const MyCareerView: React.FC<MyCareerViewProps> = ({
  onNavigate,
  auth,
  jobs = TARGET_JOBS,
  events = CAREER_EVENTS,
  onSelectJobDetail,
  onSelectEventDetail,
}) => {
  const profile = INITIAL_STUDENT_PROFILE;
  const savedJobs = jobs.filter((j) => j.isSaved);
  const savedEvents = events.filter((e) => e.isSaved);

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-10 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Banner with Student Greeting */}
      <div className="bg-gradient-to-r from-red-900 via-[#B90013] to-red-800 text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 z-10">
          <span className="px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full backdrop-blur-xs">
            Góc Phát Triển Nghề Nghiệp Sinh Viên PTIT
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Xin chào, {auth.name || 'Minh'} 👋
          </h1>
          <p className="text-white/80 text-xs sm:text-sm max-w-xl leading-relaxed">
            Theo dõi tiến độ phát triển kỹ năng, tối ưu hồ sơ CV và quản lý các cơ hội việc làm đã lưu tại đây.
          </p>
        </div>

        <div className="z-10 flex flex-wrap gap-3">
          <button
            onClick={() => onNavigate('roadmap')}
            className="bg-white hover:bg-slate-100 text-[#B90013] font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <Compass className="w-4 h-4" />
            <span>Tiếp tục lộ trình</span>
          </button>
          <button
            onClick={() => onNavigate('cv-builder')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Tối ưu CV với AI</span>
          </button>
        </div>
      </div>

      {/* 6 Essential Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Định hướng
          </span>
          <p className="text-sm font-extrabold text-[#131B2E] truncate">
            {profile.careerGoal}
          </p>
          <span className="text-[10px] text-purple-600 font-semibold">Khớp 92%</span>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Cấp độ hiện tại
          </span>
          <p className="text-sm font-extrabold text-[#131B2E]">
            Cấp độ 2 (Thực thi)
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold">Intermediate</span>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Tiến độ lộ trình
          </span>
          <p className="text-xl font-black text-[#B90013]">
            {profile.roadmapProgress}%
          </p>
          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
            <div className="bg-[#B90013] h-full w-[45%]" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            CV Match cao nhất
          </span>
          <p className="text-xl font-black text-[#712AE2]">
            {profile.cvMatchScore}%
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold">Cạnh tranh cao</span>
        </div>

        {/* Metric 5 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Việc làm đã lưu
          </span>
          <p className="text-xl font-extrabold text-slate-800">
            {savedJobs.length}
          </p>
          <button
            onClick={() => onNavigate('saved-jobs')}
            className="text-[10px] text-[#B90013] font-bold hover:underline"
          >
            Xem trang đã lưu →
          </button>
        </div>

        {/* Metric 6 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Sự kiện đã lưu
          </span>
          <p className="text-xl font-extrabold text-slate-800">
            {savedEvents.length}
          </p>
          <button
            onClick={() => onNavigate('saved-events')}
            className="text-[10px] text-[#B90013] font-bold hover:underline"
          >
            Xem sự kiện đã lưu →
          </button>
        </div>
      </div>

      {/* Main Grid: My CVs (limit 3/6) + Saved Jobs + Saved Events */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: CV của tôi (limit 3/6) (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#131B2E]">CV của tôi</h2>
              <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 text-xs font-bold rounded-full border border-purple-100">
                3 / 6 bản CV
              </span>
            </div>
            <button
              onClick={() => onNavigate('cv-builder')}
              className="text-xs font-bold text-[#B90013] hover:underline"
            >
              + Tạo CV mới
            </button>
          </div>

          <div className="space-y-3">
            {/* CV 1 */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#131B2E]">Marketing_Intern_CV_2026.pdf</h4>
                  <p className="text-xs text-slate-500">Cập nhật: 22/10/2026 • Chuẩn ATS</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-[#712AE2] bg-purple-50 px-2.5 py-1 rounded-full">
                  92% Match
                </span>
                <button
                  onClick={() => onNavigate('cv-builder')}
                  className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 border border-slate-200"
                >
                  Sửa
                </button>
              </div>
            </div>

            {/* CV 2 */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#131B2E]">Content_Creator_CV.pdf</h4>
                  <p className="text-xs text-slate-500">Cập nhật: 15/10/2026 • Mẫu Sáng tạo</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                  86% Match
                </span>
                <button
                  onClick={() => onNavigate('cv-builder')}
                  className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 border border-slate-200"
                >
                  Sửa
                </button>
              </div>
            </div>

            {/* CV 3 */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#131B2E]">Business_Development_CV.pdf</h4>
                  <p className="text-xs text-slate-500">Cập nhật: 05/10/2026 • Chuyên nghiệp</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                  78% Match
                </span>
                <button
                  onClick={() => onNavigate('cv-builder')}
                  className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 border border-slate-200"
                >
                  Sửa
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Việc làm đã lưu (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#131B2E]">Việc làm đã lưu ({savedJobs.length})</h2>
            <button
              onClick={() => onNavigate('saved-jobs')}
              className="text-xs font-bold text-[#B90013] hover:underline"
            >
              Mở trang việc làm đã lưu →
            </button>
          </div>

          <div className="space-y-3">
            {savedJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => {
                  if (onSelectJobDetail) {
                    onSelectJobDetail(job);
                  } else {
                    onNavigate('saved-jobs');
                  }
                }}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover:border-[#B90013] transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-[#131B2E] group-hover:text-[#B90013] transition-colors truncate">{job.title}</h4>
                  <p className="text-xs text-slate-500">{job.company} • {job.location}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {job.salaryDisplay}
                    </span>
                    <span className="text-[10px] text-slate-400">Hạn: {job.deadline}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-extrabold text-[#712AE2] bg-purple-50 px-2.5 py-1 rounded-full block mb-1">
                    {job.matchPercentage}%
                  </span>
                  <span className="text-[10px] font-bold text-[#B90013]">Xem chi tiết →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Saved Events Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#131B2E]">Sự kiện bạn quan tâm ({savedEvents.length})</h2>
          <button
            onClick={() => onNavigate('saved-events')}
            className="text-xs font-bold text-[#B90013] hover:underline"
          >
            Mở trang sự kiện đã lưu →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => {
                if (onSelectEventDetail) {
                  onSelectEventDetail(event);
                } else {
                  onNavigate('saved-events');
                }
              }}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:border-[#B90013] transition-all cursor-pointer flex items-start gap-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-red-50 text-[#B90013] flex flex-col items-center justify-center shrink-0 border border-red-100 group-hover:bg-[#B90013] group-hover:text-white transition-colors">
                <span className="text-[9px] font-black uppercase">{event.month}</span>
                <span className="text-base font-black">{event.day}</span>
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <h4 className="text-sm font-bold text-[#131B2E] group-hover:text-[#B90013] transition-colors truncate">{event.title}</h4>
                <p className="text-xs text-slate-500">{event.time} • {event.location}</p>
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#B90013] group-hover:underline inline-flex items-center gap-1">
                    <span>Xem chi tiết sự kiện</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                  {event.trainingPoints && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      +{event.trainingPoints}đ Rèn luyện
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
