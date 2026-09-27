import React from 'react';
import {
  Users,
  Award,
  Briefcase,
  Calendar,
  Eye,
  Send,
  CalendarCheck,
  MousePointerClick,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

export interface OverviewMetricsProps {
  totalUsers: number;
  careerCheckCompleted: number;
  activeJobs: number;
  activeEvents: number;
  jobViews: number;
  applyClicks: number;
  eventViews: number;
  eventRegistrationClicks: number;
  hasLoaded: boolean;
  onNavigateTab: (tab: 'overview' | 'jobs' | 'events' | 'users' | 'analytics') => void;
}

export const AdminOverviewTab: React.FC<OverviewMetricsProps> = ({
  totalUsers,
  careerCheckCompleted,
  activeJobs,
  activeEvents,
  jobViews,
  applyClicks,
  eventViews,
  eventRegistrationClicks,
  hasLoaded,
  onNavigateTab,
}) => {
  const formatStat = (value: number) => {
    if (!hasLoaded) return 'Đang tải...';
    if (value === 0) return 'Chưa có dữ liệu';
    return value.toLocaleString('vi-VN');
  };

  const metricCards = [
    {
      id: 'total-users',
      title: 'Total Users',
      vietnameseTitle: 'Tổng số người dùng',
      value: formatStat(totalUsers),
      numericValue: totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      actionTab: 'users' as const,
      description: 'Hồ sơ sinh viên đăng ký trên hệ thống',
    },
    {
      id: 'career-check-completed',
      title: 'Career Check Completed',
      vietnameseTitle: 'Bài Career Check hoàn thành',
      value: formatStat(careerCheckCompleted),
      numericValue: careerCheckCompleted,
      icon: Award,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-100',
      actionTab: 'users' as const,
      description: 'Sinh viên đã làm xong khảo sát năng lực',
    },
    {
      id: 'active-jobs',
      title: 'Active Jobs',
      vietnameseTitle: 'Việc làm đang hoạt động',
      value: formatStat(activeJobs),
      numericValue: activeJobs,
      icon: Briefcase,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      actionTab: 'jobs' as const,
      description: 'JD đang mở tuyển dụng và hợp lệ',
    },
    {
      id: 'active-events',
      title: 'Active Events',
      vietnameseTitle: 'Sự kiện đang hoạt động',
      value: formatStat(activeEvents),
      numericValue: activeEvents,
      icon: Calendar,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
      actionTab: 'events' as const,
      description: 'Workshop, Talkshow chưa hết hạn',
    },
    {
      id: 'job-views',
      title: 'Job Views',
      vietnameseTitle: 'Lượt xem việc làm',
      value: formatStat(jobViews),
      numericValue: jobViews,
      icon: Eye,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-100',
      actionTab: 'analytics' as const,
      description: 'Tổng lượt xem chi tiết JD từ sinh viên',
    },
    {
      id: 'apply-clicks',
      title: 'Apply Clicks',
      vietnameseTitle: 'Lượt click Ứng tuyển',
      value: formatStat(applyClicks),
      numericValue: applyClicks,
      icon: Send,
      color: 'text-[#B90013]',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-100',
      actionTab: 'analytics' as const,
      description: 'Lượt nhấn chuyển đến link ứng tuyển công ty',
    },
    {
      id: 'event-views',
      title: 'Event Views',
      vietnameseTitle: 'Lượt xem sự kiện',
      value: formatStat(eventViews),
      numericValue: eventViews,
      icon: CalendarCheck,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100',
      actionTab: 'analytics' as const,
      description: 'Tổng lượt xem chi tiết sự kiện',
    },
    {
      id: 'event-registration-clicks',
      title: 'Event Registration Clicks',
      vietnameseTitle: 'Lượt click Đăng ký sự kiện',
      value: formatStat(eventRegistrationClicks),
      numericValue: eventRegistrationClicks,
      icon: MousePointerClick,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-100',
      actionTab: 'analytics' as const,
      description: 'Lượt nhấn chuyển đến link đăng ký sự kiện',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 text-white p-6 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-xs text-red-200">
              <ShieldCheck className="w-3.5 h-3.5 text-red-300" />
              <span>Bảng Điều Khiển Quản Trị Hệ Thống PTIT</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">
              Chỉ Số Vận Hành Thực Tế (Real-time Metrics)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Tất cả số liệu hiển thị được tính toán trực tiếp từ cơ sở dữ liệu Firestore và các lượt tương tác thật của sinh viên. Hệ thống cam kết không hiển thị số liệu giả lập.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 md:pt-0">
            <button
              onClick={() => onNavigateTab('jobs')}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span>+ Quản lý việc làm</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigateTab('events')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 backdrop-blur-xs"
            >
              <span>+ Quản lý sự kiện</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 8 Required Admin Metrics Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
            8 Chỉ Số Quản Trị Trọng Tâm
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Nguồn: Firestore & Interaction Tracker
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricCards.map((card) => {
            const Icon = card.icon;
            const isZero = card.numericValue === 0;

            return (
              <div
                key={card.id}
                onClick={() => onNavigateTab(card.actionTab)}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl ${card.bgColor} ${card.color} flex items-center justify-center border ${card.borderColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-slate-600 transition-colors">
                      {card.title}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-600 block">
                      {card.vietnameseTitle}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <p className={`text-2xl font-black ${isZero ? 'text-slate-400 text-lg font-bold' : 'text-[#131B2E]'}`}>
                        {card.value}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 line-clamp-1">
                    {card.description}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-700 transition-colors flex-shrink-0" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Access Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          onClick={() => onNavigateTab('users')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-purple-300 transition-all cursor-pointer space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Quản lý người dùng & Phân tích Career Check</h4>
            <p className="text-xs text-slate-500 mt-1">
              Xem cơ cấu sinh viên theo Chuyên ngành, Niên khóa, Mục tiêu nghề nghiệp và điểm trung bình CR, AN, OP, CO.
            </p>
          </div>
          <span className="text-xs font-bold text-purple-600 inline-flex items-center gap-1">
            Xem chi tiết phân tích <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <div
          onClick={() => onNavigateTab('jobs')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-all cursor-pointer space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Quản lý Việc làm & JD Doanh nghiệp</h4>
            <p className="text-xs text-slate-500 mt-1">
              Thêm mới JD thật, phân tích tự động bằng AI, duyệt tin tuyển dụng, ẩn/hiện và đồng bộ tức thì sang phía sinh viên.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-600 inline-flex items-center gap-1">
            Quản lý danh sách việc làm <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <div
          onClick={() => onNavigateTab('analytics')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-red-300 transition-all cursor-pointer space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-red-50 text-[#B90013] flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">AI Marketing Insights & GA4</h4>
            <p className="text-xs text-slate-500 mt-1">
              Khám phá xu hướng thị trường tuyển dụng PTIT, đề xuất nội dung và mở Google Analytics 4 để xem traffic chi tiết.
            </p>
          </div>
          <span className="text-xs font-bold text-[#B90013] inline-flex items-center gap-1">
            Khám phá báo cáo AI <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
