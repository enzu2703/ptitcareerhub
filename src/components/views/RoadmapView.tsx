import React, { useState, useEffect, useMemo } from 'react';
import { ScreenView, UserProfileState, TargetJob } from '../../types';
import { TARGET_JOBS, CAREER_EVENTS, INITIAL_CV_DATA } from '../../data/mockData';
import { trackEvent } from '../../utils/analytics';
import {
  Sparkles,
  CheckCircle2,
  Circle,
  Lock,
  ArrowRight,
  GraduationCap,
  Megaphone,
  BarChart2,
  Briefcase,
  Layers,
  Award,
  Calendar,
  AlertCircle,
  Check,
  Compass,
  Plus,
  ExternalLink,
  Users,
  BookOpen,
  ListTodo,
  Clock,
  ChevronRight,
  Building2,
  MapPin,
  DollarSign,
  FileText,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RoadmapViewProps {
  onNavigate: (view: ScreenView) => void;
  selectedCareerTitle?: string;
  onOpenOrientationModal?: () => void;
  userProfile?: UserProfileState;
  onUpdateUserProfile?: (updated: Partial<UserProfileState>) => void;
  onSelectJobDetail?: (job: TargetJob) => void;
}

interface RoadmapSkillItem {
  id: string;
  name: string;
  description: string;
  category: 'foundation' | 'core_tool' | 'project' | 'internship';
  priority: 'high' | 'medium' | 'normal';
  estimatedHours: string;
  recommendedResource: string;
  resourceLink?: string;
  sourceType: 'cv_match' | 'jd_requirement' | 'academic_priority';
  isCvMastered?: boolean;
}

interface RoadmapStagePlan {
  stageNumber: number;
  timeframe: string;
  levelName: string;
  subtitle: string;
  academicFocus: string;
  skills: RoadmapSkillItem[];
}

const STORAGE_COMPLETED_KEY = 'ptit_career_map_completed_skills_v2';
const STORAGE_REMOVED_KEY = 'ptit_career_map_removed_skills_v2';
const TASKS_STORAGE_KEY = 'ptit_career_hub_tasks_v2';

export const RoadmapView: React.FC<RoadmapViewProps> = ({
  onNavigate,
  selectedCareerTitle = 'Digital Marketing',
  userProfile,
  onUpdateUserProfile,
  onSelectJobDetail,
}) => {
  // Academic year selection (Năm 1, Năm 2, Năm 3, Năm 4)
  const initialYear = useMemo(() => {
    if (userProfile?.academicYear?.includes('1')) return 'Năm 1';
    if (userProfile?.academicYear?.includes('2')) return 'Năm 2';
    if (userProfile?.academicYear?.includes('3')) return 'Năm 3';
    if (userProfile?.academicYear?.includes('4')) return 'Năm 4';
    return 'Năm 1';
  }, [userProfile?.academicYear]);

  const [selectedYear, setSelectedYear] = useState<string>(initialYear);

  // Target Job from Profile or default curated
  const targetJob: TargetJob = useMemo(() => {
    if (userProfile?.targetJobId) {
      const found = TARGET_JOBS.find((j) => j.id === userProfile.targetJobId);
      if (found) return found;
    }
    if (userProfile?.targetJobTitle) {
      const foundByTitle = TARGET_JOBS.find(
        (j) => j.title.toLowerCase().includes(userProfile.targetJobTitle!.toLowerCase()) ||
               userProfile.targetJobTitle!.toLowerCase().includes(j.title.toLowerCase())
      );
      if (foundByTitle) return foundByTitle;

      return {
        id: userProfile.targetJobId || 'custom-target-job',
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
        matchPercentage: 92,
        isSaved: false,
      };
    }
    return TARGET_JOBS[1] || TARGET_JOBS[0]; // VNG Junior Performance Marketer
  }, [
    userProfile?.targetJobId,
    userProfile?.targetJobTitle,
    userProfile?.targetJobCompany,
    userProfile?.targetJobSalary,
    userProfile?.targetJobLocation,
    userProfile?.targetJobRequiredSkills,
    userProfile?.targetJobDescription,
    userProfile?.major,
  ]);

  const hasTargetJob = useMemo(() => {
    try {
      if (localStorage.getItem('ptit_target_job_cleared') === 'true') return false;
    } catch {}
    const title = userProfile?.targetJobTitle?.trim();
    if (title && title !== '' && title !== 'Chưa có' && title !== 'Chưa định hướng') return true;
    if (userProfile?.targetJobId && userProfile?.targetJobId.trim() !== '') return true;
    return false;
  }, [userProfile?.targetJobId, userProfile?.targetJobTitle]);

  const careerTitle = (hasTargetJob ? (userProfile?.targetJobTitle || userProfile?.careerDirection) : null) || selectedCareerTitle;

  // Completed skills state (persisted)
  const [completedSkills, setCompletedSkills] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_COMPLETED_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    // Default: CV-acquired skills are already marked completed
    return {
      'sk-mkt-fund': true,
      'sk-content-write': true,
      'sk-canva-basic': true,
    };
  });

  // Removed skills state (persisted so users can remove skills they find unnecessary)
  const [removedSkills, setRemovedSkills] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_REMOVED_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {};
  });

  // Toast feedback for removed skill with Undo action
  const [removedToast, setRemovedToast] = useState<{ id: string; name: string } | null>(null);

  // Toast feedback for task added
  const [taskAddedToast, setTaskAddedToast] = useState<{ title: string; linkText: string } | null>(null);

  useEffect(() => {
    trackEvent('career_map_view', {
      career_direction: careerTitle,
      academic_year: selectedYear,
      target_job: targetJob.title,
    });
  }, [careerTitle, selectedYear, targetJob.title]);

  // Handle removing a skill from the roadmap
  const handleRemoveSkill = (skillId: string, skillName: string) => {
    const updated = { ...removedSkills, [skillId]: true };
    setRemovedSkills(updated);
    try {
      localStorage.setItem(STORAGE_REMOVED_KEY, JSON.stringify(updated));
    } catch {
      // silent
    }

    setRemovedToast({ id: skillId, name: skillName });
    setTimeout(() => {
      setRemovedToast(null);
    }, 6000);
  };

  // Handle restoring a removed skill
  const handleRestoreSkill = (skillId: string) => {
    const updated = { ...removedSkills };
    delete updated[skillId];
    setRemovedSkills(updated);
    try {
      localStorage.setItem(STORAGE_REMOVED_KEY, JSON.stringify(updated));
    } catch {
      // silent
    }
    setRemovedToast(null);
  };

  // Handle restoring all removed skills
  const handleRestoreAllSkills = () => {
    setRemovedSkills({});
    try {
      localStorage.removeItem(STORAGE_REMOVED_KEY);
    } catch {
      // silent
    }
    setRemovedToast(null);
  };

  // Save completed skills to localStorage
  const handleToggleSkill = (skillId: string, skillName: string) => {
    const nextState = !completedSkills[skillId];
    const updated = { ...completedSkills, [skillId]: nextState };
    setCompletedSkills(updated);
    try {
      localStorage.setItem(STORAGE_COMPLETED_KEY, JSON.stringify(updated));
    } catch {
      // silent
    }

    if (nextState) {
      try {
        confetti({
          particleCount: 45,
          spread: 55,
          origin: { y: 0.6 },
        });
      } catch {
        // silent
      }
    }
  };

  // Add a skill or workshop directly to MyTasks
  const handleAddSkillToTasks = (skill: RoadmapSkillItem, stageTimeframe: string) => {
    try {
      const existing = localStorage.getItem(TASKS_STORAGE_KEY);
      let list = existing ? JSON.parse(existing) : [];

      const newTask = {
        id: `task-roadmap-${Date.now()}`,
        title: `Nắm vững: ${skill.name}`,
        description: `${skill.description} • Tài nguyên: ${skill.recommendedResource}`,
        category: 'roadmap',
        priority: skill.priority,
        dueDate: `Giai đoạn ${stageTimeframe}`,
        externalLink: skill.resourceLink || 'https://careerhub.ptit.edu.vn',
        completed: false,
        linkedView: 'roadmap',
        actionText: 'Xem Career Map',
      };

      list = [newTask, ...list];
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(list));

      setTaskAddedToast({
        title: skill.name,
        linkText: 'Xem trong My Tasks',
      });
      setTimeout(() => setTaskAddedToast(null), 4500);

      try {
        confetti({
          particleCount: 35,
          spread: 45,
          origin: { y: 0.65 },
        });
      } catch {
        // silent
      }
    } catch {
      // silent
    }
  };

  // Navigate to MyTasks with prefilled data into add modal
  const handleOpenInAddTaskForm = (skill: RoadmapSkillItem, stageTimeframe: string) => {
    try {
      const prefill = {
        title: `Nắm vững: ${skill.name}`,
        description: `${skill.description} (Mục tiêu cho JD: ${targetJob.title} tại ${targetJob.company}). Gợi ý: ${skill.recommendedResource}`,
        category: 'roadmap',
        priority: skill.priority,
        externalLink: skill.resourceLink || 'https://careerhub.ptit.edu.vn',
        startDate: new Date().toISOString().split('T')[0],
      };
      sessionStorage.setItem('ptit_pending_new_task', JSON.stringify(prefill));
    } catch {
      // silent
    }
    onNavigate('my-tasks');
  };

  // Add a workshop event to MyTasks
  const handleAddEventToTasks = (eventTitle: string, eventDate: string, eventLink: string) => {
    try {
      const existing = localStorage.getItem(TASKS_STORAGE_KEY);
      let list = existing ? JSON.parse(existing) : [];

      const newTask = {
        id: `task-event-${Date.now()}`,
        title: `Tham gia: ${eventTitle}`,
        description: `Tham gia sự kiện / workshop thực tế tại PTIT để tích lũy điểm rèn luyện và mở rộng quan hệ.`,
        category: 'learning',
        priority: 'high',
        dueDate: eventDate,
        externalLink: eventLink,
        completed: false,
        linkedView: 'events',
        actionText: 'Xem sự kiện',
      };

      list = [newTask, ...list];
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(list));

      setTaskAddedToast({
        title: eventTitle,
        linkText: 'Xem trong My Tasks',
      });
      setTimeout(() => setTaskAddedToast(null), 4500);

      try {
        confetti({
          particleCount: 35,
          spread: 45,
          origin: { y: 0.65 },
        });
      } catch {
        // silent
      }
    } catch {
      // silent
    }
  };

  // 1-2 Year Roadmap Stages tailored to target JD and academic year
  const roadmapStages: RoadmapStagePlan[] = useMemo(() => {
    return [
      {
        stageNumber: 1,
        timeframe: '0 – 6 tháng',
        levelName: 'Cấp độ 1 — Nền tảng học tập & Workshop / CLB',
        subtitle:
          selectedYear === 'Năm 1'
            ? 'Ưu tiên số 1: Điểm GPA trên trường, môn kinh tế đại cương & tham gia Workshop, CLB ngoại khóa.'
            : 'Xây dựng nền tảng kiến thức cơ sở ngành và hoàn thiện kỹ năng sản xuất nội dung ban đầu.',
        academicFocus:
          selectedYear === 'Năm 1'
            ? 'Đạt GPA ≥ 3.2 các môn đại cương (Kinh tế vi mô, Marketing căn bản, Tiếng Anh giao tiếp/TOEIC, Tin học văn phòng).'
            : 'Hoàn thành các môn Cơ sở ngành Marketing & Truyền thông, chuẩn bị tài liệu dự án.',
        skills: [
          {
            id: 'sk-mkt-fund',
            name: 'Nguyên lý Marketing & Hành vi người tiêu dùng',
            description: 'Nắm vững 4P/7P, phân khúc thị trường (STP) và phân tích tâm lý khách hàng thế hệ mới.',
            category: 'foundation',
            priority: 'high',
            estimatedHours: '30 giờ học tập',
            recommendedResource: 'Giáo trình Marketing Căn bản PTIT & Case studies thực tế',
            resourceLink: 'https://ptit.edu.vn',
            sourceType: 'academic_priority',
            isCvMastered: true,
          },
          {
            id: 'sk-content-write',
            name: 'Kỹ năng Viết Content & Storytelling đa kênh',
            description: 'Viết bài chuẩn format mạng xã hội (Facebook, TikTok script, Email marketing cơ bản).',
            category: 'core_tool',
            priority: 'high',
            estimatedHours: '25 giờ thực hành',
            recommendedResource: 'Khóa học Content Marketing Hub & Thực hành tại Fanpage CLB',
            resourceLink: 'https://ptit.edu.vn',
            sourceType: 'cv_match',
            isCvMastered: true,
          },
          {
            id: 'sk-canva-basic',
            name: 'Thiết kế đồ họa cơ bản với Canva & CapCut',
            description: 'Tự sản xuất ấn phẩm truyền thông, poster sự kiện và dựng video ngắn 30-60s.',
            category: 'core_tool',
            priority: 'medium',
            estimatedHours: '15 giờ',
            recommendedResource: 'Thực hành dựng video ngắn TikTok cho dự án môn học',
            sourceType: 'cv_match',
            isCvMastered: true,
          },
          {
            id: 'sk-excel-office',
            name: 'Tin học văn phòng & Xử lý số liệu Excel / Google Sheets',
            description: 'Thành thạo hàm tính toán (VLOOKUP, INDEX/MATCH, Pivot Table) để lập báo cáo chỉ số.',
            category: 'foundation',
            priority: 'high',
            estimatedHours: '20 giờ',
            recommendedResource: 'Học phần Tin học ứng dụng trong kinh tế PTIT',
            sourceType: 'academic_priority',
          },
          {
            id: 'sk-club-participate',
            name: 'Tham gia Câu lạc bộ chuyên môn hoặc Workshop ngoại khóa',
            description: 'Đăng ký và sinh hoạt tại CLB Marketing (MTC), TMĐT (PEC) hoặc CLB Kỹ năng sinh viên PTIT.',
            category: 'foundation',
            priority: 'high',
            estimatedHours: 'Hàng tuần',
            recommendedResource: 'CLB Marketing PTIT (MTC) & Đoàn Thanh niên PTIT',
            sourceType: 'academic_priority',
          },
        ],
      },
      {
        stageNumber: 2,
        timeframe: '6 – 12 tháng',
        levelName: 'Cấp độ 2 — Thực chiến chuyên môn & Công cụ số theo JD',
        subtitle: `Làm chủ các công cụ cốt lõi được yêu cầu trong JD ${targetJob.title} (Meta Ads, Google Ads, SEO, Phân tích số liệu).`,
        academicFocus: 'Ứng dụng kiến thức môn học vào dự án bài tập lớn và tham gia các cuộc thi sinh viên.',
        skills: [
          {
            id: 'sk-seo-onpage',
            name: 'SEO On-page & Nghiên cứu từ khóa thị trường',
            description: `Yêu cầu bắt buộc trong JD ${targetJob.title}: Phân tích từ khóa tìm kiếm, tối ưu cấu trúc bài viết và đo lường Organic Traffic.`,
            category: 'core_tool',
            priority: 'high',
            estimatedHours: '40 giờ',
            recommendedResource: 'Chứng chỉ Google Digital Garage & SEO Training Kit',
            resourceLink: 'https://skillshop.withgoogle.com',
            sourceType: 'jd_requirement',
          },
          {
            id: 'sk-performance-ads',
            name: 'Quảng cáo trả phí Meta Ads & Google Search Ads',
            description: 'Thiết lập chiến dịch quảng cáo, phân bổ ngân sách thử nghiệm A/B testing và đo lường CPA, ROAS.',
            category: 'core_tool',
            priority: 'high',
            estimatedHours: '50 giờ thực hành',
            recommendedResource: 'Meta Blueprint Certification & Google Ads Search Certificate',
            resourceLink: 'https://www.facebook.com/business/learn',
            sourceType: 'jd_requirement',
          },
          {
            id: 'sk-ga4-analytics',
            name: 'Phân tích dữ liệu phễu chuyển đổi (Google Analytics 4)',
            description: 'Đọc hiểu báo cáo người dùng, theo dõi hành vi sự kiện (event tracking) và tỷ lệ thoát trang.',
            category: 'core_tool',
            priority: 'high',
            estimatedHours: '25 giờ',
            recommendedResource: 'Google Analytics 4 Individual Qualification',
            sourceType: 'jd_requirement',
          },
          {
            id: 'sk-course-supplement',
            name: 'Khóa học bổ sung & Bài tập lớn Case Study thực tế',
            description: 'Xây dựng 1 kế hoạch Marketing số toàn diện 3 tháng cho 1 sản phẩm giả định hoặc doanh nghiệp vừa & nhỏ.',
            category: 'project',
            priority: 'medium',
            estimatedHours: '35 giờ',
            recommendedResource: 'Đề án môn học Quản trị Marketing số PTIT',
            sourceType: 'jd_requirement',
          },
        ],
      },
      {
        stageNumber: 3,
        timeframe: '12 – 24 tháng',
        levelName: 'Cấp độ 3 — Sẵn sàng tuyển dụng & Thực tập theo JD mục tiêu',
        subtitle: `Hoàn thiện hồ sơ năng lực, nộp đơn ứng tuyển vị trí ${targetJob.title} tại ${targetJob.company} hoặc đối tác doanh nghiệp.`,
        academicFocus: 'Chuẩn bị thực tập tốt nghiệp, hoàn thành các môn chuyên ngành và đồ án.',
        skills: [
          {
            id: 'sk-cv-ats-optimize',
            name: 'Tối ưu hóa CV & Portfolio chuẩn ATS theo đúng JD mục tiêu',
            description: `Khớp các từ khóa của JD ${targetJob.title}, lượng hóa thành tích bằng số liệu (STAR/XYZ format).`,
            category: 'internship',
            priority: 'high',
            estimatedHours: '10 giờ',
            recommendedResource: 'Công cụ AI CV Builder trên PTIT Career Hub',
            resourceLink: 'cv-builder',
            sourceType: 'jd_requirement',
          },
          {
            id: 'sk-mock-interview',
            name: 'Luyện tập phỏng vấn doanh nghiệp (Mock Interview)',
            description: 'Thực hành trả lời câu hỏi tình huống về xử lý khủng hoảng truyền thông, phân tích chiến dịch thất bại và đàm phán lương.',
            category: 'internship',
            priority: 'high',
            estimatedHours: '15 giờ',
            recommendedResource: 'Workshop phỏng vấn thử cùng HR Mentor PTIT Career Hub',
            sourceType: 'jd_requirement',
          },
          {
            id: 'sk-internship-apply',
            name: 'Ứng tuyển & Hoàn thành kỳ thực tập doanh nghiệp (Internship)',
            description: `Gửi hồ sơ ứng tuyển chính thức tới ${targetJob.company} hoặc các doanh nghiệp đối tác khối ngành kinh tế PTIT.`,
            category: 'internship',
            priority: 'high',
            estimatedHours: '3 – 6 tháng',
            recommendedResource: `Cổng tuyển dụng doanh nghiệp: ${targetJob.company}`,
            sourceType: 'jd_requirement',
          },
        ],
      },
    ];
  }, [selectedYear, targetJob]);

  // Overall roadmap progress calculation (excluding removed skills)
  const activeSkillsCount = useMemo(() => {
    let count = 0;
    roadmapStages.forEach((stage) => {
      stage.skills.forEach((sk) => {
        if (!removedSkills[sk.id]) count++;
      });
    });
    return count;
  }, [roadmapStages, removedSkills]);

  const completedCount = useMemo(() => {
    let count = 0;
    roadmapStages.forEach((stage) => {
      stage.skills.forEach((sk) => {
        if (!removedSkills[sk.id] && completedSkills[sk.id]) count++;
      });
    });
    return count;
  }, [roadmapStages, completedSkills, removedSkills]);

  const overallProgressPercentage = Math.round((completedCount / (activeSkillsCount || 1)) * 100);
  const removedCount = useMemo(() => Object.keys(removedSkills).length, [removedSkills]);

  // Available real events on web matching current student guidance
  const availableWebEvents = useMemo(() => {
    return CAREER_EVENTS.slice(0, 3);
  }, []);

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-10 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* HEADER SECTION */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="px-3 py-1 bg-red-50 text-[#B90013] rounded-full text-xs font-bold border border-red-100 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" />
            Lộ trình phát triển năng lực 1 – 2 năm
          </span>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Đã cá nhân hóa theo JD: {targetJob.title}
          </span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#131B2E] tracking-tight">
              Lộ trình Career Map 1 – 2 năm
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-3xl leading-relaxed mt-2">
              Lộ trình từng bước được thiết kế riêng dựa trên <strong>JD mục tiêu ({targetJob.company})</strong>, 
              <strong> hồ sơ sinh viên {selectedYear}</strong> và <strong>thông tin năng lực trong CV</strong> của bạn.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Quick button to MyTasks */}
            <button
              onClick={() => onNavigate('my-tasks')}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <ListTodo className="w-4 h-4 text-amber-400" />
              <span>Quản lý trong My Tasks</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('assessment-result')}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#712AE2]" />
              <span>Xem lại kết quả test</span>
            </button>
          </div>
        </div>

        {/* CONTEXT BANNER: TARGET JD + STUDENT PROFILE + CV GAP */}
        {!hasTargetJob ? (
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-50/70 via-white to-red-50/50 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black shrink-0 shadow-xs text-xl">
                  🎯
                </div>
                <div>
                  <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
                    Mục tiêu định hướng: Chưa có
                  </span>
                  <h3 className="font-extrabold text-[#131B2E] text-base sm:text-lg">
                    Thêm công việc mục tiêu của bạn
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tham khảo dựa trên kết quả gợi ý từ Career Check hoặc lựa chọn JD thực tế từ đối tác để cá nhân hóa lộ trình.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('jobs')}
                  className="px-4 py-2.5 rounded-xl bg-[#B90013] hover:bg-[#A30010] text-xs font-bold text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Chọn công việc mục tiêu</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-red-50/70 via-white to-amber-50/50 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200/70 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#B90013] text-white flex items-center justify-center font-black shrink-0 shadow-xs text-xl">
                  🎯
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#B90013] uppercase tracking-wider block">
                    Công việc mục tiêu (Đã chọn từ Career Check / Việc làm)
                  </span>
                  <h3 className="font-extrabold text-[#131B2E] text-base sm:text-lg flex items-center gap-2">
                    <span>{targetJob.title}</span>
                    <span className="text-xs font-semibold text-slate-500">• {targetJob.company}</span>
                  </h3>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                {onSelectJobDetail && (
                  <button
                    onClick={() => onSelectJobDetail(targetJob)}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 border border-slate-200/90 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer group"
                    title="Xem chi tiết toàn bộ mô tả công việc (JD) của vị trí mục tiêu này"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
                    <span>Chi tiết JD</span>
                  </button>
                )}

                <button
                  id="btn-change-target-jd"
                  onClick={() => onNavigate('jobs')}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-red-50 text-xs font-bold text-[#B90013] border border-red-200/90 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer group"
                  title="Chuyển sang trang việc làm để chọn hoặc thay đổi JD mục tiêu"
                >
                  <span>Đổi JD mục tiêu</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* Thông tin ngắn về JD đã lựa chọn */}
            <div className="p-3.5 rounded-2xl bg-white/95 border border-slate-200/80 space-y-2 text-xs shadow-2xs">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-slate-600">
                <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                  <span>{targetJob.salaryDisplay || 'Hỗ trợ 3.500.000 – 6.000.000 VNĐ/tháng'}</span>
                </div>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{targetJob.location || 'Hà Nội'}</span>
                </div>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{targetJob.level || targetJob.jobType || 'Thực tập sinh (Internship)'}</span>
                </div>
              </div>

              {targetJob.description && (
                <p className="text-slate-600 leading-relaxed text-[11.5px] line-clamp-2">
                  <strong className="text-slate-700">Tóm tắt vị trí: </strong>
                  {targetJob.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {/* Box 1: Ngành học & Năm sinh viên */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Hồ sơ sinh viên PTIT
                </span>
                <p className="font-bold text-slate-800 text-sm">
                  {userProfile?.major || 'Marketing & Truyền thông số'}
                </p>
                <p className="text-slate-500">Sinh viên: <strong>{selectedYear}</strong></p>
              </div>

              {/* Box 2: Kỹ năng đã có trong CV */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Kỹ năng đã có trong CV
                </span>
                <p className="font-semibold text-slate-700">
                  Canva, Viết Content, Kế hoạch mạng xã hội
                </p>
                <p className="text-[11px] text-emerald-600">Đã được ghi nhận vào Cấp độ 1</p>
              </div>

              {/* Box 3: Yêu cầu trọng tâm từ JD */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block flex items-center gap-1">
                  ⚡ Kỹ năng cần bổ sung theo JD
                </span>
                <p className="font-semibold text-slate-700 truncate">
                  {targetJob.requiredSkills.slice(0, 3).join(', ')}
                </p>
                <p className="text-[11px] text-amber-800">Trọng tâm học tập trong Cấp độ 2 & 3</p>
              </div>
            </div>
          </div>
        )}

        {/* ACADEMIC YEAR SELECTOR (ĐẶC BIỆT DÀNH CHO NĂM 1, NĂM 2, NĂM 3, NĂM 4) */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 pl-2">
            <GraduationCap className="w-5 h-5 text-[#B90013]" />
            <span className="text-xs font-bold text-slate-800">
              Chọn năm học để tối ưu lời khuyên & định hướng:
            </span>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            {(['Năm 1', 'Năm 2', 'Năm 3', 'Năm 4'] as const).map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedYear === yr
                    ? 'bg-[#B90013] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>

        {/* YEAR CONTEXTUAL NOTICE (ĐẶC BIỆT CHO SINH VIÊN NĂM 1) */}
        {selectedYear === 'Năm 1' && (
          <div className="p-5 rounded-2xl bg-blue-50/80 border border-blue-200 text-blue-950 space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                1
              </span>
              <h3 className="font-extrabold text-sm text-blue-900">
                Định hướng vàng cho Tân sinh viên Năm 1: Ưu tiên việc học trên lớp & tham gia Workshop, CLB ngoại khóa
              </h3>
            </div>
            <p className="text-blue-900/90 leading-relaxed pl-9">
              Đối với sinh viên Năm 1, <strong>ưu tiên số một là xây dựng nền tảng GPA vững chắc</strong> (các môn đại cương: Kinh tế vi mô, Marketing căn bản, Tiếng Anh giao tiếp/TOEIC, Tin học văn phòng). 
              Bạn chưa cần vội đi làm part-time ngoài ngành; thay vào đó, <strong>hãy tích cực tham gia các Workshop chuyên môn và hoạt động ngoại khóa tại các câu lạc bộ (CLB Marketing PTIT, CLB TMĐT, CLB Kỹ năng)</strong> 
              để tích lũy điểm rèn luyện, mở rộng mối quan hệ và có sản phẩm thực tế đầu tay cho CV.
            </p>
          </div>
        )}

        {selectedYear === 'Năm 2' && (
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-950 text-xs flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-[#712AE2] text-white flex items-center justify-center font-bold text-sm shrink-0">
              2
            </span>
            <p className="leading-relaxed">
              <strong>Sinh viên Năm 2:</strong> Bắt đầu học sâu các công cụ số theo JD (Google Ads, Meta Ads, SEO On-page), ứng dụng vào các bài tập lớn, làm quen với dữ liệu và chuẩn bị Portfolio dự án.
            </p>
          </div>
        )}

        {selectedYear === 'Năm 3' && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              3
            </span>
            <p className="leading-relaxed">
              <strong>Sinh viên Năm 3:</strong> Giai đoạn then chốt! Hoàn thiện CV chuẩn ATS bám sát JD {targetJob.title}, nộp hồ sơ ứng tuyển vị trí Thực tập sinh (Internship) và tham gia các cuộc thi sinh viên cấp trường/thành phố.
            </p>
          </div>
        )}

        {selectedYear === 'Năm 4' && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shrink-0">
              4
            </span>
            <p className="leading-relaxed">
              <strong>Sinh viên Năm 4:</strong> Hoàn thành đồ án tốt nghiệp, luyện tập phỏng vấn thử (Mock Interview) và ứng tuyển vị trí Fresher / Junior chính thức tại {targetJob.company}.
            </p>
          </div>
        )}
      </div>

      {/* OVERALL 1-2 YEAR PROGRESS BAR */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#131B2E]">
              Tiến độ hoàn thiện lộ trình (1 – 2 năm)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Đã hoàn thành <strong>{completedCount}</strong> / <strong>{activeSkillsCount}</strong> kỹ năng & cột mốc trọng tâm.
              {removedCount > 0 && (
                <span className="ml-2 text-slate-400">
                  (Đã gỡ {removedCount} kỹ năng không cần thiết)
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl font-black text-[#B90013]">
              {overallProgressPercentage}%
            </span>
            <span className="text-xs font-bold text-slate-400">hoàn tất</span>
          </div>
        </div>

        {/* Multi-segment visual progress bar */}
        <div className="w-full h-3.5 rounded-full bg-slate-100 overflow-hidden p-0.5 shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${Math.max(overallProgressPercentage, 8)}%` }}
          />
        </div>

        <div className="grid grid-cols-3 text-center text-xs font-bold pt-1 text-slate-600">
          <div className="text-left">
            <span>Cấp độ 1 (0–6 tháng)</span>
          </div>
          <div>
            <span>Cấp độ 2 (6–12 tháng)</span>
          </div>
          <div className="text-right">
            <span>Cấp độ 3 (12–24 tháng)</span>
          </div>
        </div>

        {/* Thông báo nếu có kỹ năng bị gỡ bỏ */}
        {removedCount > 0 && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Đang ẩn {removedCount} kỹ năng đã gỡ khỏi lộ trình.</span>
            <button
              onClick={handleRestoreAllSkills}
              className="font-bold text-[#B90013] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Khôi phục tất cả</span>
            </button>
          </div>
        )}
      </div>

      {/* TOAST FEEDBACK WHEN TASK IS ADDED */}
      {taskAddedToast && (
        <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between gap-3 animate-fade-in text-xs shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold">Đã thêm vào My Tasks thành công!</span>
              <p className="text-slate-300 text-[11px]">
                Nhiệm vụ <strong>"{taskAddedToast.title}"</strong> đã được đưa vào danh sách việc cần làm.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('my-tasks')}
            className="px-3 py-1.5 bg-[#B90013] hover:bg-[#A30010] text-white font-bold rounded-lg shrink-0 flex items-center gap-1 cursor-pointer"
          >
            <span>{taskAddedToast.linkText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* TOAST FEEDBACK WHEN SKILL IS REMOVED WITH UNDO OPTION */}
      {removedToast && (
        <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between gap-3 animate-fade-in text-xs shadow-lg border border-slate-800">
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-400 shrink-0" />
            <div>
              <span className="font-bold">Đã gỡ bỏ kỹ năng</span>
              <p className="text-slate-300 text-[11px]">
                Đã gỡ <strong>"{removedToast.name}"</strong> khỏi lộ trình của bạn.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleRestoreSkill(removedToast.id)}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white font-bold rounded-lg shrink-0 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Hoàn tác</span>
          </button>
        </div>
      )}

      {/* MAIN LAYOUT: LEFT 3-STAGE CAREER MAP (8 COLS) + RIGHT EVENTS & WORKSHOPS WIDGETS (4 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: 3 CẤP ĐỘ LỘ TRÌNH CHI TIẾT (8 COLS) */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#131B2E]">
              Kỹ năng & Kiến thức cần nắm vững theo từng cấp độ
            </h2>
            <span className="text-xs font-medium text-slate-500">
              Gỡ bỏ khi không cần thiết hoặc lên lịch trong My Tasks
            </span>
          </div>

          {roadmapStages.map((stage) => {
            const isStage1 = stage.stageNumber === 1;
            const isStage2 = stage.stageNumber === 2;
            const isStage3 = stage.stageNumber === 3;
            const visibleSkills = stage.skills.filter((skill) => !removedSkills[skill.id]);

            return (
              <div
                key={stage.stageNumber}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6"
              >
                {/* Stage Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-red-50 text-[#B90013]">
                        {stage.timeframe}
                      </span>
                      <span className="text-xs text-slate-400 font-bold">•</span>
                      <span className="text-xs font-semibold text-slate-600">
                        {stage.academicFocus}
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-extrabold text-[#131B2E] mt-1.5">
                      {stage.levelName}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                      {stage.subtitle}
                    </p>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-lg shrink-0">
                    {stage.stageNumber === 1 && <GraduationCap className="w-6 h-6 text-[#B90013]" />}
                    {stage.stageNumber === 2 && <Megaphone className="w-6 h-6 text-amber-600" />}
                    {stage.stageNumber === 3 && <Briefcase className="w-6 h-6 text-emerald-600" />}
                  </div>
                </div>

                {/* Skills & Knowledge items list */}
                <div className="space-y-3.5">
                  {visibleSkills.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500 space-y-2">
                      <p>Bạn đã gỡ tất cả kỹ năng trong giai đoạn này.</p>
                      <button
                        onClick={() => {
                          stage.skills.forEach((sk) => handleRestoreSkill(sk.id));
                        }}
                        className="font-bold text-[#B90013] hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Khôi phục kỹ năng giai đoạn này</span>
                      </button>
                    </div>
                  ) : (
                    visibleSkills.map((skill) => {
                      const isCompleted = Boolean(completedSkills[skill.id]);

                      return (
                        <div
                          key={skill.id}
                          className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                            isCompleted
                              ? 'bg-emerald-50/40 border-emerald-200/90'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            {/* Checkbox for Completion */}
                            <button
                              onClick={() => handleToggleSkill(skill.id, skill.name)}
                              className="mt-1 shrink-0 cursor-pointer"
                              title={isCompleted ? 'Đã hoàn thành (Click để bỏ chọn)' : 'Click để đánh dấu đã hoàn thành'}
                            >
                              {isCompleted ? (
                                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                                  <Check className="w-4 h-4" />
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-lg border-2 border-slate-300 hover:border-[#B90013] transition-colors bg-white" />
                              )}
                            </button>

                            {/* Skill Info */}
                            <div className="flex-1 min-w-0 space-y-1.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4
                                  className={`font-bold text-sm sm:text-base ${
                                    isCompleted ? 'line-through text-slate-500' : 'text-[#131B2E]'
                                  }`}
                                >
                                  {skill.name}
                                </h4>

                                {isCompleted && (
                                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                    ✓ Đã hoàn thành
                                  </span>
                                )}

                                {skill.isCvMastered && (
                                  <span className="px-2 py-0.5 rounded-md bg-purple-50 text-[#712AE2] text-[10px] font-bold border border-purple-100">
                                    Từ hồ sơ CV
                                  </span>
                                )}

                                {skill.sourceType === 'jd_requirement' && (
                                  <span className="px-2 py-0.5 rounded-md bg-red-50 text-[#B90013] text-[10px] font-bold border border-red-100">
                                    Trọng tâm JD
                                  </span>
                                )}

                                <span className="text-[11px] font-semibold text-slate-400">
                                  • {skill.estimatedHours}
                                </span>
                              </div>

                              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                {skill.description}
                              </p>

                              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
                                <span className="font-semibold text-slate-700 flex items-center gap-1">
                                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                                  Gợi ý học: {skill.recommendedResource}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Interactive Action Bar for this Skill */}
                          <div className="mt-3.5 pt-3 border-t border-slate-100/90 flex flex-wrap items-center justify-between gap-2 pl-9">
                            {/* Nút Gỡ bỏ để người dùng gỡ ra nếu thấy không cần thiết */}
                            <button
                              id={`btn-remove-skill-${skill.id}`}
                              onClick={() => handleRemoveSkill(skill.id, skill.name)}
                              className="text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors flex items-center gap-1.5 cursor-pointer py-1 group"
                              title="Gỡ kỹ năng này khỏi lộ trình nếu thấy không cần thiết"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600 transition-colors" />
                              <span>Gỡ bỏ</span>
                            </button>

                            {/* Dẫn người dùng tới phần thêm task */}
                            <button
                              id={`btn-add-task-redirect-${skill.id}`}
                              onClick={() => handleOpenInAddTaskForm(skill, stage.timeframe)}
                              className="px-3.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-[#B90013] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                              title="Mở giao diện My Tasks để chỉnh sửa ngày hạn và ghi chú chi tiết"
                            >
                              <span>Tới phần thêm task</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT COLUMN: WORKSHOPS, SỰ KIỆN WEB & CÂU LẠC BỘ (4 COLS) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: GỢI Ý CÁC SỰ KIỆN / WORKSHOP THỰC TẾ SẴN CÓ VÀ ĐÃ CẬP NHẬT TRÊN WEB */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">📅</span>
                <h3 className="font-extrabold text-[#131B2E] text-sm sm:text-base">
                  Workshop & Sự kiện trên Web
                </h3>
              </div>
              <button
                onClick={() => onNavigate('events')}
                className="text-xs font-bold text-[#B90013] hover:underline"
              >
                Xem tất cả →
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Các sự kiện thực tế sẵn có trên hệ thống PTIT Career Hub. Sinh viên nên tham gia để tích lũy kiến thức thực chiến và điểm rèn luyện:
            </p>

            <div className="space-y-3 pt-1">
              {availableWebEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-all space-y-2"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-[#B90013] flex flex-col items-center justify-center shrink-0 border border-red-100">
                      <span className="text-[8px] font-black uppercase leading-none">
                        {event.month}
                      </span>
                      <span className="text-xs font-black leading-none mt-0.5">
                        {event.day}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs text-[#131B2E] line-clamp-2">
                        {event.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {event.organizer}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                    <span className="text-emerald-700 font-bold">
                      +{event.trainingPoints || 3} điểm rèn luyện
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleAddEventToTasks(
                            event.title,
                            event.date,
                            event.registrationUrl || 'https://ptit.edu.vn'
                          )
                        }
                        className="text-slate-600 hover:text-[#B90013] font-bold flex items-center gap-1 cursor-pointer"
                        title="Thêm lịch tham gia workshop vào My Tasks"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Thêm task</span>
                      </button>

                      <button
                        onClick={() => onNavigate('events')}
                        className="text-[#B90013] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Chi tiết</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: CÂU LẠC BỘ & HOẠT ĐỘNG NGOẠI KHÓA KHUYẾN NGHỊ TẠI PTIT */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              <h3 className="font-extrabold text-[#131B2E] text-sm sm:text-base">
                Câu lạc bộ & Hoạt động ngoại khóa
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Nếu bạn là sinh viên <strong>Năm 1 hoặc Năm 2</strong>, tham gia các CLB dưới đây sẽ mang lại lợi thế vượt trội khi làm CV ứng tuyển:
            </p>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-purple-900 font-bold">CLB Marketing PTIT (MTC)</strong>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-200 text-purple-900">
                    Khuyên dùng
                  </span>
                </div>
                <p className="text-purple-950/80 text-[11px]">
                  Rèn luyện lên kế hoạch truyền thông, viết content fanpage và tổ chức sự kiện thực tế.
                </p>
                <button
                  onClick={() =>
                    handleAddEventToTasks(
                      'Ứng tuyển đợt tuyển thành viên CLB Marketing PTIT (MTC)',
                      'Tháng sau',
                      'https://facebook.com/ptitmarketingclub'
                    )
                  }
                  className="text-[11px] font-bold text-[#712AE2] hover:underline pt-1 block"
                >
                  + Thêm mục tiêu tham gia MTC vào My Tasks
                </button>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-amber-900 font-bold">CLB Thương mại điện tử PTIT (PEC)</strong>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                    Chuyên sâu
                  </span>
                </div>
                <p className="text-amber-950/80 text-[11px]">
                  Thực hành vận hành gian hàng Shopee/TikTok Shop, livestream bán hàng và affiliate marketing.
                </p>
                <button
                  onClick={() =>
                    handleAddEventToTasks(
                      'Tham gia sinh hoạt chuyên môn CLB Thương mại điện tử PTIT',
                      'Cuối tháng',
                      'https://ptit.edu.vn'
                    )
                  }
                  className="text-[11px] font-bold text-amber-800 hover:underline pt-1 block"
                >
                  + Thêm mục tiêu tham gia PEC vào My Tasks
                </button>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-emerald-900 font-bold">CLB Kỹ năng sinh viên & Tiếng Anh</strong>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                    Kỹ năng mềm
                  </span>
                </div>
                <p className="text-emerald-950/80 text-[11px]">
                  Rèn luyện kỹ năng thuyết trình trước đám đông, làm việc nhóm và giao tiếp tiếng Anh cơ bản.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: ĐI TỚI MY TASKS MANAGEMENT */}
          <div className="bg-gradient-to-br from-[#131B2E] to-slate-900 text-white rounded-3xl p-6 shadow-md space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#B90013] flex items-center justify-center text-white">
                <ListTodo className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white">Quản lý nhiệm vụ (My Tasks)</h4>
                <p className="text-[11px] text-slate-400">Đồng bộ lịch học & deadline</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Bạn có thể xem toàn bộ các kỹ năng đã thêm, đặt lịch hoàn thành với Mini Calendar và nhận thông báo tiến độ.
            </p>

            <button
              onClick={() => onNavigate('my-tasks')}
              className="w-full py-2.5 px-4 bg-[#B90013] hover:bg-[#A30010] text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Đi tới My Tasks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
