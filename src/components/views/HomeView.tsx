import React, { useState } from 'react';
import { ScreenView, UserProfileState } from '../../types';
import { trackEvent } from '../../utils/analytics';
import {
  Search,
  MapPin,
  Sparkles,
  Map,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Award,
  Users,
  Building2,
  Compass,
  CheckCircle2,
  Briefcase,
  FileText,
} from 'lucide-react';

interface HomeViewProps {
  onNavigate: (view: ScreenView) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onOpenOrientationModal?: () => void;
  userProfile?: UserProfileState;
  onStartCareerCheck?: () => void;
  onSkipCareerCheck?: () => void;
  onEditProfile?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  searchTerm,
  onSearchChange,
  onOpenOrientationModal,
  userProfile,
  onStartCareerCheck,
  onSkipCareerCheck,
  onEditProfile,
}) => {
  const [selectedLocation, setSelectedLocation] = useState('Hà Nội');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    trackEvent('job_view', { search: searchTerm, location: selectedLocation });
    onNavigate('jobs');
  };

  const handleTrendingClick = (keyword: string) => {
    onSearchChange(keyword);
    trackEvent('job_view', { search: keyword, location: selectedLocation, source: 'home_trending_keyword' });
    onNavigate('jobs');
  };

  const handleCareerCheckClick = () => {
    trackEvent('career_check_start', {
      source: 'home_hero_primary_cta',
      major: userProfile?.major,
      academicYear: userProfile?.academicYear,
    });
    if (onStartCareerCheck) {
      onStartCareerCheck();
    } else {
      onNavigate('assessment-intro');
    }
  };

  const handleSkipClick = () => {
    trackEvent('career_check_skip', {
      source: 'home_hero_secondary_cta',
      major: userProfile?.major,
      academicYear: userProfile?.academicYear,
    });
    if (onSkipCareerCheck) {
      onSkipCareerCheck();
    } else {
      onNavigate('jobs');
    }
  };

  const trendingKeywords = [
    'Thực tập sinh Marketing',
    'Business Analyst',
    'Thực tập E-Commerce',
    'Data Analyst',
    'Truyền thông & Content',
    'Quản trị kinh doanh',
  ];

  const isCareerCheckDone = Boolean(userProfile?.careerCheckCompleted);

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col justify-between font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 w-full space-y-14">
        {/* ========================================================= */}
        {/* 1. ƯU TIÊN HIỂN THỊ TÌM KIẾM VỊ TRÍ CÔNG VIỆC BẠN MUỐN TRƯỚC */}
        {/* ========================================================= */}
        <section className="text-center max-w-4xl mx-auto space-y-6">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EAEDFF] border border-[#DAE2FD] text-xs font-semibold text-[#004A75] shadow-2xs animate-fade-in">
            <span>Cổng phát triển sự nghiệp sinh viên</span>
            <span className="font-bold text-[#B90013]">PTIT Career Hub</span>
          </div>

          {/* Main Display Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#131B2E] tracking-tight leading-[1.2]">
            Tìm kiếm vị trí công việc <br className="hidden sm:inline" />
            <span className="text-[#B90013]">bạn mong muốn</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Khám phá hàng trăm cơ hội thực tập và việc làm chất lượng cao kết nối trực tiếp với mạng lưới doanh nghiệp đối tác hàng đầu của PTIT.
          </p>

          {/* Big Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-6 bg-white p-2.5 sm:p-3 rounded-2xl shadow-[0_10px_35px_rgba(15,23,42,0.08)] border border-slate-200/80 max-w-3xl mx-auto flex flex-col md:flex-row items-stretch gap-2.5 transition-all focus-within:shadow-[0_12px_40px_rgba(185,0,19,0.12)]"
          >
            {/* Keyword Input */}
            <div className="flex-1 flex items-center px-3 py-2 bg-slate-50/70 rounded-xl border border-slate-200/70 focus-within:border-[#B90013] focus-within:bg-white transition-all">
              <Search className="w-5 h-5 text-slate-400 mr-2.5 shrink-0" />
              <input
                type="text"
                placeholder="Chức danh, kỹ năng, công ty tuyển dụng..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-transparent text-sm sm:text-base text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            {/* Location Input */}
            <div className="flex items-center px-3 py-2 bg-slate-50/70 rounded-xl border border-slate-200/70 min-w-[160px]">
              <MapPin className="w-5 h-5 text-slate-400 mr-2 shrink-0" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full bg-transparent text-sm sm:text-base text-slate-800 focus:outline-none cursor-pointer font-medium"
              >
                <option value="Hà Nội">Hà Nội</option>
                <option value="TP. HCM">TP. HCM</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="bg-[#B90013] hover:bg-[#A30010] text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-sm hover:shadow text-sm sm:text-base shrink-0 cursor-pointer"
            >
              Tìm Kiếm
            </button>
          </form>

          {/* Quick Trending Searches */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-slate-500">
            <span className="font-semibold text-slate-400">Gợi ý tìm kiếm:</span>
            {trendingKeywords.map((kw) => (
              <button
                key={kw}
                type="button"
                onClick={() => handleTrendingClick(kw)}
                className="px-3 py-1 rounded-full bg-slate-100 hover:bg-red-50 hover:text-[#B90013] text-slate-700 font-medium transition-colors border border-slate-200/70 cursor-pointer"
              >
                {kw}
              </button>
            ))}
          </div>
        </section>

        {/* ========================================================= */}
        {/* 2. DẪN DẮT ĐẾN LÀM BÀI TEST ĐỂ XEM CƠ HỘI VIỆC LÀM PHÙ HỢP */}
        {/* ========================================================= */}
        <section className="max-w-4xl mx-auto">
          {!isCareerCheckDone ? (
            /* Khi chưa làm Career Check: Dẫn dắt thuyết phục làm bài test */
            <div className="relative overflow-hidden bg-gradient-to-br from-red-50/80 via-white to-amber-50/50 rounded-3xl p-6 sm:p-8 border border-red-100 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2.5 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100/70 text-[#B90013] text-xs font-bold border border-red-200/60">
                    <Compass className="w-3.5 h-3.5" />
                    <span>Định hướng nghề nghiệp & Đo độ phù hợp</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#131B2E] tracking-tight">
                    Chưa biết vị trí nào thực sự phù hợp với bạn?
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    Làm bài test ngắn <strong>Career Check</strong> (chỉ 3-5 phút) để AI phân tích sở thích, điểm mạnh tính cách và mở khóa danh sách việc làm có tỷ lệ phù hợp (<span className="text-[#B90013] font-bold">% Match</span>) cao nhất dành riêng cho bạn.
                  </p>
                </div>

                {/* Call to Action Buttons */}
                <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 justify-center">
                  <button
                    onClick={handleCareerCheckClick}
                    className="w-full sm:w-auto bg-[#B90013] hover:bg-[#A30010] text-white font-bold px-7 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 text-sm group cursor-pointer"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Làm Career Check ngay</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={handleSkipClick}
                    className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 font-bold px-6 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Xem việc làm theo ngành học</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* 3 Quick Value Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-red-100/70 text-xs">
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/80 border border-slate-100 text-slate-700 font-medium">
                  <span className="w-6 h-6 rounded-lg bg-red-100 text-[#B90013] flex items-center justify-center font-bold text-xs shrink-0">
                    🎯
                  </span>
                  <span>Đo % Match với từng vị trí JD tuyển dụng</span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/80 border border-slate-100 text-slate-700 font-medium">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                    🗺️
                  </span>
                  <span>Lộ trình theo cấp độ chuẩn hóa</span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/80 border border-slate-100 text-slate-700 font-medium">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                    💼
                  </span>
                  <span>Ưu tiên kết nối doanh nghiệp đối tác PTIT</span>
                </div>
              </div>
            </div>
          ) : (
            /* Khi đã hoàn thành Career Check: Hiển thị định hướng và dẫn dắt đến việc làm phù hợp */
            <div className="bg-emerald-50/90 border border-emerald-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-200 text-emerald-900 px-2.5 py-0.5 rounded-full">
                        Đã hoàn thành Career Check
                      </span>
                      <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                        {userProfile?.skillGap?.matchScore || 88}% Match
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                      Định hướng mục tiêu: <span className="text-emerald-800">{userProfile?.careerDirection || 'Business Analyst & Operations Specialist'}</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                      Hệ thống đã phân tích năng lực và sẵn sàng danh sách việc làm có độ tương thích cao nhất cùng lộ trình kỹ năng dành riêng cho bạn.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end shrink-0 pt-2 md:pt-0">
                  <button
                    onClick={() => onNavigate('jobs')}
                    className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Xem việc làm phù hợp ({userProfile?.skillGap?.matchScore || 88}% Match)</span>
                  </button>

                  <button
                    onClick={() => onNavigate('roadmap')}
                    className="px-4 py-2.5 rounded-xl bg-white border border-emerald-300 text-emerald-900 hover:bg-emerald-100 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
                  >
                    Xem Lộ trình
                  </button>

                  <button
                    onClick={() => onNavigate('assessment-intro')}
                    className="px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-emerald-100/60 text-xs font-medium transition-colors cursor-pointer"
                    title="Làm lại bài kiểm tra định hướng"
                  >
                    Làm lại test
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* 3. HIỂN THỊ HỆ SINH THÁI VIỆC LÀM TRƯỚC */}
        {/* ========================================================= */}
        <section className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-10 text-white shadow-xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center lg:text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-[#FFDAD6] block">
                Hệ sinh thái việc làm dành cho khối ngành Kinh tế
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold">
                Đa dạng Doanh nghiệp và Tập đoàn đồng hành
              </h3>
              <p className="text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed">
                Cơ hội thực tập và việc làm trực tiếp từ các đối tác chiến lược của Học viện Công nghệ Bưu chính Viễn thông dành cho sinh viên Marketing, Thương mại điện tử, Kinh tế số & Quản trị kinh doanh.
              </p>
              <div className="pt-1 flex items-center justify-center lg:justify-start gap-2 text-xs text-slate-400">
                <Briefcase className="w-4 h-4 text-[#FFDAD6] shrink-0" />
                <span>Gợi ý: Bấm vào tên doanh nghiệp để xem ngay các vị trí JD đang tuyển dụng</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2.5 sm:gap-3 max-w-xl">
              {[
                { name: 'Shopee', query: 'Shopee' },
                { name: 'Viettel', query: 'Viettel' },
                { name: 'Techcombank', query: 'Techcombank' },
                { name: 'FPT Telecom', query: 'FPT' },
                { name: 'VNPT', query: 'VNPT' },
                { name: 'VNPAY', query: 'VNPAY' },
                { name: 'Tiki', query: 'Tiki' },
                { name: 'VCCorp', query: 'VCCorp' },
                { name: 'VNG', query: 'VNG' },
                { name: 'MoMo', query: 'MoMo' },
                { name: 'Masan', query: 'Masan' },
                { name: 'Dentsu', query: 'Dentsu' },
              ].map((company) => (
                <button
                  key={company.name}
                  type="button"
                  onClick={() => {
                    onSearchChange(company.query);
                    onNavigate('jobs');
                    trackEvent('home_partner_company_click', { company: company.name, query: company.query });
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white font-semibold text-xs sm:text-sm border border-white/15 hover:border-white/40 cursor-pointer flex items-center gap-1.5 shadow-2xs group"
                  title={`Bấm để xem các vị trí JD tuyển dụng tại ${company.name}`}
                >
                  <span>{company.name}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 4. RỒI MỚI TỚI KHÁM PHÁ NGHỀ NGHIỆP */}
        {/* ========================================================= */}
        <section className="space-y-6 pt-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#131B2E]">
              Khám Phá Nghề Nghiệp
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-1">
              Trang bị hành trang ứng tuyển với AI CV và bản đồ lộ trình sự nghiệp.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Tạo & Tối Ưu CV AI */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-[0_4px_20px_rgba(15,23,42,0.04)] hover:shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition-all flex flex-col justify-between group">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold mb-4 border border-purple-100">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI-Powered
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#131B2E] mb-3">
                  Tạo & Tối Ưu CV AI
                </h3>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
                  Tự động thiết kế CV chuẩn ATS, phân tích độ phù hợp với JD doanh nghiệp và nhận gợi ý chỉnh sửa kỹ năng thông minh bằng AI.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    trackEvent('cv_analysis_start', { source: 'home_feature_card_primary' });
                    onNavigate('cv-builder');
                  }}
                  className="bg-[#712AE2] hover:bg-[#5A00C6] text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-xs hover:shadow flex items-center gap-2 text-xs sm:text-sm group-hover:gap-2.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Tạo CV với AI</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    trackEvent('cv_analysis_start', { source: 'home_feature_card_secondary' });
                    onNavigate('cv-builder');
                  }}
                  className="bg-purple-50 hover:bg-purple-100 text-[#712AE2] font-bold px-4 py-2.5 rounded-xl border border-purple-200 transition-all text-xs sm:text-sm cursor-pointer"
                >
                  Chấm điểm & Tối ưu ATS
                </button>
              </div>
            </div>

            {/* Card 2: Bản đồ nghề nghiệp */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-[0_4px_20px_rgba(15,23,42,0.04)] hover:shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition-all flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-red-50 text-[#B90013] flex items-center justify-center mb-4">
                  <Map className="w-5 h-5" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#131B2E] mb-3">
                  Bản đồ nghề nghiệp
                </h3>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
                  Khám phá các nấc thang thăng tiến trong ngành IT, Kinh tế, Truyền thông, Viễn thông & An toàn thông tin.
                </p>
              </div>

              <div>
                <button
                  onClick={() => onNavigate('roadmap')}
                  className="text-slate-700 hover:text-[#B90013] font-bold py-2 transition-colors flex items-center gap-1.5 text-sm sm:text-base group-hover:gap-2.5 cursor-pointer"
                >
                  <span>Xem chi tiết</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
