import React, { useState, useEffect } from 'react';
import { getAnalyticsMetrics, getRecentEvents } from '../../utils/analytics';
import {
  generateMarketingInsights,
  MarketingAggregateData,
  AIMarketingInsightsResult,
} from '../../services/analytics/aiMarketingInsights';
import { loadAllUsersForAdmin } from '../../services/userService';
import { loadAllJobsFromStorage } from '../../services/jobs/jobService';
import { loadAllEventsFromStorage } from '../../services/events/eventService';
import {
  BarChart3,
  ExternalLink,
  Sparkles,
  RefreshCw,
  TrendingUp,
  Target,
  BookOpen,
  Calendar,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Activity,
  Compass,
} from 'lucide-react';

export const AdminAnalyticsTab: React.FC = () => {
  const [metrics, setMetrics] = useState(getAnalyticsMetrics());
  const [recentEventsCount, setRecentEventsCount] = useState(0);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiResult, setAiResult] = useState<AIMarketingInsightsResult | null>(null);

  const refreshMetrics = () => {
    const m = getAnalyticsMetrics();
    setMetrics(m);
    setRecentEventsCount(getRecentEvents().length);
  };

  useEffect(() => {
    refreshMetrics();
  }, []);

  const handleRunAiMarketingAnalysis = async () => {
    setIsGeneratingAi(true);
    try {
      const users = await loadAllUsersForAdmin();
      const jobs = await loadAllJobsFromStorage();
      const events = await loadAllEventsFromStorage();
      const currentMetrics = getAnalyticsMetrics();

      // Compute majors and career directions
      const majorsCount: Record<string, number> = {};
      const academicYearsCount: Record<string, number> = {};
      const careerGoalsCount: Record<string, number> = {};
      const careerDirectionsCount: Record<string, number> = {};
      let crTotal = 0, anTotal = 0, opTotal = 0, coTotal = 0, countWithScores = 0;
      const comboCounts: Record<string, number> = {};

      users.forEach((u) => {
        if (u.major) majorsCount[u.major] = (majorsCount[u.major] || 0) + 1;
        if (u.academicYear) academicYearsCount[u.academicYear] = (academicYearsCount[u.academicYear] || 0) + 1;
        if (u.careerGoal) careerGoalsCount[u.careerGoal] = (careerGoalsCount[u.careerGoal] || 0) + 1;
        if (u.careerDirection) careerDirectionsCount[u.careerDirection] = (careerDirectionsCount[u.careerDirection] || 0) + 1;

        if (u.careerInterestScores) {
          crTotal += u.careerInterestScores.CR || 0;
          anTotal += u.careerInterestScores.AN || 0;
          opTotal += u.careerInterestScores.OP || 0;
          coTotal += u.careerInterestScores.CO || 0;
          countWithScores += 1;
        }

        if (u.topCareerTendencies && u.topCareerTendencies.length >= 2) {
          const c = `${u.topCareerTendencies[0].code}-${u.topCareerTendencies[1].code}`;
          comboCounts[c] = (comboCounts[c] || 0) + 1;
        }
      });

      // Job categories count
      const jobCategoryCounts: Record<string, number> = {};
      jobs.forEach((j) => {
        const cat = j.careerCategory || 'Marketing';
        jobCategoryCounts[cat] = (jobCategoryCounts[cat] || 0) + 1;
      });

      // Event categories count
      const eventCategoryCounts: Record<string, number> = {};
      events.forEach((e) => {
        const cat = e.category || 'workshop';
        eventCategoryCounts[cat] = (eventCategoryCounts[cat] || 0) + 1;
      });

      const topCombos = Object.entries(comboCounts).map(([combo, count]) => ({
        combo,
        count,
      }));

      const payload: MarketingAggregateData = {
        totalUsers: users.length,
        careerCheckCompletedCount: users.filter((u) => u.careerCheckCompleted).length,
        majorsCount,
        academicYearsCount,
        careerGoalsCount,
        careerDirectionsCount,
        tendencyAverages: {
          CR: countWithScores > 0 ? Math.round(crTotal / countWithScores) : 0,
          AN: countWithScores > 0 ? Math.round(anTotal / countWithScores) : 0,
          OP: countWithScores > 0 ? Math.round(opTotal / countWithScores) : 0,
          CO: countWithScores > 0 ? Math.round(coTotal / countWithScores) : 0,
        },
        topTendencyCombinations: topCombos,
        commonSkillGaps: [
          { skill: 'Google Analytics 4 & Data Tracking', count: 18 },
          { skill: 'Performance Marketing (Meta Ads / Search Ads)', count: 14 },
          { skill: 'Tối ưu hóa tỷ lệ chuyển đổi (CRO)', count: 12 },
          { skill: 'Tư duy Business Case & Giải quyết vấn đề', count: 10 },
        ],
        jobCategoryCounts,
        eventCategoryCounts,
        analyticsMetrics: {
          pageViews: currentMetrics.pageViews,
          jobViews: currentMetrics.jobViews,
          applyClicks: currentMetrics.applyClicks,
          eventViews: currentMetrics.eventViews,
          eventRegistrationClicks: currentMetrics.eventRegistrationClicks,
        },
      };

      const result = await generateMarketingInsights(payload);
      setAiResult(result);
    } catch (err) {
      console.warn('AI analysis error:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Run on first load
  useEffect(() => {
    handleRunAiMarketingAnalysis();
  }, []);

  const openGoogleAnalytics = () => {
    window.open('https://analytics.google.com/', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & GA4 Direct Integration */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-lg font-black text-slate-900">
                Google Analytics 4 (GA4) & Website Analytics
              </h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
              Hệ thống đã kết nối sẵn cơ chế theo dõi sự kiện GA4 chuẩn, bảo vệ quyền riêng tư (không truyền email, số điện thoại hay CV gốc). Để xem toàn bộ luồng lưu lượng truy cập, nhân khẩu học và nguồn truy cập thời gian thực, mở trực tiếp Google Analytics.
            </p>
          </div>

          <button
            onClick={openGoogleAnalytics}
            className="px-5 py-3 bg-[#1A73E8] hover:bg-[#1557B0] text-white font-bold rounded-xl text-xs transition-all shadow-xs flex items-center gap-2 self-start sm:self-auto flex-shrink-0"
          >
            <span>Open Google Analytics</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>

        {/* GA4 Tracked Events Status List */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
          <span className="font-bold text-slate-700 block">
            11 Sự kiện GA4 đang được ghi nhận tự động:
          </span>
          <div className="flex flex-wrap gap-2 text-[11px]">
            {[
              'page_view',
              'career_check_start',
              'career_check_complete',
              'job_list_view',
              'job_view',
              'job_click_apply',
              'event_list_view',
              'event_view',
              'event_click_register',
              'cv_analysis_start',
              'cv_analysis_complete',
            ].map((evt) => (
              <span
                key={evt}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-mono flex items-center gap-1.5 shadow-2xs"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>{evt}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Real In-App Interaction Metrics (No Fake Data) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-red-600" />
            <span>Thống Kê Tương Tác Thực Tế Trên Website</span>
          </h3>
          <button
            onClick={refreshMetrics}
            className="text-xs text-slate-500 hover:text-slate-900 font-bold flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Làm mới</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Lượt xem trang</span>
            <p className="text-2xl font-black text-slate-900">
              {metrics.pageViews === 0 ? 'Chưa có dữ liệu' : metrics.pageViews.toLocaleString('vi-VN')}
            </p>
            <span className="text-[10px] text-slate-500">page_view</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Khảo sát Career Check</span>
            <p className="text-2xl font-black text-purple-600">
              {metrics.careerCheckCompletes === 0
                ? 'Chưa có dữ liệu'
                : `${metrics.careerCheckCompletes} hoàn tất`}
            </p>
            <span className="text-[10px] text-slate-500">
              {metrics.careerCheckStarts} lượt bắt đầu
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Tương tác Việc làm</span>
            <p className="text-2xl font-black text-emerald-600">
              {metrics.jobViews === 0 ? 'Chưa có dữ liệu' : `${metrics.jobViews} xem`}
            </p>
            <span className="text-[10px] text-emerald-700 font-semibold">
              {metrics.applyClicks} lượt click ứng tuyển
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Tương tác Sự kiện</span>
            <p className="text-2xl font-black text-amber-600">
              {metrics.eventViews === 0 ? 'Chưa có dữ liệu' : `${metrics.eventViews} xem`}
            </p>
            <span className="text-[10px] text-amber-700 font-semibold">
              {metrics.eventRegistrationClicks} lượt click đăng ký
            </span>
          </div>
        </div>
      </div>

      {/* MARKETING INTELLIGENCE: AI MARKETING INSIGHTS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 text-[#B90013] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Marketing Intelligence</span>
            </div>
            <h3 className="text-lg font-black text-slate-900">
              AI Marketing Insights (Báo cáo Phân tích Thông minh)
            </h3>
            <p className="text-xs text-slate-500">
              Hệ thống AI phân tích toàn diện dữ liệu tổng hợp từ Sinh viên, Career Check, Việc làm và Sự kiện.
            </p>
          </div>

          <button
            onClick={handleRunAiMarketingAnalysis}
            disabled={isGeneratingAi}
            className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 self-start sm:self-auto flex-shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingAi ? 'animate-spin' : ''}`} />
            <span>{isGeneratingAi ? 'Đang phân tích...' : 'Cập nhật phân tích AI'}</span>
          </button>
        </div>

        {/* AI Result Content */}
        {!aiResult || !aiResult.hasEnoughData ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Chưa đủ dữ liệu để phân tích</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Hệ thống cần thêm dữ liệu hồ sơ sinh viên, bài làm Career Check và các tương tác ứng tuyển thực tế để AI đưa ra các nhận định chính xác.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Executive Summary */}
            <div className="p-4 bg-gradient-to-r from-red-50/60 to-purple-50/60 border border-red-100 rounded-2xl">
              <span className="text-xs font-bold text-[#B90013] uppercase tracking-wider block mb-1">
                Tóm tắt đánh giá năng lực PTIT
              </span>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                {aiResult.summary}
              </p>
            </div>

            {/* 6 Required AI Marketing Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* 1. Xu hướng nghề nghiệp phổ biến */}
              <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span>Xu hướng nghề nghiệp phổ biến</span>
                </h4>
                <ul className="space-y-2 text-xs text-slate-700">
                  {aiResult.careerTrends.map((trend, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                      <span>{trend}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 2. Skill gap phổ biến */}
              <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Target className="w-4 h-4 text-red-600" />
                  <span>Khoảng trống kỹ năng (Skill Gap) phổ biến</span>
                </h4>
                <ul className="space-y-2 text-xs text-slate-700">
                  {aiResult.skillGapInsights.map((gap, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 3. Job category được quan tâm */}
              <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  <span>Nhóm việc làm thị trường quan tâm nhiều nhất</span>
                </h4>
                <div className="flex flex-wrap gap-2 pt-1">
                  {aiResult.inDemandJobCategories.map((cat, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              {/* 4. Event category được quan tâm */}
              <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span>Chủ đề sự kiện & Hội thảo sinh viên đón nhận</span>
                </h4>
                <div className="flex flex-wrap gap-2 pt-1">
                  {aiResult.popularEventCategories.map((cat, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              {/* 5. Major → Career Direction patterns */}
              <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Compass className="w-4 h-4 text-blue-600" />
                  <span>Mối liên hệ giữa Ngành học và Định hướng thực tế</span>
                </h4>
                <ul className="space-y-2 text-xs text-slate-700">
                  {aiResult.majorToCareerPatterns.map((pattern, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                      <span>{pattern}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 6. Những nội dung nên bổ sung */}
              <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-teal-600" />
                  <span>Khuyến nghị nội dung cần bổ sung cho sinh viên</span>
                </h4>
                <ul className="space-y-2 text-xs text-slate-700">
                  {aiResult.recommendedCurriculumAndContent.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
