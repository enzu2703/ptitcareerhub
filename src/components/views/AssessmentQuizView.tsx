import React, { useState, useEffect } from 'react';
import { ScreenView, UserProfileState, CareerCheckResult } from '../../types';
import {
  CAREER_CHECK_QUESTIONS,
  processCareerCheckSubmission,
} from '../../services/careerCheckService';
import { trackEvent } from '../../utils/analytics';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  BrainCircuit,
  Compass,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AssessmentQuizViewProps {
  onNavigate: (view: ScreenView) => void;
  onFinishQuiz: (result?: CareerCheckResult) => void;
  userProfile?: UserProfileState;
  onUpdateUserProfile?: (updated: Partial<UserProfileState>) => void;
}

export const AssessmentQuizView: React.FC<AssessmentQuizViewProps> = ({
  onNavigate,
  onFinishQuiz,
  userProfile,
  onUpdateUserProfile,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(1);

  const totalQuestions = CAREER_CHECK_QUESTIONS.length;
  const currentQ = CAREER_CHECK_QUESTIONS[currentIndex];
  const selectedOptionKey = answers[currentQ.id];
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  useEffect(() => {
    trackEvent('career_check_start', {
      major: userProfile?.major,
      academic_year: userProfile?.academicYear,
    });
  }, []);

  const handleSelectOption = (key: 'A' | 'B' | 'C' | 'D', code: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: key,
    }));

    trackEvent('career_check_question_answer', {
      question_id: currentQ.id,
      selected_choice: key,
      category_code: code,
    });
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onNavigate('assessment-intro');
    }
  };

  const handleNextOrSubmit = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Completed all 10 questions -> Process submission
      setIsAnalyzing(true);
      setAnalysisStep(1);

      const result = processCareerCheckSubmission(answers, userProfile);

      // Save to user profile state immediately
      if (onUpdateUserProfile) {
        onUpdateUserProfile({
          careerCheckCompleted: true,
          careerDirection: result.recommendedCareers[0]?.title || 'Performance Marketing Specialist',
          careerInterestScores: result.scores,
          topCareerTendencies: result.topTendencies.map((t) => ({
            code: t.code,
            percentage: t.percentage,
            name: t.name,
          })),
          skillGap: result.skillGap,
          completedAt: result.completedAt,
        });
      }

      // Track career_check_complete with required non-PII fields
      trackEvent('career_check_complete', {
        major: userProfile?.major,
        academic_year: userProfile?.academicYear,
        career_goal: userProfile?.careerGoal,
        CR_score: result.scores.CR,
        AN_score: result.scores.AN,
        OP_score: result.scores.OP,
        CO_score: result.scores.CO,
        top_career_tendency: result.topTendencies[0]?.code,
      });

      setTimeout(() => setAnalysisStep(2), 650);
      setTimeout(() => setAnalysisStep(3), 1300);

      setTimeout(() => {
        setIsAnalyzing(false);
        onFinishQuiz(result);
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // silent
        }
      }, 1900);
    }
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 text-center font-['Plus_Jakarta_Sans',sans-serif] space-y-8 animate-fade-in">
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-red-50 text-[#B90013] flex items-center justify-center shadow-lg border border-red-100 animate-pulse">
            <BrainCircuit className="w-12 h-12" />
          </div>
          <span className="absolute -bottom-1 -right-1 p-2 bg-[#712AE2] text-white rounded-full shadow-md">
            <Sparkles className="w-4 h-4" />
          </span>
        </div>

        <div className="space-y-2 max-w-md">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#131B2E]">
            Đang tổng hợp Xu hướng nghề nghiệp...
          </h2>
          <p className="text-sm text-slate-600">
            Hệ thống đang tính toán phân bổ 4 xu hướng (CR, AN, OP, CO) và đối chiếu với chuyên ngành của bạn.
          </p>
        </div>

        {/* Step-by-step indicator */}
        <div className="space-y-2.5 text-xs font-semibold text-slate-600 w-full max-w-xs">
          <div
            className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
              analysisStep >= 1
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}
          >
            <CheckCircle2
              className={`w-4 h-4 ${analysisStep >= 1 ? 'text-emerald-600' : 'text-slate-300'}`}
            />
            <span>Tính điểm 4 xu hướng nghề nghiệp (CR, AN, OP, CO)</span>
          </div>

          <div
            className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
              analysisStep >= 2
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}
          >
            <CheckCircle2
              className={`w-4 h-4 ${analysisStep >= 2 ? 'text-emerald-600' : 'text-slate-300'}`}
            />
            <span>Xác định Top 3 xu hướng & Nhóm nghề tương thích</span>
          </div>

          <div
            className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
              analysisStep >= 3
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}
          >
            <CheckCircle2
              className={`w-4 h-4 ${analysisStep >= 3 ? 'text-emerald-600' : 'text-slate-300'}`}
            />
            <span>Xây dựng ma trận khoảng cách kỹ năng (Skill Gap)</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF9] font-['Plus_Jakarta_Sans',sans-serif] flex flex-col justify-between">
      {/* Top Navigation & Progress Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <button
            onClick={handlePrev}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{currentIndex === 0 ? 'Thoát' : 'Quay lại'}</span>
          </button>

          {/* Question Indicator: Câu 1/10 */}
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1 rounded-full bg-red-50 text-[#B90013] text-xs font-black border border-red-100">
              Câu {currentQ.id}/10
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-slate-500">
              {progressPercent}% hoàn thành
            </span>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5">
          <div
            className="bg-[#B90013] h-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {/* Main Single Question View */}
      <main className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 flex-1 flex flex-col justify-center space-y-8">
        <div className="space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
            <Compass className="w-3.5 h-3.5 text-[#B90013]" />
            <span>Tình huống nghề nghiệp thực tế</span>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#131B2E] leading-snug">
            {currentQ.question}
          </h1>
        </div>

        {/* 4 Large Answer Cards */}
        <div className="space-y-3.5">
          {currentQ.options.map((option) => {
            const isSelected = selectedOptionKey === option.key;

            return (
              <button
                key={option.key}
                type="button"
                onClick={() => handleSelectOption(option.key, option.code)}
                className={`w-full text-left p-5 sm:p-6 rounded-2xl border-2 transition-all flex items-start gap-4 cursor-pointer ${
                  isSelected
                    ? 'bg-red-50/60 border-[#B90013] shadow-sm text-slate-900 ring-2 ring-[#B90013]/15'
                    : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/70 text-slate-700'
                }`}
              >
                {/* Option Letter Pill */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-[#B90013] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {option.key}
                </div>

                {/* Option Text */}
                <div className="flex-1 min-w-0 pt-1">
                  <p className="text-sm sm:text-base font-semibold leading-relaxed">
                    {option.text}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-center text-[11px] text-slate-400">
          Chọn phương án tự nhiên và phù hợp nhất với trực giác của bạn.
        </p>
      </main>

      {/* Sticky Bottom Action Bar */}
      <footer className="sticky bottom-0 bg-white border-t border-slate-200 py-4 px-4 sm:px-6 z-20">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={handlePrev}
            className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs sm:text-sm font-bold text-slate-700 transition-colors cursor-pointer"
          >
            Quay lại
          </button>

          <button
            onClick={handleNextOrSubmit}
            disabled={!selectedOptionKey}
            className="bg-[#B90013] hover:bg-[#A30010] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm px-8 py-3.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>{currentIndex === totalQuestions - 1 ? 'Xem kết quả' : 'Tiếp tục'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
};
