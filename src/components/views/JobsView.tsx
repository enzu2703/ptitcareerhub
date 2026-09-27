import React, { useState, useEffect, useMemo } from 'react';
import { ScreenView, TargetJob, UserProfileState } from '../../types';
import { TARGET_JOBS } from '../../data/mockData';
import {
  getActiveJobs,
  getRecommendedJobs,
  recordJobInteraction,
  isJobExpired,
} from '../../services/jobs/jobService';
import { trackEvent } from '../../utils/analytics';
import {
  Building2,
  Heart,
  Sparkles,
  CheckCircle2,
  SlidersHorizontal,
  MapPin,
  Clock,
  Briefcase,
  X,
  Search,
  ArrowRight,
  Filter,
  Compass,
  Info,
  ShieldCheck,
  Send,
  ExternalLink,
  Calendar,
  AlertCircle,
  RefreshCw,
  Target,
  History,
  ChevronRight,
  FileText,
  Map,
  Check,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface JobsViewProps {
  onNavigate: (view: ScreenView) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onSelectJobDetail: (job: TargetJob) => void;
  jobs?: TargetJob[];
  onToggleSaveJob?: (jobId: string) => void;
  userProfile?: UserProfileState;
  onUpdateUserProfile?: (partial: Partial<UserProfileState>) => void;
}

const SEARCH_HISTORY_STORAGE_KEY = 'ptit_job_search_history_v1';
const TARGET_JOB_STORAGE_KEY = 'ptit_selected_target_job_id';
const TARGET_JOB_CLEARED_KEY = 'ptit_target_job_cleared';

export const JobsView: React.FC<JobsViewProps> = ({
  onNavigate,
  searchTerm,
  onSearchChange,
  onSelectJobDetail,
  jobs: externalJobs,
  onToggleSaveJob: externalToggleSaveJob,
  userProfile,
  onUpdateUserProfile,
}) => {
  const [jobsList, setJobsList] = useState<TargetJob[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<TargetJob[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Target Job Removal Flag
  const [isTargetRemoved, setIsTargetRemoved] = useState<boolean>(() => {
    try {
      return localStorage.getItem(TARGET_JOB_CLEARED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Filters State
  const [categoryFilter, setCategoryFilter] = useState('Tất cả');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState('Tất cả');
  const [locationFilter, setLocationFilter] = useState('Tất cả');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [includeDemoJobs, setIncludeDemoJobs] = useState(true);
  const [savedOnly, setSavedOnly] = useState(false);

  // Search History State
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(SEARCH_HISTORY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.slice(0, 6);
      }
    } catch {
      // fallback
    }
    return ['Marketing', 'Shopee', 'Thực tập sinh', 'Data Analyst'];
  });

  // Track search term in search history
  const addSearchToHistory = (term: string) => {
    const trimmed = term.trim();
    if (trimmed.length < 2) return;
    setSearchHistory((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 6);
      try {
        localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // silent
      }
      return updated;
    });
  };

  const handleClearSearchHistory = () => {
    setSearchHistory([]);
    try {
      localStorage.removeItem(SEARCH_HISTORY_STORAGE_KEY);
    } catch {
      // silent
    }
  };

  // Send GA4 job_list_view on mount
  useEffect(() => {
    try {
      trackEvent('job_list_view');
    } catch {
      // Safe fallback
    }
  }, []);

  // Fetch jobs from jobService
  const loadJobsData = async () => {
    setIsLoading(true);
    setErrorNotice(null);
    try {
      const [active, recommended] = await Promise.all([
        getActiveJobs(includeDemoJobs),
        getRecommendedJobs(userProfile, null, includeDemoJobs),
      ]);
      setJobsList(active);
      setRecommendedJobs(recommended);
    } catch (err) {
      console.warn('Error loading jobs from service:', err);
      setErrorNotice('Đang tải danh sách cơ hội việc làm dự phòng...');
      if (externalJobs && externalJobs.length > 0) {
        setJobsList(externalJobs);
        setRecommendedJobs(externalJobs);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJobsData();
  }, [includeDemoJobs, userProfile]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3400);
  };

  // Toggle Save Job (Heart ❤️)
  const handleToggleSave = (e: React.MouseEvent, job: TargetJob) => {
    e.stopPropagation();
    const willBeSaved = !job.isSaved;

    if (externalToggleSaveJob) {
      externalToggleSaveJob(job.id);
    }

    setJobsList((prev) =>
      prev.map((j) => (j.id === job.id ? { ...j, isSaved: !j.isSaved } : j))
    );
    setRecommendedJobs((prev) =>
      prev.map((j) => (j.id === job.id ? { ...j, isSaved: !j.isSaved } : j))
    );

    if (willBeSaved) {
      try {
        confetti({ particleCount: 30, spread: 55, origin: { y: 0.6 } });
      } catch {
        // silent
      }
      showToast(`Đã lưu "${job.title}" vào danh sách yêu thích ❤️`);
    } else {
      showToast(`Đã bỏ lưu việc làm "${job.title}"`);
    }
  };

  // Set as Target Job (Enforcing 1 SINGLE target job)
  const handleSetTargetJob = (e: React.MouseEvent, job: TargetJob) => {
    e.stopPropagation();
    const company = job.companyName || job.company || 'Doanh nghiệp đối tác PTIT';

    setIsTargetRemoved(false);
    try {
      localStorage.removeItem(TARGET_JOB_CLEARED_KEY);
      localStorage.setItem(TARGET_JOB_STORAGE_KEY, job.id);
    } catch {
      // silent
    }

    if (onUpdateUserProfile) {
      onUpdateUserProfile({
        targetJobTitle: job.title,
        targetJobCompany: company,
        targetJobId: job.id,
        targetJobSalary: job.salaryDisplay,
        targetJobLocation: job.location,
        targetJobRequiredSkills: job.requiredSkills || job.skillTags || [],
        targetJobDescription: job.description,
        careerDirection: job.title,
      });
    }

    try {
      confetti({ particleCount: 45, spread: 60, origin: { y: 0.5 } });
    } catch {
      // silent
    }

    showToast(`Đã đặt "${job.title}" làm Công việc mục tiêu duy nhất! Lộ trình Career Map đã được cập nhật.`);
    
    // Smooth scroll to top to view the target job banner
    const targetBanner = document.getElementById('target-job-banner');
    if (targetBanner) {
      targetBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Remove Target Job (Gỡ bỏ mục tiêu để chọn JD khác)
  const handleRemoveTargetJob = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTargetRemoved(true);

    try {
      localStorage.setItem(TARGET_JOB_CLEARED_KEY, 'true');
      localStorage.removeItem(TARGET_JOB_STORAGE_KEY);
    } catch {
      // silent
    }

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

    showToast('Đã gỡ bỏ công việc mục tiêu. Bạn có thể chọn 1 JD mới từ các gợi ý Career Check bên dưới!');
  };


  // Quick Apply direct redirect handler
  const handleQuickApply = (e: React.MouseEvent, job: TargetJob) => {
    e.stopPropagation();
    const company = job.companyName || job.company || 'Doanh nghiệp tuyển dụng';
    const applyUrl = job.applyUrl || job.sourceUrl;

    if (!applyUrl || !applyUrl.trim()) {
      showToast('Link ứng tuyển hiện không khả dụng. Vui lòng thử lại sau.');
      return;
    }

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

    try {
      trackEvent('job_click_apply', {
        job_id: job.id,
        job_title: job.title,
        company,
        employment_type: job.employmentType || job.jobType || 'Internship',
      });
      trackEvent('job_external_redirect', {
        job_id: job.id,
        company,
      });
    } catch {
      // Safe fallback
    }

    recordJobInteraction(userProfile?.userId || 'anonymous', job.id, 'click_apply').catch(() => {});

    showToast(`Bạn đang được chuyển đến trang tuyển dụng của ${company} để hoàn tất ứng tuyển.`);
    try {
      confetti({ particleCount: 25, spread: 50, origin: { y: 0.7 } });
    } catch {
      // silent
    }

    setTimeout(() => {
      window.open(applyUrl, '_blank', 'noopener,noreferrer');
    }, 500);
  };

  const resetAllFilters = () => {
    setCategoryFilter('Tất cả');
    setEmploymentTypeFilter('Tất cả');
    setLocationFilter('Tất cả');
    setVerifiedOnly(false);
    setSavedOnly(false);
    onSearchChange('');
  };

  // Resolved Current Target Job (Single target constraint)
  const currentTargetJob: TargetJob | null = useMemo(() => {
    if (isTargetRemoved) return null;
    if (userProfile?.targetJobId === '' && userProfile?.targetJobTitle === '') return null;

    const allCandidates = [...jobsList, ...TARGET_JOBS, ...(externalJobs || [])];

    // Priority 1: Check localStorage override if user selected explicitly
    const storedId = (() => {
      try {
        return localStorage.getItem(TARGET_JOB_STORAGE_KEY);
      } catch {
        return null;
      }
    })();

    const activeId = userProfile?.targetJobId || storedId;
    if (activeId && activeId !== '') {
      const found = allCandidates.find((j) => j.id === activeId);
      if (found) return found;
    }

    // Priority 2: Check targetJobTitle in profile
    if (userProfile?.targetJobTitle && userProfile.targetJobTitle.trim() !== '') {
      const foundByTitle = allCandidates.find(
        (j) =>
          j.title.toLowerCase().includes(userProfile.targetJobTitle!.toLowerCase()) ||
          userProfile.targetJobTitle!.toLowerCase().includes(j.title.toLowerCase())
      );
      if (foundByTitle) return foundByTitle;

      return {
        id: userProfile.targetJobId || 'target-from-profile',
        title: userProfile.targetJobTitle,
        company: userProfile.targetJobCompany || 'Doanh nghiệp đối tác PTIT',
        location: userProfile.targetJobLocation || 'Hà Nội',
        salaryDisplay: userProfile.targetJobSalary || 'Hỗ trợ 4.000.000 – 7.000.000 VNĐ/tháng',
        description: userProfile.targetJobDescription || 'Mục tiêu nghề nghiệp đã lựa chọn từ danh sách việc làm đối tác PTIT.',
        requiredSkills: userProfile.targetJobRequiredSkills || ['Marketing số', 'Kỹ năng giao tiếp', 'Tư duy số liệu'],
        responsibilities: [],
        benefits: [],
        targetMajors: [userProfile.major || 'Marketing & Truyền thông số'],
        level: 'Thực tập sinh',
        jobType: 'Thực tập',
        matchPercentage: 94,
        isSaved: false,
        sourceUrl: 'https://ptit.edu.vn/career-hub/target-job',
      };
    }

    // If never chosen and never removed, use default
    return TARGET_JOBS[0] || null;
  }, [
    isTargetRemoved,
    userProfile?.targetJobId,
    userProfile?.targetJobTitle,
    userProfile?.targetJobCompany,
    userProfile?.targetJobSalary,
    userProfile?.targetJobLocation,
    userProfile?.targetJobRequiredSkills,
    userProfile?.targetJobDescription,
    userProfile?.major,
    jobsList,
    externalJobs,
  ]);

  // Quick suggestions based on Career Check for when Target Job is removed
  const careerCheckSuggestions = useMemo(() => {
    const source = jobsList.length > 0 ? jobsList : TARGET_JOBS;
    return source.slice(0, 3);
  }, [jobsList]);

  // Personalized score calculator that factors in User Info + Search History + Target Job
  const calculatePersonalizedScore = (job: TargetJob): { score: number; reason: string; matchedKeyword?: string } => {
    let score = job.recommendationScore ?? job.matchPercentage ?? 70;
    let reason = job.recommendationReason || '';
    let matchedKeyword: string | undefined = undefined;

    // 1. Search History Boost (+12%)
    if (searchHistory.length > 0) {
      for (const keyword of searchHistory) {
        const k = keyword.toLowerCase();
        const inTitle = job.title?.toLowerCase().includes(k);
        const inComp = (job.companyName || job.company)?.toLowerCase().includes(k);
        const inSkills = (job.skillTags || job.requiredSkills || []).some((s) => s.toLowerCase().includes(k));
        const inField = (job.careerCategory || job.jobField)?.toLowerCase().includes(k);

        if (inTitle || inComp || inSkills || inField) {
          score = Math.min(99, score + 12);
          matchedKeyword = keyword;
          reason = `Khớp từ khóa bạn vừa tìm kiếm: "${keyword}"`;
          break;
        }
      }
    }

    // 2. Target Job Alignment Boost (+10%)
    if (currentTargetJob && currentTargetJob.id !== job.id) {
      const sameCategory =
        job.careerCategory && currentTargetJob.careerCategory &&
        job.careerCategory.toLowerCase() === currentTargetJob.careerCategory.toLowerCase();
      const titleOverlap =
        job.title.toLowerCase().includes(currentTargetJob.title.toLowerCase().split(' ')[0] || '');

      if (sameCategory || titleOverlap) {
        score = Math.min(99, score + 10);
        if (!matchedKeyword) {
          reason = `Bổ trợ trực tiếp cho vị trí mục tiêu: "${currentTargetJob.title}"`;
        }
      }
    }

    // 3. User Major Boost
    if (userProfile?.major) {
      const m = userProfile.major.toLowerCase();
      const matchesMajor = (job.majorTags || job.targetMajors || []).some(
        (mj) => m.includes(mj.toLowerCase()) || mj.toLowerCase().includes(m.split(' ')[0] || '')
      );
      if (matchesMajor) {
        score = Math.min(99, score + 8);
        if (!reason) {
          reason = `Phù hợp với chuyên ngành đào tạo ${userProfile.major} tại PTIT`;
        }
      }
    }

    return { score, reason, matchedKeyword };
  };

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    const sourceList = jobsList.length > 0 ? jobsList : externalJobs || [];
    return sourceList.filter((job) => {
      // Check expired
      if (
        job.status === 'expired' ||
        isJobExpired({
          ...job,
          companyName: job.companyName || job.company,
          salaryText: job.salaryDisplay,
          requirements: job.requirements || [],
          benefits: job.benefits || [],
          majorTags: job.targetMajors,
          skillTags: job.requiredSkills,
          careerTendencies: job.careerTendencies || [],
          suitableAcademicYears: job.suitableAcademicYears || [],
          careerCategory: job.jobField,
          publishedAt: job.publishedAt || '2026-01-01',
          expiresAt: job.expiresAt || job.deadline,
          sourceName: job.sourceName || job.source,
          sourceUrl: job.sourceUrl || '',
          applyUrl: job.applyUrl || '',
          verified: !!job.verified,
          status: job.status || 'active',
          employmentType: job.employmentType || 'Internship',
        })
      ) {
        return false;
      }

      // Saved only filter
      if (savedOnly && !job.isSaved) {
        return false;
      }

      // Keyword search
      if (searchTerm && searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchTitle = job.title?.toLowerCase().includes(q) ?? false;
        const matchComp = (job.companyName || job.company)?.toLowerCase().includes(q) ?? false;
        const matchSkills = (job.skillTags || job.requiredSkills || []).some((s) => s.toLowerCase().includes(q));
        const matchLoc = job.location?.toLowerCase().includes(q) ?? false;
        const matchField = (job.careerCategory || job.jobField)?.toLowerCase().includes(q) ?? false;
        if (!matchTitle && !matchComp && !matchSkills && !matchLoc && !matchField) {
          return false;
        }
      }

      // Category filter
      if (categoryFilter !== 'Tất cả') {
        const field = (job.careerCategory || job.jobField || '').toLowerCase();
        if (!field.includes(categoryFilter.toLowerCase())) {
          return false;
        }
      }

      // Employment type filter
      if (employmentTypeFilter !== 'Tất cả') {
        const type = job.employmentType || job.jobType;
        if (type !== employmentTypeFilter) return false;
      }

      // Location filter
      if (locationFilter !== 'Tất cả') {
        const loc = (job.location || '').toLowerCase();
        if (locationFilter === 'Remote') {
          if (!loc.includes('remote') && !loc.includes('từ xa') && !loc.includes('trực tuyến')) return false;
        } else if (locationFilter === 'Hồ Chí Minh' || locationFilter === 'TP. HCM') {
          if (!loc.includes('hồ chí minh') && !loc.includes('hcm')) return false;
        } else if (locationFilter === 'Hà Nội') {
          if (!loc.includes('hà nội') && !loc.includes('ha noi')) return false;
        } else if (!job.location?.includes(locationFilter)) {
          return false;
        }
      }

      // Verified only
      if (verifiedOnly && !job.verified) {
        return false;
      }

      return true;
    });
  }, [jobsList, externalJobs, searchTerm, categoryFilter, employmentTypeFilter, locationFilter, verifiedOnly, savedOnly]);

  // Smart suggestions ranked by personalized score
  const smartJobSuggestions = useMemo(() => {
    const source = jobsList.length > 0 ? jobsList : externalJobs || [];
    // Exclude the current target job from suggestions to avoid duplication
    const candidates = source.filter((j) => !currentTargetJob || j.id !== currentTargetJob.id);

    return candidates
      .map((job) => {
        const { score, reason, matchedKeyword } = calculatePersonalizedScore(job);
        return {
          ...job,
          calculatedScore: score,
          calculatedReason: reason,
          matchedKeyword,
        };
      })
      .sort((a, b) => b.calculatedScore - a.calculatedScore)
      .slice(0, 4);
  }, [jobsList, externalJobs, currentTargetJob, searchHistory, userProfile]);

  const savedJobsCount = useMemo(() => {
    const source = jobsList.length > 0 ? jobsList : externalJobs || [];
    return source.filter((j) => j.isSaved).length;
  }, [jobsList, externalJobs]);

  const activeChips: { label: string; onRemove: () => void }[] = [];
  if (searchTerm) activeChips.push({ label: `Tìm kiếm: "${searchTerm}"`, onRemove: () => onSearchChange('') });
  if (categoryFilter !== 'Tất cả') activeChips.push({ label: `Ngành: ${categoryFilter}`, onRemove: () => setCategoryFilter('Tất cả') });
  if (employmentTypeFilter !== 'Tất cả') activeChips.push({ label: `Loại hình: ${employmentTypeFilter}`, onRemove: () => setEmploymentTypeFilter('Tất cả') });
  if (locationFilter !== 'Tất cả') activeChips.push({ label: `Địa điểm: ${locationFilter}`, onRemove: () => setLocationFilter('Tất cả') });
  if (verifiedOnly) activeChips.push({ label: 'Chỉ xác minh', onRemove: () => setVerifiedOnly(false) });
  if (savedOnly) activeChips.push({ label: 'Việc làm đã lưu ❤️', onRemove: () => setSavedOnly(false) });

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-9 space-y-7 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 bg-[#131B2E] text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 bg-red-50 text-[#B90013] text-[11px] font-extrabold rounded-full uppercase tracking-wider border border-red-100">
              Cổng Cơ hội Nghề nghiệp PTIT
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-extrabold rounded-full border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Đối tác Doanh nghiệp</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#131B2E] tracking-tight">
            Việc làm & Thực tập Doanh nghiệp
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Khám phá cơ hội thực tập, trainee và việc làm chính thức từ các doanh nghiệp uy tín.
            Hệ thống tự động đề xuất dựa trên ngành học, kết quả Career Check và kỹ năng của bạn.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-end">
          <button
            onClick={loadJobsData}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
            title="Tải lại danh sách việc làm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => onNavigate('assessment-intro')}
            className="px-4 py-2.5 rounded-xl bg-[#B90013] hover:bg-[#A30010] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Đánh giá Career Check</span>
          </button>
        </div>
      </div>

      {/* CÔNG VIỆC MỤC TIÊU (CHỈ 1 MỤC TIÊU DUY NHẤT) HOẶC "THÊM CÔNG VIỆC MỤC TIÊU CỦA BẠN" NẾU ĐÃ GỠ */}
      <div id="target-job-banner" className="space-y-3">
        {currentTargetJob ? (
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-red-50/80 via-white to-amber-50/60 border-2 border-red-200/90 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-red-100/90 pb-3.5">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#B90013] text-white flex items-center justify-center font-black shrink-0 shadow-xs text-xl">
                  🎯
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#B90013] text-white text-[10px] font-black uppercase tracking-wider">
                      Mục tiêu duy nhất đang theo đuổi
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                      ✓ Đã đồng bộ với Lộ trình Career Map 1–2 năm
                    </span>
                  </div>
                  <h3 className="font-extrabold text-[#131B2E] text-lg sm:text-xl flex flex-wrap items-center gap-2">
                    <span>{currentTargetJob.title}</span>
                    <span className="text-xs font-semibold text-slate-500">
                      • {currentTargetJob.companyName || currentTargetJob.company}
                    </span>
                  </h3>
                </div>
              </div>

              {/* Action Buttons for Target Job */}
              <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                <button
                  onClick={() => onNavigate('roadmap')}
                  className="px-3.5 py-2 rounded-xl bg-[#B90013] hover:bg-[#A30010] text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  title="Xem lộ trình học tập và tích lũy kỹ năng cho vị trí này"
                >
                  <Map className="w-3.5 h-3.5" />
                  <span>Xem Career Map</span>
                  <ChevronRight className="w-3 h-3" />
                </button>

                {/* Tối ưu CV với AI */}
                <button
                  onClick={() => onNavigate('cv-builder')}
                  className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs group"
                  title="Tải CV lên để AI gợi ý tối ưu theo công việc mục tiêu này"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Tối ưu CV với AI</span>
                </button>

                {/* Chi tiết JD - HƯỚNG TỚI CHI TIẾT CỦA JD ĐÃ LỰA CHỌN (KHÔNG CHUYỂN SANG WEB KHÁC) */}
                <button
                  onClick={() => onSelectJobDetail(currentTargetJob)}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs group"
                  title="Xem chi tiết toàn bộ mô tả công việc (JD) của vị trí mục tiêu này"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
                  <span>Chi tiết JD</span>
                </button>

                {/* THANH GỠ ĐỂ NGƯỜI DÙNG CÓ THỂ ĐỔI CÔNG VIỆC MỤC TIÊU BẰNG CÁCH LỰA CHỌN Ở CÁC JD KHÁC */}
                <button
                  onClick={handleRemoveTargetJob}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-red-50 text-slate-600 hover:text-[#B90013] border border-slate-200 hover:border-red-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Gỡ bỏ mục tiêu này để đổi sang chọn công việc mục tiêu khác"
                >
                  <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-[#B90013]" />
                  <span>Gỡ bỏ mục tiêu</span>
                </button>
              </div>
            </div>

            {/* Target Job Short Information Box */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Mức lương / Phụ cấp
                </span>
                <p className="font-bold text-emerald-700 text-sm">
                  {currentTargetJob.salaryDisplay || 'Hỗ trợ 3.500.000 – 6.000.000 VNĐ/tháng'}
                </p>
                <p className="text-[11px] text-slate-500">Phụ cấp thực tập sinh chuẩn</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Địa điểm & Cấp bậc
                </span>
                <p className="font-bold text-slate-800 text-sm flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{currentTargetJob.location || 'Hà Nội'}</span>
                </p>
                <p className="text-[11px] text-slate-500">
                  {currentTargetJob.level || currentTargetJob.jobType || 'Thực tập sinh (Internship)'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-1 md:col-span-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Kỹ năng trọng tâm yêu cầu
                </span>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {(currentTargetJob.requiredSkills || currentTargetJob.skillTags || []).slice(0, 4).map((skill, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-red-50 text-[#B90013] border border-red-100 rounded-md text-[11px] font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                {currentTargetJob.description && (
                  <p className="text-[11px] text-slate-600 line-clamp-1 mt-1">
                    {currentTargetJob.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* GIAO DIỆN KHI GỠ MỤC TIÊU: "Thêm công việc mục tiêu của bạn, tham khảo dựa trên kết quả gợi ý từ career check" */
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-50 via-red-50/40 to-amber-50/40 border-2 border-dashed border-red-200 shadow-2xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-red-100/80 pb-3.5">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-100 text-[#B90013] flex items-center justify-center font-black shrink-0 text-xl border border-red-200">
                  🎯
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-[#B90013] text-[10px] font-black uppercase tracking-wider border border-red-200">
                      Chưa chọn mục tiêu
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      • Chỉ được chọn 1 mục tiêu duy nhất
                    </span>
                  </div>
                  <h3 className="font-extrabold text-[#131B2E] text-lg sm:text-xl">
                    Thêm công việc mục tiêu của bạn
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Tham khảo dựa trên kết quả gợi ý từ <strong>Career Check</strong> để hệ thống xây dựng lộ trình học tập và tối ưu CV AI cho bạn.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto">
                <button
                  onClick={() => onNavigate('assessment-intro')}
                  className="px-3.5 py-2 rounded-xl bg-[#B90013] hover:bg-[#A30010] text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Xem gợi ý Career Check</span>
                </button>
              </div>
            </div>

            {/* Gợi ý nhanh từ Career Check để chọn làm mục tiêu */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Các vị trí JD đề xuất từ kết quả Career Check (chọn 1 mục tiêu):</span>
                </span>
                <span className="text-[11px] text-slate-400">Bấm nút để đặt làm mục tiêu</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {careerCheckSuggestions.map((recJob) => (
                  <div
                    key={recJob.id}
                    className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-red-300 hover:bg-red-50/20 transition-all flex flex-col justify-between gap-2 text-xs shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-extrabold text-[#B90013] bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                          Khớp {recJob.matchPercentage || 92}%
                        </span>
                        <span className="text-[10px] text-slate-500 truncate max-w-[110px]">
                          {recJob.companyName || recJob.company}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-800 line-clamp-1">{recJob.title}</h4>
                      <p className="text-[11px] font-semibold text-emerald-700 mt-0.5">{recJob.salaryDisplay}</p>
                    </div>
                    <button
                      onClick={(e) => handleSetTargetJob(e, recJob)}
                      className="w-full py-1.5 rounded-xl bg-slate-900 hover:bg-[#B90013] text-white text-[11px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Target className="w-3 h-3" />
                      <span>Đặt làm mục tiêu</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CÔNG CỤ TÌM KIẾM (HIỂN THỊ TRƯỚC PHẦN GỢI Ý CÁC CÔNG VIỆC PHÙ HỢP VỚI BẠN) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Main Keyword Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (e.target.value.trim().length >= 3) {
                  addSearchToHistory(e.target.value);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addSearchToHistory(searchTerm);
                }
              }}
              placeholder="Tìm theo chức danh, kỹ năng (vd: Marketing, Shopee, Excel, Data...)"
              className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#B90013] focus:bg-white transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filter: Saved Jobs with Heart ❤️ */}
          <button
            onClick={() => setSavedOnly(!savedOnly)}
            className={`px-4 py-3 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              savedOnly
                ? 'bg-red-50 border-red-200 text-[#B90013] shadow-xs'
                : 'bg-white border-slate-200 text-slate-700 hover:border-red-200 hover:text-[#B90013]'
            }`}
            title="Xem danh sách việc làm đã lưu yêu thích"
          >
            <Heart className={`w-4 h-4 ${savedOnly ? 'fill-[#B90013] text-[#B90013]' : 'text-slate-400'}`} />
            <span>Việc làm đã lưu ({savedJobsCount})</span>
          </button>

          {/* Advanced Filter Toggle Button */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-4 py-3 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              showAdvancedFilters || categoryFilter !== 'Tất cả' || employmentTypeFilter !== 'Tất cả' || locationFilter !== 'Tất cả'
                ? 'bg-red-50 border-red-200 text-[#B90013]'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Bộ lọc</span>
          </button>
        </div>

        {/* LỊCH SỬ TÌM KIẾM GẦN ĐÂY */}
        {searchHistory.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
              <History className="w-3.5 h-3.5" />
              <span>Tìm kiếm gần đây:</span>
            </span>
            {searchHistory.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSearchChange(item);
                  addSearchToHistory(item);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  searchTerm.toLowerCase() === item.toLowerCase()
                    ? 'bg-[#B90013] text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {item}
              </button>
            ))}
            <button
              onClick={handleClearSearchHistory}
              className="text-[11px] text-slate-400 hover:text-slate-600 underline ml-1 cursor-pointer"
            >
              Xóa lịch sử
            </button>
          </div>
        )}

        {/* Advanced Filters Drawer */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
            {/* Category / Field */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Ngành nghề / Lĩnh vực:</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#B90013]"
              >
                <option value="Tất cả">Tất cả ngành nghề</option>
                <option value="Marketing">Marketing & Truyền thông số</option>
                <option value="E-commerce">Thương mại điện tử</option>
                <option value="Data">Dữ liệu & Phân tích kinh doanh</option>
                <option value="Business">Phát triển kinh doanh (BD/Sales)</option>
              </select>
            </div>

            {/* Employment Type */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Loại hình làm việc:</label>
              <select
                value={employmentTypeFilter}
                onChange={(e) => setEmploymentTypeFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#B90013]"
              >
                <option value="Tất cả">Tất cả hình thức</option>
                <option value="Internship">Thực tập sinh (Internship)</option>
                <option value="Trainee">Trainee / Tập sự</option>
                <option value="Full-time">Toàn thời gian (Full-time)</option>
              </select>
            </div>

            {/* Location */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Địa điểm:</label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#B90013]"
              >
                <option value="Tất cả">Tất cả địa điểm</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            {/* Toggles */}
            <div className="space-y-2 pt-1 sm:pt-0">
              <label className="font-bold text-slate-700 block">Tùy chọn hiển thị:</label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="rounded text-[#B90013] focus:ring-[#B90013] w-4 h-4"
                  />
                  <span>Chỉ hiện cơ hội đã xác minh</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-500 text-[11px]">
                  <input
                    type="checkbox"
                    checked={includeDemoJobs}
                    onChange={(e) => setIncludeDemoJobs(e.target.checked)}
                    className="rounded text-slate-400 focus:ring-slate-400 w-3.5 h-3.5"
                  />
                  <span>Bao gồm dữ liệu DEMO thử nghiệm</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Active Filter Chips */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400">Đang lọc theo:</span>
            {activeChips.map((chip, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold"
              >
                <span>{chip.label}</span>
                <button
                  onClick={chip.onRemove}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            <button
              onClick={resetAllFilters}
              className="text-xs font-bold text-[#B90013] hover:underline ml-2 cursor-pointer"
            >
              Đặt lại tất cả
            </button>
          </div>
        )}
      </div>

      {/* KHU VỰC GỢI Ý CÁC CÔNG VIỆC PHÙ HỢP (HIỂN THỊ SAU CÔNG CỤ TÌM KIẾM) */}
      <div className="space-y-4 pt-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h2 className="text-lg font-black text-[#131B2E] tracking-tight">
                Gợi ý các công việc phù hợp với bạn
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">
                AI Match cá nhân hóa
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Hệ thống tự động xếp hạng dựa trên lịch sử tìm kiếm gần đây, ngành học <strong>{userProfile?.major || 'PTIT'}</strong> và mục tiêu định hướng.
            </p>
          </div>
        </div>

        {/* Top Smart Suggestions Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {smartJobSuggestions.map((job) => {
            const companyName = job.companyName || job.company || 'Doanh nghiệp đối tác';
            const isTarget = currentTargetJob?.id === job.id;

            return (
              <div
                key={job.id}
                onClick={() => onSelectJobDetail(job)}
                className="bg-white rounded-3xl p-5 border border-slate-200/90 hover:border-[#B90013]/70 hover:shadow-md transition-all cursor-pointer space-y-3.5 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {job.companyLogo ? (
                        <img
                          src={job.companyLogo}
                          alt={companyName}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-2xl bg-red-50 text-[#B90013] flex items-center justify-center font-bold text-base shrink-0 border border-red-100">
                          <Building2 className="w-5 h-5" />
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-black flex items-center gap-1">
                            ⭐ Khớp {job.calculatedScore}%
                          </span>

                          {job.matchedKeyword && (
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold flex items-center gap-1">
                              <History className="w-2.5 h-2.5" />
                              <span>Khớp: "{job.matchedKeyword}"</span>
                            </span>
                          )}

                          {job.verified && (
                            <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                              Xác minh
                            </span>
                          )}
                        </div>

                        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-[#B90013] transition-colors line-clamp-1">
                          {job.title}
                        </h3>

                        <p className="text-xs font-semibold text-slate-600 truncate">{companyName}</p>
                      </div>
                    </div>

                    {/* Heart Button (Yêu thích) */}
                    <button
                      onClick={(e) => handleToggleSave(e, job)}
                      className={`p-2.5 rounded-xl border transition-all shrink-0 cursor-pointer ${
                        job.isSaved
                          ? 'bg-red-50 border-red-200 text-[#B90013] shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-[#B90013] hover:border-red-200 hover:bg-red-50/50'
                      }`}
                      title={job.isSaved ? 'Bỏ lưu khỏi danh sách yêu thích' : 'Lưu việc làm vào mục yêu thích ❤️'}
                    >
                      <Heart
                        className={`w-4 h-4 transition-transform ${
                          job.isSaved ? 'fill-[#B90013] text-[#B90013] scale-110' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {/* Metadata line */}
                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-600 pt-1 border-t border-slate-100">
                    <span className="font-bold text-emerald-700">{job.salaryDisplay}</span>
                    <span className="text-slate-300">•</span>
                    <span>{job.location}</span>
                    <span className="text-slate-300">•</span>
                    <span>{job.employmentType || job.jobType}</span>
                  </div>

                  {/* Reason badge */}
                  {job.calculatedReason && (
                    <div className="p-2.5 rounded-xl bg-purple-50/80 border border-purple-100 text-[11px] text-purple-900 leading-relaxed">
                      <strong className="font-bold">Lý do gợi ý: </strong>
                      {job.calculatedReason}
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  {/* Set as Target Job Button (Only 1 Target Job) */}
                  {isTarget ? (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>✓ Đang là mục tiêu duy nhất</span>
                    </span>
                  ) : (
                    <button
                      onClick={(e) => handleSetTargetJob(e, job)}
                      className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-700 hover:text-[#B90013] border border-slate-200 hover:border-red-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Đặt làm công việc mục tiêu duy nhất để xây dựng lộ trình Career Map"
                    >
                      <Target className="w-3.5 h-3.5 text-[#B90013]" />
                      <span>{currentTargetJob ? 'Đổi sang mục tiêu này' : 'Đặt làm mục tiêu'}</span>
                    </button>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectJobDetail(job);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Chi tiết
                    </button>
                    <button
                      onClick={(e) => handleQuickApply(e, job)}
                      className="px-3 py-1.5 rounded-xl bg-[#B90013] hover:bg-[#A30010] text-white text-xs font-bold transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>Ứng tuyển</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
        <div>
          Hiển thị <strong className="text-slate-900 font-bold">{filteredJobs.length}</strong> cơ hội việc làm & thực tập đang tuyển dụng
        </div>
      </div>

      {/* Jobs Listing Grid */}
      {isLoading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 shadow-2xs space-y-3">
          <RefreshCw className="w-8 h-8 text-[#B90013] animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600">Đang tải dữ liệu cơ hội việc làm...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">Không tìm thấy cơ hội việc làm phù hợp</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Hãy thử tìm kiếm với từ khóa khác hoặc bỏ bớt các bộ lọc đang chọn.
          </p>
          <button
            onClick={resetAllFilters}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Xóa bộ lọc tìm kiếm
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.map((job) => {
            const isHighMatch = (job.recommendationScore ?? job.matchPercentage) >= 85;
            const companyName = job.companyName || job.company || 'Doanh nghiệp đối tác';
            const deadline = job.expiresAt || job.deadline;
            const isTarget = currentTargetJob?.id === job.id;

            return (
              <div
                key={job.id}
                onClick={() => onSelectJobDetail(job)}
                className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all cursor-pointer space-y-4 flex flex-col justify-between group ${
                  isTarget
                    ? 'border-red-300 ring-2 ring-red-100 shadow-sm'
                    : 'border-slate-200/90 hover:border-[#B90013]/70 hover:shadow-md'
                }`}
              >
                {/* Top Row: Badges, Logo, Title */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {job.companyLogo ? (
                        <img
                          src={job.companyLogo}
                          alt={companyName}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#B90013] flex items-center justify-center font-bold text-lg shrink-0 border border-red-100">
                          <Building2 className="w-6 h-6" />
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {isTarget && (
                            <span className="px-2 py-0.5 rounded-full bg-[#B90013] text-white text-[10px] font-black flex items-center gap-1">
                              <span>🎯 Mục tiêu duy nhất</span>
                            </span>
                          )}

                          {isHighMatch && !isTarget && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-black flex items-center gap-1">
                              <span>⭐ Đề xuất ({job.recommendationScore ?? job.matchPercentage}%)</span>
                            </span>
                          )}

                          {job.verified ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>Xác minh</span>
                            </span>
                          ) : null}

                          {job.isDemo && (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">
                              DEMO
                            </span>
                          )}
                        </div>

                        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-[#B90013] transition-colors line-clamp-1">
                          {job.title}
                        </h3>

                        <p className="text-xs font-semibold text-slate-600 truncate">{companyName}</p>
                      </div>
                    </div>

                    {/* Heart Button (Yêu thích) */}
                    <button
                      onClick={(e) => handleToggleSave(e, job)}
                      className={`p-2.5 rounded-xl border transition-all shrink-0 cursor-pointer ${
                        job.isSaved
                          ? 'bg-red-50 border-red-200 text-[#B90013] shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-[#B90013] hover:border-red-200 hover:bg-red-50/50'
                      }`}
                      title={job.isSaved ? 'Bỏ lưu khỏi danh sách yêu thích' : 'Lưu việc làm vào mục yêu thích ❤️'}
                    >
                      <Heart
                        className={`w-4 h-4 transition-transform ${
                          job.isSaved ? 'fill-[#B90013] text-[#B90013] scale-110' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {/* Meta Specs: Salary, Location, Type */}
                  <div className="flex flex-wrap items-center gap-3 text-xs pt-1 border-t border-slate-100 text-slate-600">
                    <span className="font-bold text-emerald-700">{job.salaryDisplay}</span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{job.location}</span>
                    </span>
                    <span className="text-slate-300">•</span>
                    <span>{job.employmentType || job.jobType}</span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>Hạn: {deadline}</span>
                    </span>
                  </div>

                  {/* Skill tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(job.skillTags || job.requiredSkills || []).slice(0, 4).map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Recommendation Reason if high match */}
                  {job.recommendationReason && (
                    <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-100/80 text-[11px] text-purple-900 leading-relaxed line-clamp-2">
                      <strong className="font-bold">Lý do đề xuất: </strong>
                      {job.recommendationReason}
                    </div>
                  )}
                </div>

                {/* Card Footer: Target Job Selector & Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {/* Set as Target Job Button (Single target enforcement) */}
                  {isTarget ? (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>✓ Đang là mục tiêu</span>
                    </span>
                  ) : (
                    <button
                      onClick={(e) => handleSetTargetJob(e, job)}
                      className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-700 hover:text-[#B90013] border border-slate-200 hover:border-red-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Đặt làm công việc mục tiêu duy nhất để xây dựng lộ trình Career Map"
                    >
                      <Target className="w-3.5 h-3.5 text-[#B90013]" />
                      <span>{currentTargetJob ? 'Đổi sang mục tiêu này' : 'Đặt làm mục tiêu'}</span>
                    </button>
                  )}

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectJobDetail(job);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Xem chi tiết
                    </button>

                    <button
                      onClick={(e) => handleQuickApply(e, job)}
                      className="px-3.5 py-2 rounded-xl bg-[#B90013] hover:bg-[#A30010] text-white text-xs font-bold transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>Ứng tuyển</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
