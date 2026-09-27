import React, { useState, useMemo } from 'react';
import { ScreenView, StudentProfile } from '../types';
import { getPtitBatches, getCurrentAcademicYearLabel } from '../utils/academicYear';
import {
  Compass,
  Sparkles,
  Brain,
  UploadCloud,
  FileText,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  X,
  BookOpen,
  GraduationCap,
  Award,
  Briefcase,
  Layers,
  Check,
  RotateCcw,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface OrientationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: ScreenView) => void;
  onSaveProfile?: (data: Partial<StudentProfile>) => void;
  initialStep?: number;
}

const PTIT_MAJORS = [
  'Marketing & Truyền thông số',
  'Quản trị kinh doanh',
  'Thương mại điện tử',
  'Kinh tế số',
  'Công nghệ tài chính (Fintech)',
  'Kế toán',
  'Truyền thông đa phương tiện',
];

const QUICK_TEST_QUESTIONS = [
  {
    id: 1,
    question: 'Khi nhận một dự án mới tại trường, bạn cảm thấy hứng thú nhất với công việc nào?',
    options: [
      { key: 'A', text: 'Lập kế hoạch truyền thông, lên ý tưởng nội dung và tiếp cận người xem', trait: 'Marketing' },
      { key: 'B', text: 'Viết code xây dựng tính năng, thiết kế logic hệ thống và sửa lỗi kỹ thuật', trait: 'Engineering' },
      { key: 'C', text: 'Thu thập số liệu, phân tích biểu đồ thống kê và đưa ra nhận xét logic', trait: 'Data & Analytics' },
      { key: 'D', text: 'Gặp gỡ khách hàng, đàm phán ý tưởng và điều phối công việc giữa các nhóm', trait: 'Business & Management' },
    ],
  },
  {
    id: 2,
    question: 'Phong cách làm việc lý tưởng mà bạn hướng tới sau khi ra trường là gì?',
    options: [
      { key: 'A', text: 'Môi trường sáng tạo, năng động, thường xuyên bắt nhịp xu hướng mới', trait: 'Marketing' },
      { key: 'B', text: 'Môi trường công nghệ chuyên sâu, tập trung giải quyết các bài toán kỹ thuật phức tạp', trait: 'Engineering' },
      { key: 'C', text: 'Môi trường làm việc dựa trên dữ liệu chuẩn xác, đo lường rõ ràng từng chỉ số', trait: 'Data & Analytics' },
      { key: 'D', text: 'Môi trường kinh doanh thực chiến, mở rộng thị trường và quản lý dự án', trait: 'Business & Management' },
    ],
  },
  {
    id: 3,
    question: 'Kỹ năng mà bạn tự tin nhất và muốn nâng cao thành lợi thế cạnh tranh là gì?',
    options: [
      { key: 'A', text: 'Kể chuyện qua hình ảnh/chữ viết, sáng tạo nội dung mạng xã hội & quảng cáo', trait: 'Marketing' },
      { key: 'B', text: 'Tư duy logic, giải thuật lập trình và làm việc với các framework hiện đại', trait: 'Engineering' },
      { key: 'C', text: 'Xử lý dữ liệu Excel/SQL/Python, phân tích A/B Testing và hành vi người dùng', trait: 'Data & Analytics' },
      { key: 'D', text: 'Giao tiếp thuyết phục, thuyết trình trước đám đông và quản lý thời gian', trait: 'Business & Management' },
    ],
  },
  {
    id: 4,
    question: 'Khi gặp một sự cố hoặc vấn đề khó khăn trong dự án, phản xạ đầu tiên của bạn là gì?',
    options: [
      { key: 'A', text: 'Tìm cách diễn đạt lại thông điệp, thay đổi góc nhìn tiếp cận công chúng', trait: 'Marketing' },
      { key: 'B', text: 'Đọc tài liệu kỹ thuật, debug từng dòng mã nguồn để tìm nguyên nhân gốc rễ', trait: 'Engineering' },
      { key: 'C', text: 'Kiểm tra lại toàn bộ log số liệu, đối chiếu số liệu trước và sau sự cố', trait: 'Data & Analytics' },
      { key: 'D', text: 'Họp khẩn cấp với các bên liên quan để thống nhất phương án xử lý nhanh nhất', trait: 'Business & Management' },
    ],
  },
  {
    id: 5,
    question: 'Mục tiêu ưu tiên lớn nhất của bạn trong 6 tháng tới tại PTIT là gì?',
    options: [
      { key: 'A', text: 'Xây dựng portfolio chiến dịch truyền thông thực tế và xin thực tập Marketing', trait: 'Marketing' },
      { key: 'B', text: 'Làm sản phẩm thực chiến (Web/App/AI) và chuẩn bị hồ sơ ứng tuyển Software Dev', trait: 'Engineering' },
      { key: 'C', text: 'Làm chủ các công cụ phân tích dữ liệu và ứng tuyển vị trí Data / BA Intern', trait: 'Data & Analytics' },
      { key: 'D', text: 'Hoàn thiện kỹ năng mềm, tham gia câu lạc bộ/cuộc thi khởi nghiệp và mở rộng network', trait: 'Business & Management' },
    ],
  },
];

