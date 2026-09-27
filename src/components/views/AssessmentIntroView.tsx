import React, { useEffect } from 'react';
import { ScreenView } from '../../types';
import { trackEvent } from '../../utils/analytics';
import {
  Sparkles,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  BrainCircuit,
  Compass,
  Zap,
  Target,
} from 'lucide-react';

interface AssessmentIntroViewProps {
  onNavigate: (view: ScreenView) => void;
  onOpenOrientationModal?: () => void;
}

export const AssessmentIntroView: React.FC<AssessmentIntroViewProps> = ({
  onNavigate,
  onOpenOrientationModal,
}) => {
  useEffect(() => {
    trackEvent('career_check_view');
  }, []);

  const handleStart = () => {
    trackEvent('career_check_start');
    onNavigate('assessment-quiz');
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-3xl mx-auto space-y-8 text-center">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="px-3.5 py-1 bg-red-50 text-[#B90013] rounded-full text-xs font-bold border border-red-100 flex items-center gap-1.5 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            Career Check • PTIT Career Hub
          </span>
          <span className="px-3.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold border border-slate-200 flex items-center gap-1.5 shadow-2xs">
            <Clock className="w-3.5 h-3.5" />
            10 câu hỏi tình huống • ~3 phút
          </span>
        </div>

        {/* Heading & Subtitle */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#131B2E] tracking-tight leading-tight">
            Career Check
          </h1>
          <h2 className="text-xl sm:text-2xl font-bold text-[#B90013]">
            Khám phá xu hướng nghề nghiệp phù hợp với bạn
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            10 câu hỏi tình huống giúp bạn nhận diện những hoạt động, môi trường và vai trò công việc phù hợp với xu hướng của mình.
          </p>
        </div>

        {/* 4 Broad Career Tendencies Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left pt-2">
          <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-1.5 shadow-2xs">
            <span className="px-2 py-0.5 rounded-md bg-purple-100 text-[#712AE2] font-black text-[11px] inline-block">
              CR
            </span>
            <h3 className="font-extrabold text-sm text-slate-900">Sáng tạo & Đổi mới</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Idea generation, nội dung sáng tạo, sản phẩm mới, chiến dịch truyền thông.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-1.5 shadow-2xs">
            <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 font-black text-[11px] inline-block">
              AN
            </span>
            <h3 className="font-extrabold text-sm text-slate-900">Phân tích & Tối ưu</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Dữ liệu, tư duy logic, nghiên cứu thị trường, đo lường và tối ưu hiệu quả.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-1.5 shadow-2xs">
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-black text-[11px] inline-block">
              OP
            </span>
            <h3 className="font-extrabold text-sm text-slate-900">Lập kế hoạch & Vận hành</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Tổ chức quy trình, phân chia đầu việc, quản lý tiến độ và nguồn lực thực thi.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-red-50/60 border border-red-100 space-y-1.5 shadow-2xs">
            <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-800 font-black text-[11px] inline-block">
              CO
            </span>
            <h3 className="font-extrabold text-sm text-slate-900">Giao tiếp & Kinh doanh</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Đàm phán, kết nối mạng lưới, thuyết phục khách hàng và phát triển quan hệ.
            </p>
          </div>
        </div>

        {/* Additional Note / Disclaimer */}
        <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 text-amber-900 text-xs text-left flex items-start gap-3 shadow-2xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-amber-900">Lưu ý quan trọng:</p>
            <p className="text-amber-800 leading-relaxed">
              Kết quả mang tính định hướng, không phải đánh giá tâm lý hay kết luận nghề nghiệp cố định.
            </p>
          </div>
        </div>

        {/* Start CTA */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleStart}
            className="w-full sm:w-auto bg-[#B90013] hover:bg-[#A30010] text-white font-bold text-base sm:text-lg px-9 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all inline-flex items-center justify-center gap-3 group cursor-pointer"
          >
            <span>Bắt đầu Career Check</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
