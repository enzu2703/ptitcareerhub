import React, { useState } from 'react';
import { ScreenView, TargetJob, CareerEvent } from '../../types';
import {
  Bookmark,
  Calendar,
  Briefcase,
  Sparkles,
  MapPin,
  Clock,
  Building2,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  SlidersHorizontal,
  Send,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SavedItemsViewProps {
  onNavigate: (view: ScreenView) => void;
  initialTab?: 'jobs' | 'events';
  jobs: TargetJob[];
  onToggleSaveJob: (jobId: string) => void;
  events: CareerEvent[];
  onToggleSaveEvent: (eventId: string) => void;
  onSelectJobForCv?: (job: TargetJob) => void;
  onSelectJobDetail?: (job: TargetJob) => void;
  onSelectEventDetail?: (event: CareerEvent) => void;
}

export const SavedItemsView: React.FC<SavedItemsViewProps> = ({
  onNavigate,
  initialTab = 'jobs',
  jobs,
  onToggleSaveJob,
  events,
  onToggleSaveEvent,
  onSelectJobForCv,
  onSelectJobDetail,
  onSelectEventDetail,
}) => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'events'>(initialTab);
  const [appliedModalOpen, setAppliedModalOpen] = useState(false);
  const [appliedJobTitle, setAppliedJobTitle] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const savedJobs = jobs.filter((j) => j.isSaved);
  const savedEvents = events.filter((e) => e.isSaved);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleApply = (job: TargetJob) => {
    setAppliedJobTitle(`${job.title} tại ${job.company}`);
    setAppliedModalOpen(true);
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch (e) {
      // silent
    }
  };

  const handleUnsaveJob = (jobId: string, title: string) => {
    onToggleSaveJob(jobId);
    showToast(`Đã xóa "${title}" khỏi danh sách đã lưu.`);
  };

  const handleUnsaveEvent = (eventId: string, title: string) => {
    onToggleSaveEvent(eventId);
    showToast(`Đã xóa sự kiện "${title}" khỏi danh sách đã lưu.`);
  };

  const handleOptimizeCv = (job: TargetJob) => {
    if (onSelectJobForCv) {
      onSelectJobForCv(job);
    }
    onNavigate('cv-builder');
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-8 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#131B2E] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs sm:text-sm animate-in fade-in slide-in-from-top-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-red-50 text-[#B90013] text-xs font-bold rounded-full border border-red-100 flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 fill-[#B90013]" />
              Kho lưu trữ cá nhân
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Đồng bộ với tài khoản sinh viên PTIT
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#131B2E]">
            Mục đã lưu của bạn
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Quản lý tập trung các việc làm và sự kiện bạn đã đánh dấu để theo dõi và chuẩn bị ứng tuyển.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'jobs'
                ? 'bg-white text-[#B90013] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Việc làm đã lưu</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === 'jobs'
                  ? 'bg-red-50 text-[#B90013]'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {savedJobs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'events'
                ? 'bg-white text-[#B90013] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Sự kiện đã lưu</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === 'events'
                  ? 'bg-red-50 text-[#B90013]'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {savedEvents.length}
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: SAVED JOBS */}
      {activeTab === 'jobs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-[#131B2E] flex items-center gap-2">
              <span>Danh sách việc làm đã lưu</span>
              <span className="text-xs text-slate-500 font-normal">
                ({savedJobs.length} cơ hội)
              </span>
            </h2>
            <button
              onClick={() => onNavigate('jobs')}
              className="text-xs font-bold text-[#B90013] hover:underline flex items-center gap-1"
            >
              <span>Tìm thêm việc làm mới</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {savedJobs.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4 max-w-lg mx-auto my-8 shadow-2xs">
              <div className="w-16 h-16 rounded-2xl bg-red-50 text-[#B90013] flex items-center justify-center mx-auto">
                <Bookmark className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-[#131B2E]">
                  Chưa có việc làm nào được lưu
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Khi bạn tìm thấy các vị trí thực tập hoặc việc làm phù hợp, hãy nhấn biểu tượng Lưu để lưu lại tại đây.
                </p>
              </div>
              <button
                onClick={() => onNavigate('jobs')}
                className="bg-[#B90013] hover:bg-[#A30010] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-xs transition-all inline-flex items-center gap-2"
              >
                <Briefcase className="w-4 h-4" />
                <span>Khám phá việc làm ngay</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {savedJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xs hover:border-slate-300 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-black text-sm shrink-0">
                        <Building2 className="w-6 h-6 text-slate-500" />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base sm:text-lg font-bold text-[#131B2E]">
                            {job.title}
                          </h3>
                          {job.matchPercentage >= 90 && (
                            <span className="px-2.5 py-0.5 bg-purple-50 text-[#712AE2] text-[10px] font-extrabold rounded-full border border-purple-100 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              Độ khớp {job.matchPercentage}%
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-slate-700">
                          {job.company} • <span className="text-slate-500 font-normal">{job.companyIndustry}</span>
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                          <span className="flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg">
                            {job.salaryDisplay}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {job.location} ({job.workMode})
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            Hạn: {job.deadline}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick remove button */}
                    <button
                      onClick={() => handleUnsaveJob(job.id, job.title)}
                      className="text-slate-400 hover:text-red-600 p-2 rounded-xl hover:bg-red-50 transition-colors self-start flex items-center gap-1.5 text-xs font-semibold"
                      title="Bỏ lưu việc làm này"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Bỏ lưu</span>
                    </button>
                  </div>

                  {/* Skills tags */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Kỹ năng yêu cầu:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {job.requiredSkills.map((sk) => (
                        <span
                          key={sk}
                          className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleApply(job)}
                        className="bg-[#B90013] hover:bg-[#A30010] text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Ứng tuyển ngay</span>
                      </button>

                      <button
                        onClick={() => handleOptimizeCv(job)}
                        className="bg-purple-50 hover:bg-purple-100 text-[#712AE2] border border-purple-200 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Tối ưu CV với AI</span>
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        if (onSelectJobDetail) {
                          onSelectJobDetail(job);
                        } else {
                          onNavigate('jobs');
                        }
                      }}
                      className="text-xs font-bold text-[#B90013] hover:underline flex items-center gap-1"
                    >
                      <span>Xem chi tiết JD đầy đủ</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SAVED EVENTS */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-[#131B2E] flex items-center gap-2">
              <span>Danh sách sự kiện đã lưu</span>
              <span className="text-xs text-slate-500 font-normal">
                ({savedEvents.length} sự kiện)
              </span>
            </h2>
            <button
              onClick={() => onNavigate('events')}
              className="text-xs font-bold text-[#B90013] hover:underline flex items-center gap-1"
            >
              <span>Xem tất cả sự kiện</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {savedEvents.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4 max-w-lg mx-auto my-8 shadow-2xs">
              <div className="w-16 h-16 rounded-2xl bg-red-50 text-[#B90013] flex items-center justify-center mx-auto">
                <Calendar className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-[#131B2E]">
                  Chưa có sự kiện nào được lưu
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Đánh dấu các buổi workshop, ngày hội tuyển dụng hoặc tọa đàm bạn muốn tham gia để không bỏ lỡ hạn đăng ký.
                </p>
              </div>
              <button
                onClick={() => onNavigate('events')}
                className="bg-[#B90013] hover:bg-[#A30010] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-xs transition-all inline-flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Khám phá sự kiện ngay</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {savedEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => {
                    if (onSelectEventDetail) {
                      onSelectEventDetail(event);
                    } else {
                      onNavigate('events');
                    }
                  }}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs hover:border-[#B90013] transition-all flex flex-col justify-between space-y-4 cursor-pointer group"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5">
                        {/* Calendar Day Box */}
                        <div className="w-13 h-13 rounded-2xl bg-red-50 text-[#B90013] flex flex-col items-center justify-center shrink-0 border border-red-100 shadow-2xs group-hover:bg-[#B90013] group-hover:text-white transition-colors">
                          <span className="text-[9px] font-black uppercase tracking-wider">
                            {event.month}
                          </span>
                          <span className="text-lg font-black leading-none mt-0.5">
                            {event.day}
                          </span>
                        </div>

                        <div className="space-y-1 min-w-0">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide bg-slate-100 text-slate-700">
                            {event.eventType}
                          </span>
                          <h3 className="text-base font-bold text-[#131B2E] group-hover:text-[#B90013] transition-colors leading-snug">
                            {event.title}
                          </h3>
                          <p className="text-xs font-semibold text-slate-500">
                            {event.organizer}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnsaveEvent(event.id, event.title);
                        }}
                        className="text-slate-400 hover:text-red-600 p-1.5 rounded-xl hover:bg-red-50 transition-colors"
                        title="Bỏ lưu sự kiện"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {event.description}
                    </p>

                    <div className="space-y-1 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{event.location}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {event.relatedSkills.map((sk) => (
                        <span
                          key={sk}
                          className="px-2 py-0.5 bg-slate-50 text-slate-600 rounded text-[11px]"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectEventDetail) {
                          onSelectEventDetail(event);
                        } else {
                          onNavigate('events');
                        }
                      }}
                      className="text-xs font-bold text-[#B90013] hover:underline flex items-center gap-1"
                    >
                      <span>Xem chi tiết sự kiện</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnsaveEvent(event.id, event.title);
                      }}
                      className="text-xs font-bold text-slate-400 hover:text-red-600"
                    >
                      Bỏ lưu
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Applied Confirmation Modal */}
      {appliedModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg sm:text-xl font-extrabold text-[#131B2E]">
                Ứng tuyển thành công!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Hồ sơ CV của bạn đã được gửi trực tiếp đến phòng nhân sự của{' '}
                <strong>{appliedJobTitle}</strong>.
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 text-xs text-purple-900 space-y-1">
              <span className="font-bold flex items-center gap-1 text-purple-950">
                <Sparkles className="w-3.5 h-3.5" />
                Mẹo phỏng vấn từ AI:
              </span>
              <p className="leading-relaxed">
                Hãy chuẩn bị kỹ phần giới thiệu bản thân và các số liệu dẫn chứng cụ thể từ các dự án thực chiến mà bạn đã xây dựng trên PTIT Career Hub.
              </p>
            </div>

            <button
              onClick={() => setAppliedModalOpen(false)}
              className="w-full py-3 bg-[#B90013] hover:bg-[#A30010] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md"
            >
              Đóng thông báo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
