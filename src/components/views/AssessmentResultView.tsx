import React, { useState, useEffect } from 'react';
import { ScreenView, UserProfileState, TargetJob } from '../../types';
import { TARGET_JOBS } from '../../data/mockData';
import {
  TENDENCY_DEFINITIONS,
  generateCareerRecommendations,
  generateSkillGapFromCareerCheck,
  generateTasksFromCareerCheck,
} from '../../services/careerCheckService';
import { trackEvent } from '../../utils/analytics';
import {
  Sparkles,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Layers,
  Compass,
  TrendingUp,
  Target,
  BarChart3,
  BookOpen,
  Calendar,
  FileText,
  ListTodo,
  RotateCcw,
  Check,
  ChevronRight,
  ExternalLink,
  Building2,
  MapPin,
  DollarSign,
  GraduationCap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AssessmentResultViewProps {
  onNavigate: (view: ScreenView) => void;
  onSelectCareer: (careerId: string) => void;
  userProfile?: UserProfileState;
  onUpdateUserProfile?: (updated: Partial<UserProfileState>) => void;
  onSelectJobDetail?: (job: TargetJob) => void;
  onSelectJobForCv?: (job: TargetJob) => void;
}

export const AssessmentResultView: React.FC<AssessmentResultViewProps> = ({
  onNavigate,
  onSelectCareer,
  userProfile,
  onUpdateUserProfile,
  onSelectJobDetail,
  onSelectJobForCv,
}) => {
  const [saved, setSaved] = useState(false);
  const [tasksAdded, setTasksAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'skillgap' | 'jobs' | 'events' | 'tasks'>('overview');
  const [targetJobId, setTargetJobId] = useState<string>(
    userProfile?.targetJobId || 'job-2'
  );
  const [targetJobToast, setTargetJobToast] = useState<string | null>(null);

  // Load existing or default tendencies
  const defaultScores = userProfile?.careerInterestScores || { CR: 4, AN: 3, OP: 2, CO: 1 };
  const topTendencies = userProfile?.topCareerTendencies || [
    {
      code: 'CR' as const,
      name: 'Sáng tạo & Đổi mới',
      percentage: 40,
      score: 4,
      description: TENDENCY_DEFINITIONS.CR.description,
      whyFit: TENDENCY_DEFINITIONS.CR.whyFit,
    },
    {
      code: 'AN' as const,
      name: 'Phân tích & Tối ưu',
      percentage: 30,
      score: 3,
      description: TENDENCY_DEFINITIONS.AN.description,
      whyFit: TENDENCY_DEFINITIONS.AN.whyFit,
    },
    {
      code: 'OP' as const,
      name: 'Lập kế hoạch & Vận hành',
      percentage: 20,
      score: 2,
      description: TENDENCY_DEFINITIONS.OP.description,
      whyFit: TENDENCY_DEFINITIONS.OP.whyFit,
    },
  ];

  const recommendations = generateCareerRecommendations(topTendencies, userProfile);
  const primaryCareer = recommendations.primary;
  const secondaryCareers = recommendations.secondaries;

  const skillGap =
    userProfile?.skillGap ||
    generateSkillGapFromCareerCheck(primaryCareer.title, topTendencies, userProfile);

  const suggestedTasks = generateTasksFromCareerCheck(primaryCareer.title, topTendencies, userProfile);

  // Calculate matching job roles with exact percentage
  const matchingJobPositions = [
    {
      id: 'pos-1',
      title: 'Digital Marketing Specialist / Performance Marketer',
      vnTitle: 'Chuyên viên Tiếp thị Kỹ thuật số & Tối ưu chuyển đổi',
      matchScore: 94,
      category: 'Marketing',
      salary: '12 – 16 triệu/tháng (Fresher) • 5 – 7 triệu/tháng (Intern)',
      demand: 'Nhu cầu tuyển dụng rất cao',
      fitReason: 'Phù hợp với tư duy sáng tạo kết hợp phân tích số liệu quảng cáo (CR 40% & AN 30%).',
      coreSkills: ['Meta Ads', 'Google Ads', 'SEO On-page', 'Phân tích dữ liệu phễu GA4'],
      linkedJobId: 'job-2',
    },
    {
      id: 'pos-2',
      title: 'E-Commerce Operations & Growth Executive',
      vnTitle: 'Chuyên viên Vận hành Sàn Thương mại điện tử',
      matchScore: 89,
      category: 'Thương mại điện tử',
      salary: '10 – 14 triệu/tháng (Fresher) • 4.5 – 6 triệu/tháng (Intern)',
      demand: 'Tăng trưởng nhanh',
      fitReason: 'Phù hợp với khả năng lên kế hoạch chiến dịch và quản trị quy trình số (OP 20% & CR 40%).',
      coreSkills: ['Vận hành Shopee/TikTok Shop', 'Flash Sale Setup', 'Quản lý tồn kho', 'Livestream Ops'],
      linkedJobId: 'job-5',
    },
    {
      id: 'pos-3',
      title: 'Content Creator & Social Media Strategist',
      vnTitle: 'Chuyên viên Sáng tạo Nội dung & Truyền thông số',
      matchScore: 86,
      category: 'Marketing / Truyền thông',
      salary: '9 – 13 triệu/tháng (Fresher) • 4 – 5.5 triệu/tháng (Intern)',
      demand: 'Tuyển dụng liên tục',
      fitReason: 'Phù hợp với thế mạnh sáng tạo kịch bản, ngôn từ và storytelling trực quan.',
      coreSkills: ['Copywriting', 'Kịch bản Video ngắn TikTok/Reels', 'Canva/CapCut', 'Content Strategy'],
      linkedJobId: 'job-4',
    },
    {
      id: 'pos-4',
      title: 'Business & Marketing Data Analyst (Junior)',
      vnTitle: 'Chuyên viên Phân tích Dữ liệu Kinh doanh',
      matchScore: 82,
      category: 'Phân tích dữ liệu',
      salary: '12 – 18 triệu/tháng (Fresher) • 6 – 8 triệu/tháng (Intern)',
      demand: 'Thu nhập cao',
      fitReason: 'Phù hợp với sinh viên ngành kinh tế có tư duy số liệu tốt và khả năng báo cáo trực quan.',
      coreSkills: ['Excel / Spreadsheet nâng cao', 'Google Data Studio', 'SQL cơ bản', 'A/B Testing'],
      linkedJobId: 'job-3',
    },
    {
      id: 'pos-5',
      title: 'Business Development & Partnership Executive',
      vnTitle: 'Chuyên viên Phát triển Kinh doanh & Đối tác (B2B)',
      matchScore: 78,
      category: 'Kinh doanh / Đối tác',
      salary: '10 – 15 triệu/tháng + Thưởng KPI',
      demand: 'Ổn định & tiềm năng',
      fitReason: 'Phù hợp với khả năng giao tiếp, đàm phán hợp đồng và phát triển mạng lưới đối tác.',
      coreSkills: ['Đàm phán đối tác', 'Bán hàng B2B', 'Thuyết trình giải pháp', 'CRM Management'],
      linkedJobId: 'job-5',
    },
  ];

  // Track initial views
  useEffect(() => {
    trackEvent('career_direction_view', {
      career_direction: primaryCareer.title,
      top_tendency: topTendencies[0]?.code,
      major: userProfile?.major,
    });
    trackEvent('career_recommendation_view', {
      primary_role: primaryCareer.title,
    });
    trackEvent('skill_gap_view', {
      target_role: skillGap.targetRole,
      match_score: skillGap.matchScore,
    });
  }, [primaryCareer.title]);

  const handleSaveResult = () => {
    setSaved(true);
    if (onUpdateUserProfile) {
      onUpdateUserProfile({
        careerCheckCompleted: true,
        careerDirection: primaryCareer.title,
        careerInterestScores: defaultScores,
        topCareerTendencies: topTendencies,
        skillGap,
      });
    }
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // silent
    }
  };

  const handleSetTargetJob = (job: TargetJob) => {
    if (targetJobId === job.id) {
      setTargetJobId(null);
      try {
        localStorage.setItem('ptit_target_job_cleared', 'true');
        localStorage.removeItem('ptit_selected_target_job_id');
      } catch {}
      if (onUpdateUserProfile) {
        onUpdateUserProfile({
          targetJobTitle: '',
          targetJobCompany: '',
          targetJobId: '',
          targetJobSalary: '',
          targetJobLocation: '',
          targetJobRequiredSkills: [],
          targetJobDescription: '',
          careerDirection: '',
          skillGap: null,
        });
      }
      return;
    }

    setTargetJobId(job.id);
    try {
      localStorage.removeItem('ptit_target_job_cleared');
      localStorage.setItem('ptit_selected_target_job_id', job.id);
    } catch {}

    if (onUpdateUserProfile) {
      onUpdateUserProfile({
        targetJobTitle: job.title,
        targetJobCompany: job.company,
        targetJobId: job.id,
        targetJobSalary: job.salaryDisplay,
        targetJobLocation: job.location,
        targetJobRequiredSkills: job.requiredSkills,
        targetJobDescription: job.description,
        careerDirection: job.title,
      });
    }
    setTargetJobToast(job.title);
    setTimeout(() => {
      setTargetJobToast(null);
    }, 5000);

    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // silent
    }
  };

  const handleViewRoadmap = () => {
    trackEvent('career_map_view', { careerDirection: primaryCareer.title });
    trackEvent('career_recommendation_click', { action: 'view_roadmap', careerDirection: primaryCareer.title });
    onSelectCareer('cm-1');
    onNavigate('roadmap');
  };

  const handleViewJobs = () => {
    trackEvent('job_recommendation_view', { careerDirection: primaryCareer.title });
    trackEvent('career_recommendation_click', { action: 'view_jobs', careerDirection: primaryCareer.title });
    onNavigate('jobs');
  };

  const handleAddTasksToMyTasks = () => {
    try {
      const STORAGE_KEY = 'ptit_career_hub_tasks_v2';
      const existing = localStorage.getItem(STORAGE_KEY);
      let list = existing ? JSON.parse(existing) : [];
      // Append suggested tasks
      const newItems = suggestedTasks.map((t) => ({
        ...t,
        id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      }));
      list = [...newItems, ...list];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      setTasksAdded(true);
      try {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.6 },
        });
      } catch {
        // silent
      }
      trackEvent('todo_create', { count: suggestedTasks.length, source: 'career_check_result' });
    } catch {
      setTasksAdded(true);
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12 space-y-10 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-emerald-50 rounded-full border border-emerald-200/80 text-emerald-800 text-xs font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Hoàn thành Career Check • 10 câu hỏi tình huống</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#131B2E] tracking-tight">
          Kết quả Career Check
        </h1>
        <p className="text-lg sm:text-xl font-bold text-[#B90013]">
          Xu hướng nghề nghiệp của bạn (Career Interest Profile)
        </p>
        <p className="text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Được phân tích dựa trên sự tương thích giữa xu hướng hoạt động yêu thích và bối cảnh chuyên ngành{' '}
          <strong className="text-slate-800">{userProfile?.major || 'Kinh tế & Marketing'}</strong>.
        </p>
      </div>

      {/* Top 3 Tendencies Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-extrabold text-[#131B2E] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#B90013]" />
            <span>Top 3 Xu hướng nghề nghiệp nổi trội</span>
          </h2>
          <span className="text-xs text-slate-500">Thứ tự ưu tiên định lượng</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {topTendencies.slice(0, 3).map((item, idx) => {
            const meta = TENDENCY_DEFINITIONS[item.code as keyof typeof TENDENCY_DEFINITIONS] || TENDENCY_DEFINITIONS.CR;
            const rankLabel = idx === 0 ? 'Xu hướng #1' : idx === 1 ? 'Xu hướng #2' : 'Xu hướng #3';

            return (
              <div
                key={item.code}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4 relative flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-black">
                      {rankLabel}
                    </span>
                    <span className="text-2xl font-black text-[#B90013]">
                      {item.percentage}%
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-black ${meta.badgeColor}`}>
                        {item.code}
                      </span>
                      <h3 className="font-extrabold text-base text-[#131B2E]">
                        {meta.name}
                      </h3>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-400">
                      {meta.englishName}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.description || meta.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-1.5 bg-slate-50/70 p-3 rounded-2xl">
                  <p className="text-[11px] font-bold text-slate-700">💡 Vì sao bạn phù hợp:</p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.whyFit || meta.whyFit}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Percentage Distribution: All 4 Categories (Totals 100%) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-extrabold text-[#131B2E]">
              Phân bổ tỷ lệ 4 xu hướng nghề nghiệp (Tổng 100%)
            </h3>
            <p className="text-xs text-slate-500">
              Đo lường độ thiên hướng giữa 10 câu hỏi tình huống đã chọn.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-slate-100 rounded-full text-slate-700">
            Tổng 10 câu = 100%
          </span>
        </div>

        {/* Multi-segment stacked progress bar */}
        <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-100 p-0.5 shadow-inner">
          <div
            className="bg-purple-600 h-full transition-all rounded-l-full"
            style={{ width: `${defaultScores.CR * 10}%` }}
            title={`CR: ${defaultScores.CR * 10}%`}
          />
          <div
            className="bg-sky-600 h-full transition-all"
            style={{ width: `${defaultScores.AN * 10}%` }}
            title={`AN: ${defaultScores.AN * 10}%`}
          />
          <div
            className="bg-emerald-600 h-full transition-all"
            style={{ width: `${defaultScores.OP * 10}%` }}
            title={`OP: ${defaultScores.OP * 10}%`}
          />
          <div
            className="bg-red-600 h-full transition-all rounded-r-full"
            style={{ width: `${defaultScores.CO * 10}%` }}
            title={`CO: ${defaultScores.CO * 10}%`}
          />
        </div>

        {/* 4 Category Detailed Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-purple-900 block">CR • Sáng tạo & Đổi mới</span>
              <span className="text-[11px] text-slate-500">{defaultScores.CR}/10 câu</span>
            </div>
            <span className="text-xl font-black text-purple-700">{defaultScores.CR * 10}%</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-sky-900 block">AN • Phân tích & Tối ưu</span>
              <span className="text-[11px] text-slate-500">{defaultScores.AN}/10 câu</span>
            </div>
            <span className="text-xl font-black text-sky-700">{defaultScores.AN * 10}%</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-900 block">OP • Kế hoạch & Vận hành</span>
              <span className="text-[11px] text-slate-500">{defaultScores.OP}/10 câu</span>
            </div>
            <span className="text-xl font-black text-emerald-700">{defaultScores.OP * 10}%</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-red-50/50 border border-red-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-red-900 block">CO • Giao tiếp & Kinh doanh</span>
              <span className="text-[11px] text-slate-500">{defaultScores.CO}/10 câu</span>
            </div>
            <span className="text-xl font-black text-red-700">{defaultScores.CO * 10}%</span>
          </div>
        </div>
      </div>

      {/* TỶ LỆ PHÙ HỢP VỚI CÁC VỊ TRÍ CÔNG VIỆC (JOB POSITION MATCH PERCENTAGES) */}
      <div id="matching-positions-section" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-[0_4px_25px_rgba(15,23,42,0.05)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-red-50 text-[#B90013] text-xs font-bold border border-red-100 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                Kết quả định hướng nghề nghiệp
              </span>
              <span className="text-xs font-medium text-slate-500">Khối ngành Kinh tế & Marketing PTIT</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#131B2E] mt-2">
              Tỷ lệ % phù hợp với các vị trí công việc
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Phân tích đối chiếu giữa xu hướng tính cách của bạn (CR, AN, OP, CO) với yêu cầu năng lực thực tế trên thị trường tuyển dụng.
            </p>
          </div>
        </div>

        {/* Position Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matchingJobPositions.map((pos, idx) => {
            const isTopMatch = idx === 0;
            return (
              <div
                key={pos.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                  isTopMatch
                    ? 'border-2 border-[#B90013]/40 bg-gradient-to-b from-red-50/40 via-white to-white shadow-sm'
                    : 'border-slate-200/90 bg-white hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Header: Badge + % */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {pos.category}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-2xl font-black ${isTopMatch ? 'text-[#B90013]' : 'text-slate-800'}`}>
                        {pos.matchScore}%
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">phù hợp</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pos.matchScore >= 90
                          ? 'bg-[#B90013]'
                          : pos.matchScore >= 85
                          ? 'bg-[#712AE2]'
                          : 'bg-emerald-600'
                      }`}
                      style={{ width: `${pos.matchScore}%` }}
                    />
                  </div>

                  <div>
                    <h3 className="font-extrabold text-[#131B2E] text-base leading-snug">
                      {pos.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{pos.vnTitle}</p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                    💡 <em>{pos.fitReason}</em>
                  </p>

                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Kỹ năng trọng tâm:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {pos.coreSkills.map((sk) => (
                        <span
                          key={sk}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px] font-medium truncate max-w-[170px]">
                    {pos.salary}
                  </span>
                  <a
                    href="#suggested-jds-section"
                    className="text-[#B90013] font-bold hover:underline flex items-center gap-1 shrink-0"
                  >
                    <span>Xem JD</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* GỢI Ý CÁC JD TUYỂN DỤNG THỰC TẾ & THANH TÁC VỤ (ACTION BAR CHO MỤC TIÊU ĐỊNH HƯỚNG) */}
      <div id="suggested-jds-section" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-[0_4px_25px_rgba(15,23,42,0.05)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 inline-flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" />
              Gợi ý Job Descriptions (JD) thực tế
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#131B2E] mt-2">
              Danh sách JD mục tiêu đề xuất
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Chọn 1 JD phù hợp nhất để đưa vào <strong>Công việc mục tiêu (Mục tiêu định hướng)</strong>. Hệ thống sẽ xây dựng Career Map 1 - 2 năm bám sát JD này.
            </p>
          </div>

          <button
            onClick={handleViewJobs}
            className="text-xs font-bold text-[#B90013] hover:underline flex items-center gap-1 shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <span>Xem tất cả tin tuyển dụng</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Selected Target Job Toast Notification */}
        {targetJobToast && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <strong>Đã thiết lập công việc mục tiêu thành công!</strong>
                <p className="text-emerald-800 mt-0.5">
                  Vị trí <strong>"{targetJobToast}"</strong> đã được lưu làm mục tiêu định hướng. Bạn có thể mở Career Map ngay để xem lộ trình 1 - 2 năm tương ứng.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('roadmap')}
              className="px-4 py-2 bg-[#B90013] hover:bg-[#A30010] text-white font-bold rounded-xl shrink-0 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Xem Career Map ngay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Curated JD List */}
        <div className="space-y-4">
          {TARGET_JOBS.slice(0, 4).map((job) => {
            const isSelected = targetJobId === job.id;

            return (
              <div
                key={job.id}
                className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                  isSelected
                    ? 'border-2 border-[#B90013] bg-gradient-to-r from-red-50/30 via-white to-white shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Job Details */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-[#B90013] text-[11px] font-bold border border-red-100">
                        {job.matchPercentage}% Độ tương thích
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-semibold">
                        {job.level}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-semibold">
                        {job.workMode}
                      </span>
                      {isSelected && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-700" />
                          Mục tiêu định hướng hiện tại
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-[#131B2E]">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1">
                        <span className="font-semibold text-slate-800 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {job.company}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {job.location}
                        </span>
                        <span>•</span>
                        <span className="font-bold text-emerald-700 flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5" />
                          {job.salaryDisplay}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>

                    {/* Required Skills */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                        Yêu cầu:
                      </span>
                      {job.requiredSkills.map((sk) => (
                        <span
                          key={sk}
                          className="px-2.5 py-0.5 rounded-lg text-xs bg-slate-100 text-slate-700 font-medium"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* THANH TÁC VỤ TRONG PHẦN JD (ACTION BAR) */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 p-4 rounded-b-2xl">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Nút Đưa vào công việc (Mục tiêu định hướng) */}
                    <button
                      onClick={() => handleSetTargetJob(job)}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                          : 'bg-[#B90013] hover:bg-[#A30010] text-white shadow-xs'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>✓ Đang là mục tiêu</span>
                        </>
                      ) : (
                        <>
                          <Target className="w-4 h-4" />
                          <span>Đưa vào mục tiêu</span>
                        </>
                      )}
                    </button>

                    {/* Nếu đã chọn: Nút chuyển thẳng tới Career Map */}
                    {isSelected && (
                      <button
                        onClick={() => {
                          onSelectCareer('cm-1');
                          onNavigate('roadmap');
                        }}
                        className="px-4 py-2.5 rounded-xl bg-white hover:bg-red-50 text-[#B90013] font-bold text-xs sm:text-sm border border-red-200 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Compass className="w-4 h-4" />
                        <span>Xem Career Map cho vị trí này</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-auto">
                    {/* Nút Xem chi tiết JD */}
                    <button
                      onClick={() => {
                        if (onSelectJobDetail) onSelectJobDetail(job);
                        onNavigate('job-detail');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Xem chi tiết JD</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {/* Nút Tạo CV cho JD này */}
                    <button
                      onClick={() => {
                        if (onSelectJobForCv) onSelectJobForCv(job);
                        onNavigate('cv-builder');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#712AE2] font-bold text-xs border border-purple-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Tạo CV cho JD này</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Career Recommendations & Connected Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Primary Recommendation & Detailed Tabs (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Primary Recommended Career Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-[0_6px_30px_rgba(15,23,42,0.06)] space-y-8">
            {/* Career Header & Match Score */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-[#B90013] text-xs font-black border border-red-100">
                  <Sparkles className="w-3.5 h-3.5" />
                  Định hướng nghề nghiệp đề xuất hàng đầu
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#131B2E]">
                  {primaryCareer.title}
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {primaryCareer.description}
                </p>
              </div>
              <div className="sm:text-right shrink-0">
                <span className="text-4xl sm:text-5xl font-black text-[#B90013] tracking-tight">
                  {skillGap.matchScore}%
                </span>
                <p className="text-[11px] text-slate-400 font-bold">Độ tương thích</p>
              </div>
            </div>

            {/* Why Fits Contextual Box */}
            <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4 text-[#B90013]" />
                <span>Vì sao hướng nghề nghiệp này phù hợp với bạn:</span>
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed">
                {primaryCareer.fitReason}
              </p>
            </div>

            {/* Starting Roles & Core Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Typical Starting Roles */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-[#B90013]" />
                  <span>Vị trí khởi đầu điển hình</span>
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700 font-medium">
                  {primaryCareer.startingRoles.map((role) => (
                    <li key={role} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B90013] shrink-0" />
                      <span>{role}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Core Skills */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#B90013]" />
                  <span>Kỹ năng cốt lõi yêu cầu</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {primaryCareer.coreSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Primary Action Buttons (Section 10) */}
            <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-3">
              <button
                onClick={handleViewRoadmap}
                className="bg-[#B90013] hover:bg-[#A30010] text-white font-bold px-6 py-3.5 rounded-xl shadow-md transition-all flex items-center gap-2 text-xs sm:text-sm cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                <span>Xem Lộ trình nghề nghiệp (Career Map)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleViewJobs}
                className="bg-white hover:bg-slate-50 text-slate-800 font-bold px-6 py-3.5 rounded-xl border border-slate-200 transition-all flex items-center gap-2 text-xs sm:text-sm cursor-pointer"
              >
                <Briefcase className="w-4 h-4 text-[#B90013]" />
                <span>Xem Việc làm phù hợp</span>
              </button>

              <button
                onClick={() => onNavigate('assessment-quiz')}
                className="text-slate-500 hover:text-slate-800 font-bold px-4 py-3 rounded-xl transition-all flex items-center gap-1.5 text-xs cursor-pointer ml-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Làm lại bài test</span>
              </button>
            </div>
          </div>

          {/* Connected Tabs View: Skill Gap, Jobs, Events, AI CV, To-do */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
            <div className="border-b border-slate-200">
              <div className="flex flex-wrap gap-2 -mb-px">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`pb-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'overview'
                      ? 'border-[#B90013] text-[#B90013]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Khoảng cách kỹ năng (Skill Gap)
                </button>
                <button
                  onClick={() => setActiveTab('jobs')}
                  className={`pb-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'jobs'
                      ? 'border-[#B90013] text-[#B90013]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Việc làm gợi ý
                </button>
                <button
                  onClick={() => setActiveTab('events')}
                  className={`pb-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'events'
                      ? 'border-[#B90013] text-[#B90013]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Sự kiện & Cuộc thi
                </button>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`pb-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'tasks'
                      ? 'border-[#B90013] text-[#B90013]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Kế hoạch hành động (To-do)
                </button>
              </div>
            </div>

            {/* TAB CONTENT: SKILL GAP */}
            {activeTab === 'overview' && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-[#131B2E]">
                      Ma trận kỹ năng thực tế cho {primaryCareer.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                      So sánh năng lực sinh viên với yêu cầu tuyển dụng năm 2025.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200">
                    {skillGap.matchScore}% tương thích
                  </span>
                </div>

                {/* Skill Matrix comparison bars */}
                <div className="space-y-3 pt-1">
                  {skillGap.skillMatrix.map((item) => {
                    const isMissing = item.status === 'missing';
                    const isInProgress = item.status === 'in_progress';
                    return (
                      <div
                        key={item.name}
                        className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 space-y-2.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">{item.name}</span>
                            {isMissing && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                                Cần bồi dưỡng
                              </span>
                            )}
                            {isInProgress && (
                              <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold">
                                Đang phát triển
                              </span>
                            )}
                            {item.status === 'proficient' && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                Đã sẵn sàng
                              </span>
                            )}
                          </div>
                          <span className="font-extrabold text-slate-600">
                            {item.currentLevel}% / {item.requiredLevel}% chuẩn
                          </span>
                        </div>

                        {/* Dual Progress Bar */}
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              item.status === 'proficient'
                                ? 'bg-emerald-500'
                                : isMissing
                                ? 'bg-amber-500'
                                : 'bg-blue-500'
                            }`}
                            style={{ width: `${item.currentLevel}%` }}
                          />
                        </div>

                        <p className="text-[11px] text-slate-600">
                          💡 <strong>Gợi ý học tập:</strong> {item.recommendation}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Recommendations */}
                <div className="p-4 rounded-2xl bg-red-50/50 border border-red-100 text-xs space-y-2">
                  <p className="font-bold text-[#B90013] flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    Đề xuất lộ trình hành động:
                  </p>
                  <ul className="list-disc list-inside space-y-1 pl-1 text-slate-600">
                    {skillGap.learningRecommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* TAB CONTENT: JOBS GỢI Ý */}
            {activeTab === 'jobs' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-[#131B2E]">
                    Cơ hội thực tập & việc làm ưu tiên cho bạn
                  </h3>
                  <button
                    onClick={handleViewJobs}
                    className="text-xs font-bold text-[#B90013] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Xem tất cả</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#B90013]/30 transition-all flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 rounded bg-red-50 text-[#B90013] text-[10px] font-bold">
                        Độ tương thích 95%
                      </span>
                      <h4 className="font-bold text-sm text-[#131B2E]">
                        Digital Marketing / Performance Intern
                      </h4>
                      <p className="text-xs text-slate-500">
                        VNG Corporation • TP. Hồ Chí Minh • Trợ cấp 5 - 7 triệu/tháng
                      </p>
                    </div>
                    <button
                      onClick={handleViewJobs}
                      className="px-4 py-2 bg-[#B90013] hover:bg-[#A30010] text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Ứng tuyển
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#B90013]/30 transition-all flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                        Độ tương thích 91%
                      </span>
                      <h4 className="font-bold text-sm text-[#131B2E]">
                        Content Marketing Trainee (Part-time / Full-time)
                      </h4>
                      <p className="text-xs text-slate-500">
                        Shopee Vietnam • Hà Nội • Trợ cấp 4.5 - 6 triệu/tháng
                      </p>
                    </div>
                    <button
                      onClick={handleViewJobs}
                      className="px-4 py-2 bg-[#B90013] hover:bg-[#A30010] text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Ứng tuyển
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: EVENTS */}
            {activeTab === 'events' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-[#131B2E]">
                    Sự kiện & Cuộc thi kết nối doanh nghiệp
                  </h3>
                  <button
                    onClick={() => onNavigate('events')}
                    className="text-xs font-bold text-[#B90013] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Xem tất cả</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-bold">
                        Workshop Chuyên sâu
                      </span>
                      <h4 className="font-bold text-sm text-[#131B2E]">
                        Chiến lược Performance Marketing trong kỷ nguyên AI
                      </h4>
                      <p className="text-xs text-slate-500">
                        Hội trường A2 - PTIT • 14:00 Thứ Bảy tuần này • Miễn phí
                      </p>
                    </div>
                    <button
                      onClick={() => onNavigate('events')}
                      className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Đăng ký
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 bg-white flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 rounded bg-red-50 text-[#B90013] text-[10px] font-bold">
                        Cuộc thi sinh viên
                      </span>
                      <h4 className="font-bold text-sm text-[#131B2E]">
                        PTIT Marketing Challenge 2025: Data-Driven Brand
                      </h4>
                      <p className="text-xs text-slate-500">
                        Giải thưởng 50.000.000 VNĐ • Hạn nộp đề án: Cuối tháng
                      </p>
                    </div>
                    <button
                      onClick={() => onNavigate('events')}
                      className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Đăng ký
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: TASKS */}
            {activeTab === 'tasks' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-extrabold text-[#131B2E]">
                      Hành động gợi ý cho To-do List (My Tasks)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Các bước hành động cụ thể để hoàn thiện hồ sơ và kỹ năng cho {primaryCareer.title}.
                    </p>
                  </div>

                  <button
                    onClick={handleAddTasksToMyTasks}
                    disabled={tasksAdded}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      tasksAdded
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-[#B90013] hover:bg-[#A30010] text-white shadow-xs'
                    }`}
                  >
                    {tasksAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Đã thêm vào My Tasks!</span>
                      </>
                    ) : (
                      <>
                        <ListTodo className="w-3.5 h-3.5" />
                        <span>Thêm tất cả vào My Tasks</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-2.5 pt-2">
                  {suggestedTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-start gap-3 text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={t.completed}
                        readOnly
                        className="mt-0.5 rounded text-[#B90013] focus:ring-[#B90013]"
                      />
                      <div className="space-y-0.5 flex-1">
                        <p className={`font-bold ${t.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                          {t.title}
                        </p>
                        <p className="text-slate-500 text-[11px]">{t.description}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-slate-500 border border-slate-200">
                        {t.dueDate}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Secondary Choices & AI CV & Save Card (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Các lựa chọn phù hợp tiếp theo
          </h3>

          {secondaryCareers.map((sc, i) => (
            <div
              key={sc.title}
              className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-bold">
                  Lựa chọn #{i + 2}
                </span>
                <span className="text-xs font-bold text-[#712AE2]">Phù hợp cao</span>
              </div>
              <h4 className="text-base font-extrabold text-[#131B2E]">{sc.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{sc.description}</p>
              <p className="text-[11px] text-slate-500">
                💡 <em>{sc.fitReason}</em>
              </p>
              <button
                onClick={() => {
                  onSelectCareer('cm-2');
                  onNavigate('roadmap');
                }}
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-2 px-3 rounded-xl text-xs border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Xem lộ trình hướng này</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {/* AI CV Card Integration (Section 14) */}
          <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-5 border border-purple-200/80 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#712AE2] text-white flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[#131B2E]">Tối ưu CV với AI</h4>
                <p className="text-[11px] text-slate-500">Cho vị trí {primaryCareer.title}</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Hệ thống đã nhận diện các từ khóa quan trọng ({primaryCareer.coreSkills.slice(0, 3).join(', ')}). Hãy đối chiếu CV của bạn ngay để tăng tỷ lệ được gọi phỏng vấn.
            </p>
            <button
              onClick={() => onNavigate('cv-builder')}
              className="w-full bg-[#712AE2] hover:bg-purple-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Quét và chỉnh sửa CV</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Save Result Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs text-center space-y-3">
            <div className="w-10 h-10 bg-red-50 text-[#B90013] rounded-xl mx-auto flex items-center justify-center border border-red-100">
              <Bookmark className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-sm">
                Đồng bộ vào Hồ sơ sinh viên
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Lưu lại kết quả này vào tài khoản để trang chủ và thanh gợi ý luôn cá nhân hóa theo định hướng của bạn.
              </p>
            </div>
            <button
              onClick={handleSaveResult}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                saved
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'border-2 border-[#B90013] text-[#B90013] hover:bg-[#B90013] hover:text-white'
              }`}
            >
              {saved ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Đã lưu vào hồ sơ</span>
                </>
              ) : (
                'Lưu vào hồ sơ'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
