import React, { useState, useEffect } from 'react';
import { ScreenView, TargetJob, UserProfileState } from '../../types';
import { trackEvent } from '../../utils/analytics';
import { recordJobInteraction, isJobExpired } from '../../services/jobs/jobService';
import {
  Building2,
  Heart,
  Share2,
  Sparkles,
  CheckCircle2,
  ChevronLeft,
  MapPin,
  Clock,
  Briefcase,
  GraduationCap,
  Globe,
  ExternalLink,
  Users,
  Award,
  FileText,
  AlertTriangle,
  Send,
  Check,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Target,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface JobDetailViewProps {
  job: TargetJob;
  allJobs: TargetJob[];
  onBack: () => void;
  onNavigate: (view: ScreenView) => void;
  onSelectJobForCv?: (job: TargetJob) => void;
  onSelectJobDetail?: (job: TargetJob) => void;
  onToggleSaveJob?: (jobId: string) => void;
  userProfile?: UserProfileState;
  onUpdateUserProfile?: (updated: Partial<UserProfileState>) => void;
}

export const JobDetailView: React.FC<JobDetailViewProps> = ({
  job,
  allJobs,
  onBack,
  onNavigate,
  onSelectJobForCv,
  onSelectJobDetail,
  onToggleSaveJob,
  userProfile,
  onUpdateUserProfile,
}) => {
  const [isTargetJob, setIsTargetJob] = useState(() => {
    try {
      if (localStorage.getItem('ptit_target_job_cleared') === 'true') return false;
      const storedId = localStorage.getItem('ptit_selected_target_job_id');
      if (storedId === job.id) return true;
    } catch {}
    return userProfile?.targetJobId === job.id;
  });
  const [targetToast, setTargetToast] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [redirectNotice, setRedirectNotice] = useState<string | null>(null);

  const companyName = job.companyName || job.company || 'Doanh nghiệp đối tác';
  const sourceName = job.sourceName || job.source || 'PTIT Career Portal';
  const sourceUrl = job.sourceUrl || job.companyWebsite || 'https://ptit.edu.vn';
  const applyUrl = job.applyUrl || job.sourceUrl;
  const publishedDate = job.publishedAt || job.postedDate || 'Gần đây';
  const deadlineDate = job.expiresAt || job.deadline || 'Đang nhận hồ sơ';
  const isExpired = job.status === 'expired' || isJobExpired({ ...job, companyName, salaryText: job.salaryDisplay, requirements: job.requirements || [], benefits: job.benefits || [], majorTags: job.targetMajors, skillTags: job.requiredSkills, careerTendencies: job.careerTendencies || [], suitableAcademicYears: job.suitableAcademicYears || [], careerCategory: job.jobField, publishedAt: job.publishedAt || '2026-01-01', expiresAt: job.expiresAt || job.deadline, sourceName, sourceUrl, applyUrl: applyUrl || '', verified: !!job.verified, status: job.status || 'active', employmentType: job.employmentType || 'Internship' });

  // GA4: job_view tracking on mount + record interaction
  useEffect(() => {
    if (!job?.id) return;
    try {
      trackEvent('job_view', {
        job_id: job.id,
        job_title: job.title,
        company: companyName,
      });

      recordJobInteraction(userProfile?.userId || 'anonymous', job.id, 'view').catch(() => {});
    } catch {
      // Safe fallback
    }
  }, [job?.id, companyName, job?.title, userProfile?.userId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleSetAsTargetJob = () => {
    if (isTargetJob) {
      // Gỡ bỏ mục tiêu định hướng
      setIsTargetJob(false);
      try {
        localStorage.setItem('ptit_target_job_cleared', 'true');
        localStorage.removeItem('ptit_selected_target_job_id');
      } catch {}

      if (onUpdateUserProfile) {
        onUpdateUserProfile({
          targetJobTitle: '',
          targetJobId: '',
          targetJobCompany: '',
          targetJobSalary: '',
          targetJobLocation: '',
          targetJobRequiredSkills: [],
          targetJobDescription: '',
          careerDirection: '',
          skillGap: null,
        });
      }
      showToast(`Đã gỡ bỏ "${job.title}" khỏi mục tiêu định hướng.`);
      return;
    }

    // Đưa vào công việc mục tiêu
    setIsTargetJob(true);
    try {
      localStorage.removeItem('ptit_target_job_cleared');
      localStorage.setItem('ptit_selected_target_job_id', job.id);
    } catch {}

    if (onUpdateUserProfile) {
      onUpdateUserProfile({
        targetJobTitle: job.title,
        targetJobCompany: companyName,
        targetJobId: job.id,
        targetJobSalary: job.salaryDisplay,
        targetJobLocation: job.location,
        targetJobRequiredSkills: job.requiredSkills,
        targetJobDescription: job.description,
        careerDirection: job.title,
      });
    }
    setTargetToast(true);
    setTimeout(() => {
      setTargetToast(false);
    }, 5000);
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch {
      // silent
    }
  };

  const handleToggleSave = () => {
    if (onToggleSaveJob) {
      onToggleSaveJob(job.id);
    }
    showToast(
      job.isSaved
        ? `Đã bỏ lưu việc làm "${job.title}"`
        : `Đã lưu việc làm "${job.title}" vào mục đã lưu!`
    );
  };

  const handleShare = () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
        showToast('Đã sao chép liên kết cơ hội việc làm vào bộ nhớ tạm!');
      }
    } catch {
      showToast('Đã chia sẻ cơ hội việc làm!');
    }
  };

  /**
   * Rule #6: CHỨC NĂNG ỨNG TUYỂN THẬT
   * Directs user to the enterprise application portal with GA4 analytics, URL checks, and friendly notices.
   */
  const handleApply = () => {
    if (isExpired) {
      showToast('Cơ hội việc làm này đã hết hạn ứng tuyển.');
      return;
    }

    // Step 1: Check if applyUrl exists
    if (!applyUrl || !applyUrl.trim()) {
      showToast('Link ứng tuyển hiện không khả dụng. Vui lòng thử lại sau.');
      return;
    }

    // Step 2: Validate URL protocol
    try {
      const parsed = new URL(applyUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        showToast('Link ứng tuyển hiện không khả dụng. Vui lòng thử lại sau.');
        return;
      }
    } catch {
      showToast('Link ứng tuyển hiện không khả dụng. Vui lòng thử lại sau.');
      return;
    }

    // Step 3: Dispatch GA4 event job_click_apply
    try {
      trackEvent('job_click_apply', {
        job_id: job.id,
        job_title: job.title,
        company: companyName,
        employment_type: job.employmentType || job.jobType || 'Internship',
      });
    } catch {
      // Fail silently
    }

    // Step 5: Dispatch GA4 event job_external_redirect
    try {
      trackEvent('job_external_redirect', {
        job_id: job.id,
        company: companyName,
      });
    } catch {
      // Fail silently
    }

    // Record interaction
    recordJobInteraction(userProfile?.userId || 'anonymous', job.id, 'click_apply').catch(() => {});

    // Step 6: Inform user with friendly notice
    const noticeText = `Bạn đang được chuyển đến trang tuyển dụng của ${companyName} để hoàn tất ứng tuyển.`;
    setRedirectNotice(noticeText);
    showToast(noticeText);

    try {
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
    } catch {
      // silent
    }

    // Step 4: Open applyUrl in new tab
    setTimeout(() => {
      window.open(applyUrl, '_blank', 'noopener,noreferrer');
      setRedirectNotice(null);
    }, 600);
  };

  const handleOpenSource = () => {
    if (!sourceUrl) return;
    window.open(sourceUrl, '_blank', 'noopener,noreferrer');
  };

  // Related jobs in the same field or company
  const relatedJobs = allJobs
    .filter((j) => j.id !== job.id && (j.jobField === job.jobField || j.companyIndustry === job.companyIndustry))
    .slice(0, 3);

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-9 space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 bg-[#131B2E] text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Redirect Notice Banner */}
      {redirectNotice && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-3 text-xs text-blue-900 animate-fade-in">
          <ExternalLink className="w-4 h-4 text-blue-600 shrink-0 animate-pulse" />
          <span className="font-semibold">{redirectNotice}</span>
        </div>
      )}

      {/* Navigation Breadcrumb & Back button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button
            onClick={() => onNavigate('home')}
            className="hover:text-slate-800 transition-colors font-medium"
          >
            Trang chủ
          </button>
          <span>/</span>
          <button
            onClick={onBack}
            className="hover:text-[#B90013] transition-colors font-medium text-slate-700"
          >
            Việc làm
          </button>
          <span>/</span>
          <span className="text-[#B90013] font-bold truncate max-w-[200px] sm:max-w-xs">
            {job.title}
          </span>
        </div>

        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-[#B90013] hover:border-red-200 transition-all shadow-2xs cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Quay lại danh sách việc làm</span>
        </button>
      </div>

      {/* Main Job Hero Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-[0_4px_25px_rgba(0,0,0,0.03)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-4">
            {job.companyLogo ? (
              <img
                src={job.companyLogo}
                alt={companyName}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-2xs shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-red-50 text-[#B90013] flex items-center justify-center font-bold text-xl shrink-0 border border-red-100 shadow-2xs">
                <Building2 className="w-8 h-8" />
              </div>
            )}

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {job.verified ? (
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold rounded-full border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Xác minh chính thức</span>
                  </span>
                ) : null}

                {job.isDemo ? (
                  <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 text-[10px] font-black rounded-full border border-amber-200 uppercase tracking-wider">
                    Bản DEMO thử nghiệm
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-extrabold rounded-full border border-blue-200">
                    Cơ hội thực tế
                  </span>
                )}

                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded-full">
                  {job.employmentType || job.jobType}
                </span>

                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded-full">
                  {job.careerCategory || job.jobField}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#131B2E] tracking-tight">
                {job.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-700">
                <span className="text-slate-900 text-sm">{companyName}</span>
                <span className="text-slate-300">•</span>
                <span className="font-normal text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {job.location}
                </span>
                <span className="text-slate-300">•</span>
                <span className="font-normal text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  Đăng ngày: <strong className="text-slate-700">{publishedDate}</strong>
                </span>
                <span className="text-slate-300">•</span>
                <span className="font-normal text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  Hạn nộp:{' '}
                  <strong className={isExpired ? 'text-red-700 font-bold' : 'text-slate-800 font-bold'}>
                    {deadlineDate}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Save & Share */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              onClick={handleShare}
              className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors cursor-pointer"
              title="Chia sẻ công việc"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              id={`btn-save-job-detail-${job.id}`}
              onClick={handleToggleSave}
              className={`px-4 py-3 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                job.isSaved
                  ? 'bg-red-50 border-red-200 text-[#B90013] shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-red-200 hover:text-[#B90013]'
              }`}
              title={job.isSaved ? 'Bỏ lưu việc làm khỏi yêu thích' : 'Lưu công việc vào mục yêu thích ❤️'}
            >
              <Heart className={`w-4 h-4 transition-all ${job.isSaved ? 'fill-[#B90013] text-[#B90013] scale-110' : ''}`} />
              <span>{job.isSaved ? 'Đã lưu yêu thích' : 'Lưu việc làm'}</span>
            </button>
          </div>
        </div>

        {/* Primary Call to Action buttons: Kích thước nhỏ gọn, chỉ hiển thị: Ứng tuyển ngay & Đưa vào mục tiêu */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          {isExpired ? (
            <div className="bg-slate-100 border border-slate-300 text-slate-500 font-medium py-2 px-3.5 rounded-xl text-center text-xs flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Cơ hội việc làm này đã hết hạn ứng tuyển ({deadlineDate})</span>
            </div>
          ) : (
            <button
              id="btn-apply-job-now"
              onClick={handleApply}
              className="px-4 py-2 rounded-xl bg-[#B90013] hover:bg-[#A30010] text-white font-bold text-xs shadow-2xs hover:shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              title="Ứng tuyển trực tiếp vào vị trí này"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ứng tuyển ngay</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </button>
          )}

          {/* Đưa vào mục tiêu */}
          <button
            id="btn-set-as-target-job"
            onClick={handleSetAsTargetJob}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
              isTargetJob
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-white hover:bg-red-50 text-[#B90013] border border-[#B90013]'
            }`}
            title={isTargetJob ? 'Vị trí này đang là công việc mục tiêu' : 'Đặt làm công việc mục tiêu'}
          >
            {isTargetJob ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>✓ Đang là mục tiêu</span>
              </>
            ) : (
              <>
                <Target className="w-3.5 h-3.5" />
                <span>Đưa vào mục tiêu</span>
              </>
            )}
          </button>

          {/* Tối ưu CV với AI theo công việc này */}
          <button
            onClick={() => {
              if (onSelectJobForCv) onSelectJobForCv(job);
              onNavigate('cv-builder');
            }}
            className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            title="Mở AI CV để tải file CV lên và nhận gợi ý tối ưu theo vị trí này"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Tối ưu CV với AI</span>
          </button>

          {isTargetJob && (
            <button
              onClick={() => onNavigate('roadmap')}
              className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-red-50 text-[#B90013] border border-red-200/90 font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
              title="Xem lộ trình Career Map cho công việc mục tiêu này"
            >
              <span>Xem Career Map</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Target Job Set Toast */}
        {targetToast && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <strong>Đã thiết lập vị trí mục tiêu thành công!</strong>
                <p className="text-emerald-800">
                  Lộ trình Career Map sẽ tự động đồng bộ kỹ năng và kiến thức bám sát vị trí này.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('roadmap')}
              className="px-4 py-2 bg-[#B90013] hover:bg-[#A30010] text-white font-bold rounded-xl shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Mở Career Map ngay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Source info notice complying with rule #17 */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Nguồn tuyển dụng:</span>
            <span className="text-slate-700 font-bold">{sourceName}</span>
          </div>
          <button
            onClick={handleOpenSource}
            className="text-[#B90013] hover:underline font-bold flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>{sourceUrl}</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Key Job Meta Overview Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-slate-400 block text-[11px] font-medium">Mức lương</span>
            <span className="font-bold text-slate-900 block text-sm text-emerald-700">
              {job.salaryDisplay || job.salaryText}
            </span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-slate-400 block text-[11px] font-medium">Hình thức / Loại hình</span>
            <span className="font-bold text-slate-900 block text-sm">
              {job.employmentType || job.jobType}
            </span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-slate-400 block text-[11px] font-medium">Năm học phù hợp</span>
            <span className="font-bold text-slate-900 block text-sm">
              {job.suitableAcademicYears?.join(', ') || 'Năm 2, 3, 4'}
            </span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-slate-400 block text-[11px] font-medium">Cấp bậc vị trí</span>
            <span className="font-bold text-slate-900 block text-sm">{job.level || 'Thực tập sinh'}</span>
          </div>
        </div>

        {/* Transparent Recommendation Scoring Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-purple-50/80 via-indigo-50/40 to-white border border-purple-100 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white font-black text-xl flex items-center justify-center shadow-md shrink-0">
                {job.recommendationScore ?? job.matchPercentage}%
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-[#131B2E]">
                    Mức độ phù hợp với hồ sơ sinh viên
                  </h3>
                  <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 text-[11px] font-extrabold rounded-full">
                    Thuật toán minh bạch
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  {job.recommendationReason ||
                    `Được đề xuất dựa trên hồ sơ ngành học (${userProfile?.major || 'PTIT'}), mục tiêu nghề nghiệp và kỹ năng của bạn.`}
                </p>
              </div>
            </div>

            {(job.recommendationScore ?? job.matchPercentage) >= 85 ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-black rounded-full self-start sm:self-auto shadow-2xs">
                ⭐ Có thể phù hợp cao với bạn
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-100 text-purple-800 text-xs font-black rounded-full self-start sm:self-auto shadow-2xs">
                Được đề xuất cho bạn
              </span>
            )}
          </div>

          {/* Skill tags */}
          <div className="p-4 bg-white/95 rounded-2xl border border-purple-100/80 shadow-2xs space-y-2">
            <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="w-4 h-4 text-purple-600" />
              <span>Kỹ năng trọng tâm của vị trí:</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(job.skillTags || job.requiredSkills || []).map((skill, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-purple-50 text-purple-800 rounded-lg text-[11px] font-semibold border border-purple-200/60"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Thông tin Doanh nghiệp tuyển dụng */}
        <div className="space-y-3 pt-2">
          <h3 className="font-extrabold text-sm text-[#131B2E] uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#B90013]" />
            <span>Thông tin về công ty tuyển dụng</span>
          </h3>
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 text-xs leading-relaxed text-slate-700">
            <p className="font-medium text-slate-800">
              {job.companyOverview ||
                `${companyName} là đơn vị tuyển dụng chính thức, cơ hội việc làm & thực tập dành cho sinh viên Học viện Công nghệ Bưu chính Viễn thông.`}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-200/60 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Địa điểm: {job.location}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Ngành ưu tiên: <strong>{(job.majorTags || job.targetMajors || []).join(', ')}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-[#B90013]">
                <Globe className="w-4 h-4 shrink-0" />
                <button
                  onClick={handleOpenSource}
                  className="hover:underline font-bold flex items-center gap-1 cursor-pointer truncate"
                >
                  <span>Cổng tuyển dụng: {sourceName}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </button>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Award className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Trạng thái: <strong>{isExpired ? 'Hết hạn' : 'Đang mở tuyển dụng'}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Mô tả công việc chi tiết (JD) */}
        <div className="space-y-3 text-xs leading-relaxed text-slate-700">
          <h3 className="font-extrabold text-sm text-[#131B2E] uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#B90013]" />
            <span>Mô tả công việc & Trách nhiệm chính (JD)</span>
          </h3>
          <p className="text-slate-800 font-medium whitespace-pre-line">{job.description}</p>
          {job.responsibilities && job.responsibilities.length > 0 && (
            <ul className="space-y-2 pl-5 list-disc text-slate-700">
              {job.responsibilities.map((res, i) => (
                <li key={i}>{res}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Yêu cầu ứng viên (Requirements) */}
        {job.requirements && job.requirements.length > 0 && (
          <div className="space-y-3 text-xs leading-relaxed text-slate-700">
            <h3 className="font-extrabold text-sm text-[#131B2E] uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-[#B90013]" />
              <span>Yêu cầu đối với ứng viên</span>
            </h3>
            <ul className="space-y-2.5 pl-5 list-disc text-slate-700">
              {job.requirements.map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Quyền lợi & Chế độ đãi ngộ (Benefits) */}
        {job.benefits && job.benefits.length > 0 && (
          <div className="space-y-3 text-xs leading-relaxed text-slate-700">
            <h3 className="font-extrabold text-sm text-[#131B2E] uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Quyền lợi & Chế độ đãi ngộ</span>
            </h3>
            <ul className="space-y-2.5 pl-5 list-disc text-slate-700">
              {job.benefits.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer meta & Source */}
        <div className="pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          {sourceUrl ? (
            <button
              onClick={handleOpenSource}
              className="hover:text-[#B90013] transition-colors inline-flex items-center gap-1 font-medium cursor-pointer"
              title="Xem tin tuyển dụng gốc"
            >
              <span>Nguồn tuyển dụng: {sourceName}</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </button>
          ) : (
            <span>Nguồn tuyển dụng: {sourceName}</span>
          )}
          <span>Đăng ngày: {publishedDate} • Hạn nộp: {deadlineDate}</span>
        </div>
      </div>

      {/* Related Jobs Section */}
      {relatedJobs.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-[0_4px_25px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#131B2E] flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#B90013]" />
              <span>Việc làm tương tự cùng lĩnh vực</span>
            </h3>
            <button
              onClick={onBack}
              className="text-xs font-bold text-[#B90013] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedJobs.map((rJob) => (
              <div
                key={rJob.id}
                onClick={() => {
                  if (onSelectJobDetail) onSelectJobDetail(rJob);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="p-4 rounded-2xl border border-slate-200/90 hover:border-[#B90013] hover:shadow-xs cursor-pointer transition-all space-y-2.5 group bg-white"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#B90013] transition-colors line-clamp-1">
                    {rJob.title}
                  </h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onToggleSaveJob) onToggleSaveJob(rJob.id);
                      showToast(
                        rJob.isSaved
                          ? `Đã bỏ lưu "${rJob.title}"`
                          : `Đã lưu "${rJob.title}" vào mục yêu thích ❤️!`
                      );
                    }}
                    className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
                      rJob.isSaved ? 'bg-red-50 text-[#B90013] border-red-200' : 'text-slate-400 hover:text-[#B90013] border-slate-200'
                    }`}
                    title={rJob.isSaved ? 'Bỏ lưu yêu thích' : 'Lưu vào yêu thích ❤️'}
                  >
                    <Heart className={`w-3.5 h-3.5 ${rJob.isSaved ? 'fill-[#B90013] text-[#B90013]' : ''}`} />
                  </button>
                </div>
                <p className="text-xs font-medium text-slate-600 truncate">{rJob.companyName || rJob.company}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span className="text-emerald-700 font-bold">{rJob.salaryDisplay}</span>
                  <span>{rJob.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