export const OrientationModal: React.FC<OrientationModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onSaveProfile,
  initialStep = 1,
}) => {
  const [step, setStep] = useState<number>(initialStep);

  // Dynamic PTIT batches auto-calculated by current calendar & academic year
  const batches = useMemo(() => getPtitBatches(), []);
  const academicYearLabel = useMemo(() => getCurrentAcademicYearLabel(), []);

  // Step 1 State: Thông tin học tập (Default to 4th year batch or 3rd year)
  const [major, setMajor] = useState<string>('Marketing & Truyền thông số');
  const [batch, setBatch] = useState<string>(batches[0]?.id || 'D23');

  const selectedBatchInfo = useMemo(() => {
    return batches.find((b) => b.id === batch) || batches[0];
  }, [batches, batch]);

  // Step 2 State: Mức độ định hướng
  // 'clear_goal' | 'undecided' | 'exploring'
  const [orientationLevel, setOrientationLevel] = useState<'clear_goal' | 'undecided' | 'exploring'>('undecided');

  // Step 3 State: Phương thức phân tích
  const [analysisMethod, setAnalysisMethod] = useState<'cv' | 'test'>('test');
  const [uploadedCvName, setUploadedCvName] = useState<string | null>(null);
  const [cvAnalyzing, setCvAnalyzing] = useState<boolean>(false);

  // Quick 5-Question Test State
  const [inQuizMode, setInQuizMode] = useState<boolean>(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({
    1: 'A',
    2: 'A',
    3: 'A',
    4: 'A',
    5: 'A',
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleNextStep = () => {
    if (step < 4) {
      const next = step + 1;
      setStep(next);
      if (next === 4) {
        try {
          confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
        } catch (e) {
          // silent
        }
      }
    } else {
      // Complete
      if (onSaveProfile) {
        onSaveProfile({
          careerGoal: major.includes('Marketing') ? 'Digital Marketing' : 'Software Engineering',
          currentLevel: selectedBatchInfo?.yearNum === 4 ? 'Advanced' : selectedBatchInfo?.yearNum === 3 ? 'Intermediate' : 'Beginner',
        });
      }
      onClose();
      onNavigate('roadmap');
    }
  };

  const handlePrevStep = () => {
    if (inQuizMode) {
      setInQuizMode(false);
      return;
    }
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSimulateUploadCV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCvAnalyzing(true);
      setTimeout(() => {
        setUploadedCvName(file.name);
        setCvAnalyzing(false);
        setAnalysisMethod('cv');
      }, 900);
    }
  };

  const handleSelectSampleCV = (sampleName: string) => {
    setCvAnalyzing(true);
    setTimeout(() => {
      setUploadedCvName(sampleName);
      setCvAnalyzing(false);
      setAnalysisMethod('cv');
    }, 600);
  };

  const handleAnswerQuizQuestion = (questionId: number, optionKey: string) => {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: optionKey }));
    if (currentQuestionIndex < QUICK_TEST_QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setIsQuizCompleted(true);
      setInQuizMode(false);
      setAnalysisMethod('test');
    }
  };

  // Determine top career recommendation from selections & student year
  const getRecommendedCareer = () => {
    const yNum = selectedBatchInfo?.yearNum || 4;
    const stageText =
      yNum === 4
        ? 'Cấp độ 4/5 (Sẵn sàng tốt nghiệp & Tuyển dụng)'
        : yNum === 3
        ? 'Cấp độ 3/5 (Thực tập & Dự án thực tế)'
        : yNum === 2
        ? 'Cấp độ 2/5 (Cơ sở ngành & Nền tảng)'
        : 'Cấp độ 1/5 (Nhập môn & Định hình)';

    if (major.includes('Marketing') || major.includes('Thương mại')) {
      return {
        title: 'Digital Marketing & Growth Specialist',
        sub: 'Marketing Số & Tối ưu Tăng trưởng',
        score: '96%',
        level: stageText,
        topSkills: ['SEO/SEM', 'Content Strategy', 'Google Analytics 4', 'Social Ads', 'A/B Testing'],
        matchedJobsCount: 14,
        nextStep:
          yNum === 4
            ? 'Chuẩn bị hồ sơ ứng tuyển chính thức và tối ưu Portfolio dự án thực chiến.'
            : 'Hoàn thành module Lập kế hoạch Digital Ads trên Lộ trình học tập.',
      };
    }
    if (major.includes('Công nghệ thông tin') || major.includes('Phần mềm') || major.includes('Khoa học máy tính')) {
      return {
        title: 'Fullstack / Frontend Software Engineer',
        sub: 'Kỹ sư Phát triển Phần mềm',
        score: '94%',
        level: stageText,
        topSkills: ['React/TypeScript', 'Node.js/Express', 'RESTful API', 'Git Flow', 'SQL/NoSQL'],
        matchedJobsCount: 18,
        nextStep:
          yNum === 4
            ? 'Hoàn thiện đồ án tốt nghiệp, đóng gói CV và ứng tuyển vị trí Fresher / Junior Dev.'
            : 'Thực hành làm mini project React + Express và kết nối cơ sở dữ liệu.',
      };
    }
    if (major.includes('An toàn thông tin')) {
      return {
        title: 'Information Security & SOC Analyst',
        sub: 'Chuyên viên An toàn thông tin',
        score: '95%',
        level: stageText,
        topSkills: ['Network Security', 'Penetration Testing', 'SIEM / Log Analysis', 'Cryptography', 'Linux Admin'],
        matchedJobsCount: 8,
        nextStep: 'Tham gia các bài thi CTF tại PTIT và luyện chứng chỉ CompTIA Security+.',
      };
    }
    return {
      title: 'Business Analyst & Digital Project Executive',
      sub: 'Chuyên viên Phân tích Nghiệp vụ & Dự án Số',
      score: '93%',
      level: stageText,
      topSkills: ['BRD/SRS Documentation', 'SQL & Data Modeling', 'User Story Mapping', 'Figma Wireframing', 'Agile/Scrum'],
      matchedJobsCount: 12,
      nextStep: 'Xây dựng tài liệu phân tích nghiệp vụ cho một hệ thống E-commerce thực tế.',
    };
  };

  const careerRec = getRecommendedCareer();

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 font-['Plus_Jakarta_Sans',sans-serif] animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[560px] max-h-[92vh] relative">
        {/* Top Right Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Đóng cửa sổ"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT SIDEBAR (Stepper & Brand) */}
        <div className="w-full md:w-[290px] bg-[#F8F9FC] border-b md:border-b-0 md:border-r border-slate-100 p-6 sm:p-7 flex flex-col justify-between shrink-0">
          <div className="space-y-8">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-red-50 text-[#B90013] flex items-center justify-center border border-red-100 shadow-2xs">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-base font-extrabold text-[#B90013] tracking-tight">
                PTIT Career
              </span>
            </div>

            {/* Stepper Navigation List */}
            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    step > 1
                      ? 'bg-[#B90013] text-white'
                      : step === 1
                      ? 'border-2 border-[#B90013] text-[#B90013] bg-white font-extrabold shadow-2xs'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {step > 1 ? <Check className="w-4 h-4" /> : '1'}
                </div>
                <div className="space-y-0.5">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider block ${step >= 1 ? 'text-[#B90013]' : 'text-slate-400'}`}>
                    BƯỚC 1
                  </span>
                  <span className={`text-xs font-bold block ${step === 1 ? 'text-[#131B2E]' : 'text-slate-600'}`}>
                    Cơ bản
                  </span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    step > 2
                      ? 'bg-[#B90013] text-white'
                      : step === 2
                      ? 'border-2 border-[#B90013] text-[#B90013] bg-white font-extrabold shadow-2xs'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {step > 2 ? <Check className="w-4 h-4" /> : '2'}
                </div>
                <div className="space-y-0.5">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider block ${step >= 2 ? 'text-[#B90013]' : 'text-slate-400'}`}>
                    BƯỚC 2
                  </span>
                  <span className={`text-xs font-bold block ${step === 2 ? 'text-[#131B2E]' : 'text-slate-600'}`}>
                    Định hướng
                  </span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    step > 3
                      ? 'bg-[#B90013] text-white'
                      : step === 3
                      ? 'border-2 border-[#B90013] text-[#B90013] bg-white font-extrabold shadow-2xs'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {step > 3 ? <Check className="w-4 h-4" /> : '3'}
                </div>
                <div className="space-y-0.5">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider block ${step >= 3 ? 'text-[#B90013]' : 'text-slate-400'}`}>
                    BƯỚC 3
                  </span>
                  <span className={`text-xs font-bold block ${step === 3 ? 'text-[#131B2E]' : 'text-slate-600'}`}>
                    Phân tích
                  </span>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    step === 4
                      ? 'border-2 border-[#B90013] text-[#B90013] bg-white font-extrabold shadow-2xs'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  4
                </div>
                <div className="space-y-0.5">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider block ${step === 4 ? 'text-[#B90013]' : 'text-slate-400'}`}>
                    BƯỚC 4
                  </span>
                  <span className={`text-xs font-bold block ${step === 4 ? 'text-[#131B2E]' : 'text-slate-600'}`}>
                    Hoàn tất
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Note at Bottom */}
          <div className="pt-6 border-t border-slate-200/60 hidden md:block">
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Thông tin của bạn sẽ được bảo mật và sử dụng để tối ưu lộ trình nghề nghiệp bởi AI.
            </p>
          </div>
        </div>

        {/* RIGHT MAIN CONTENT AREA */}
        <div className="flex-1 p-6 sm:p-8 md:p-10 flex flex-col justify-between overflow-y-auto">
          {/* STEP 1: THÔNG TIN HỌC TẬP */}
          {step === 1 && (
            <div className="space-y-7 animate-in fade-in-50 duration-200">
              {/* Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#131B2E] tracking-tight">
                    Thông tin học tập
                  </h2>
                  <span className="text-[11px] font-bold text-[#B90013] bg-red-50 border border-red-100 px-2.5 py-1 rounded-full">
                    {academicYearLabel}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Giúp hệ thống cập nhật đúng khóa sinh viên PTIT và đề xuất lộ trình chuẩn theo năm học.
                </p>
              </div>

              {/* Form Controls */}
              <div className="space-y-6">
                {/* Major Select */}
                <div className="space-y-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block">
                    CHUYÊN NGÀNH (KHỐI KINH TẾ) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <BookOpen className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      className="w-full pl-11 pr-10 py-3.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#B90013] focus:ring-2 focus:ring-red-100 appearance-none cursor-pointer"
                    >
                      {PTIT_MAJORS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                      ▼
                    </div>
                  </div>
                </div>

                {/* Batch / Year Select */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block">
                      KHÓA HỌC / NĂM SINH VIÊN <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-500 font-medium">Tự động đồng bộ</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {batches.map((b) => {
                      const isSelected = batch === b.id;
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setBatch(b.id)}
                          className={`p-3.5 sm:p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                            isSelected
                              ? 'border-2 border-[#8B0013] bg-red-50/50 shadow-2xs'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <span
                            className={`block text-base font-black ${
                              isSelected ? 'text-[#8B0013]' : 'text-slate-800'
                            }`}
                          >
                            {b.id}
                          </span>
                          <span
                            className={`text-xs block font-bold mt-0.5 ${
                              isSelected ? 'text-[#8B0013]' : 'text-slate-700'
                            }`}
                          >
                            {b.yearName}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                            {b.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: MỨC ĐỘ ĐỊNH HƯỚNG */}
          {step === 2 && (
            <div className="space-y-7 animate-in fade-in-50 duration-200">
              {/* Header */}
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#131B2E] tracking-tight">
                  Mức độ định hướng
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Chọn trạng thái hiện tại để AI thiết kế lộ trình phù hợp nhất với bạn.
                </p>
              </div>

              {/* 3 Option Cards */}
              <div className="space-y-3.5">
                {/* Option 1: Đã rõ mục tiêu */}
                <div
                  onClick={() => setOrientationLevel('clear_goal')}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    orientationLevel === 'clear_goal'
                      ? 'border-2 border-[#8B0013] bg-red-50/40 shadow-2xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                        orientationLevel === 'clear_goal'
                          ? 'bg-[#8B0013] text-white'
                          : 'bg-red-50 text-[#8B0013]'
                      }`}
                    >
                      <Compass className="w-5 h-5" />
                    </div>
                    <div className="space-y-1 text-left">
                      <h4 className="text-sm font-extrabold text-[#131B2E]">Đã rõ mục tiêu</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Tôi đã biết vị trí công việc muốn ứng tuyển và cần tìm cơ hội, tối ưu CV.
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      orientationLevel === 'clear_goal'
                        ? 'border-[#8B0013] bg-[#8B0013]'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {orientationLevel === 'clear_goal' && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </div>

                {/* Option 2: Đang phân vân */}
                <div
                  onClick={() => setOrientationLevel('undecided')}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    orientationLevel === 'undecided'
                      ? 'border-2 border-[#8B0013] bg-red-50/40 shadow-2xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                        orientationLevel === 'undecided'
                          ? 'bg-[#8B0013] text-white'
                          : 'bg-red-50 text-[#8B0013]'
                      }`}
                    >
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="space-y-1 text-left">
                      <h4 className="text-sm font-extrabold text-[#131B2E]">Đang phân vân</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Tôi có vài hướng đi trong ngành nhưng chưa chốt được ngách cụ thể (VD: Dev hay BA).
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      orientationLevel === 'undecided'
                        ? 'border-[#8B0013] bg-[#8B0013]'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {orientationLevel === 'undecided' && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </div>

                {/* Option 3: Chưa biết mình hợp gì */}
                <div
                  onClick={() => setOrientationLevel('exploring')}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    orientationLevel === 'exploring'
                      ? 'border-2 border-[#8B0013] bg-red-50/40 shadow-2xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                        orientationLevel === 'exploring'
                          ? 'bg-[#8B0013] text-white'
                          : 'bg-red-50 text-[#8B0013]'
                      }`}
                    >
                      <Brain className="w-5 h-5" />
                    </div>
                    <div className="space-y-1 text-left">
                      <h4 className="text-sm font-extrabold text-[#131B2E]">Chưa biết mình hợp gì</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Tôi cần đánh giá toàn diện để khám phá tiềm năng và nhận gợi ý nghề nghiệp.
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      orientationLevel === 'exploring'
                        ? 'border-[#8B0013] bg-[#8B0013]'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {orientationLevel === 'exploring' && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PHƯƠNG THỨC PHÂN TÍCH */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              {/* Header */}
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#131B2E] tracking-tight">
                  Phương thức phân tích
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Cung cấp dữ liệu để Cố vấn AI bắt đầu xây dựng hồ sơ cho bạn.
                </p>
              </div>

              {/* In-Modal Micro Quiz Mode */}
              {inQuizMode ? (
                <div className="p-5 sm:p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#B90013] bg-red-50 px-3 py-1 rounded-full border border-red-100">
                      Câu hỏi {currentQuestionIndex + 1} / {QUICK_TEST_QUESTIONS.length}
                    </span>
                    <button
                      onClick={() => setInQuizMode(false)}
                      className="text-xs text-slate-500 hover:text-slate-800 font-bold"
                    >
                      Hủy làm test
                    </button>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-[#131B2E] leading-snug">
                    {QUICK_TEST_QUESTIONS[currentQuestionIndex].question}
                  </h3>

                  <div className="space-y-2.5 pt-1">
                    {QUICK_TEST_QUESTIONS[currentQuestionIndex].options.map((opt) => {
                      const isSelected =
                        quizAnswers[QUICK_TEST_QUESTIONS[currentQuestionIndex].id] === opt.key;
                      return (
                        <button
                          key={opt.key}
                          onClick={() =>
                            handleAnswerQuizQuestion(
                              QUICK_TEST_QUESTIONS[currentQuestionIndex].id,
                              opt.key
                            )
                          }
                          className={`w-full p-3.5 rounded-2xl text-left border transition-all text-xs sm:text-sm flex items-start gap-3 ${
                            isSelected
                              ? 'border-2 border-[#8B0013] bg-red-50/70 font-bold text-[#131B2E]'
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium'
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-[#8B0013] text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {opt.key}
                          </span>
                          <span className="leading-snug">{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* 2 Main Analysis Choice Cards */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Card 1: Upload CV */}
                  <div
                    onClick={() => setAnalysisMethod('cv')}
                    className={`p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-4 text-center ${
                      analysisMethod === 'cv'
                        ? 'border-2 border-[#8B0013] bg-red-50/30 shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
                        <UploadCloud className="w-7 h-7" />
                      </div>
                      <h4 className="text-base font-extrabold text-[#131B2E]">Tải CV có sẵn lên</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        AI sẽ tự động trích xuất kỹ năng và phân tích điểm mạnh/yếu.
                      </p>
                    </div>

                    <div className="space-y-2 pt-2">
                      <label className="block w-full cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf,.docx,.doc"
                          onChange={handleSimulateUploadCV}
                          className="hidden"
                        />
                        <span className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 shadow-2xs">
                          <FileText className="w-3.5 h-3.5 text-slate-500" />
                          <span>{cvAnalyzing ? 'Đang trích xuất AI...' : uploadedCvName ? 'Đổi file CV khác' : 'Chọn file (PDF / Docx)'}</span>
                        </span>
                      </label>

                      {uploadedCvName && (
                        <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100 text-[11px] text-emerald-800 font-bold flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="truncate">Đã nạp: {uploadedCvName}</span>
                        </div>
                      )}

                      {!uploadedCvName && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectSampleCV(
                              major.includes('Marketing')
                                ? 'CV_Marketing_Intern_PTIT.pdf'
                                : 'CV_Software_Engineering_PTIT.pdf'
                            );
                          }}
                          className="text-[11px] text-[#B90013] hover:underline font-bold"
                        >
                          Hoặc dùng CV mẫu đề xuất →
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card 2: Làm trắc nghiệm (Recommended) */}
                  <div
                    onClick={() => setAnalysisMethod('test')}
                    className={`p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-4 text-center relative ${
                      analysisMethod === 'test'
                        ? 'border-2 border-[#4338CA] bg-indigo-50/30 shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    {/* Badge */}
                    <div className="absolute top-4 right-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-extrabold border border-blue-100 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-blue-600" />
                        Đề xuất
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="w-14 h-14 rounded-full bg-indigo-100 text-[#4338CA] flex items-center justify-center mx-auto">
                        <Brain className="w-7 h-7" />
                      </div>
                      <h4 className="text-base font-extrabold text-[#131B2E]">Làm trắc nghiệm</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Đánh giá tính cách RIASEC/MBTI để tìm ra nghề nghiệp phù hợp nhất.
                      </p>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInQuizMode(true);
                        }}
                        className="w-full py-2.5 px-4 rounded-xl bg-[#4338CA] hover:bg-[#3730A3] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        <span>{isQuizCompleted ? 'Làm lại bài test (5 câu)' : 'Bắt đầu bài test (5 câu)'}</span>
                      </button>

                      {isQuizCompleted && (
                        <p className="text-[11px] text-emerald-700 font-bold mt-1.5 flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Đã hoàn thành đánh giá tính cách
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: HOÀN TẤT & LỘ TRÌNH ĐỀ XUẤT */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              {/* Header */}
              <div className="space-y-1.5">
                <span className="px-3 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold rounded-full border border-emerald-100 inline-block uppercase">
                  ✓ Phân tích AI hoàn tất
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#131B2E] tracking-tight">
                  Hồ sơ định hướng cá nhân hóa
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  Dựa trên chuyên ngành <strong>{major}</strong> ({batch}), Cố vấn AI đã thiết lập lộ trình nghề nghiệp tối ưu cho bạn.
                </p>
              </div>

              {/* Matched Role Hero Box */}
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-red-50/90 via-white to-purple-50/50 border border-red-100 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-[#B90013]">Vị trí định hướng phù hợp nhất:</span>
                    <h3 className="text-lg sm:text-xl font-black text-[#131B2E]">{careerRec.title}</h3>
                    <p className="text-xs text-slate-500 font-medium">{careerRec.sub}</p>
                  </div>
                  <div className="px-4 py-2 bg-white rounded-2xl border border-red-200 text-center shadow-2xs self-start sm:self-auto">
                    <span className="text-xs text-slate-400 block font-semibold">Độ tương thích</span>
                    <span className="text-lg font-black text-[#B90013]">{careerRec.score}</span>
                  </div>
                </div>

                {/* Skills Chips */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-600 block">Kỹ năng cốt lõi cần phát triển:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {careerRec.topSkills.map((sk) => (
                      <span
                        key={sk}
                        className="px-2.5 py-1 rounded-xl bg-white text-[#712AE2] text-xs font-bold border border-purple-100 shadow-2xs"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Next Step Actionable Recommendation */}
                <div className="p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#B90013] shrink-0 mt-0.5" />
                  <p>
                    <strong>Khuyến nghị từ Cố vấn AI:</strong> {careerRec.nextStep}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* BOTTOM CONTROLS ROW */}
          <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            {/* Back Button */}
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-4 py-3 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại</span>
              </button>
            ) : (
              <div />
            )}

            {/* Next / Finish Button */}
            {step < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-7 py-3.5 rounded-2xl bg-[#8B0013] hover:bg-[#70000F] text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer active:scale-95 ml-auto"
              >
                <span>Tiếp tục</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2.5 ml-auto">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigate('jobs');
                  }}
                  className="px-4 py-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-colors"
                >
                  Xem việc làm phù hợp ({careerRec.matchedJobsCount})
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-3.5 rounded-2xl bg-[#8B0013] hover:bg-[#70000F] text-white font-bold text-xs sm:text-sm shadow-sm flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>Xem Lộ trình nghề nghiệp →</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
