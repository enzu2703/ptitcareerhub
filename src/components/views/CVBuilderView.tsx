import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ScreenView, TargetJob, UserProfileState } from '../../types';
import { TARGET_JOBS } from '../../data/mockData';
import {
  initializeGemini,
  parseCVFromPDF,
  parseJobDescription,
  analyzeCVMatch,
  generateCVSuggestions,
  saveCVSession,
  ExtractedCVData,
  ParsedJDData,
  MatchResultData,
  CVSuggestionsData,
  CVSessionState,
} from '../../services/geminiService';
import {
  Sparkles,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  TrendingUp,
  FileCheck2,
  Trash2,
  Eye,
  ArrowRight,
  XCircle,
  HelpCircle,
  Layers,
  Edit3,
  X,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CVBuilderViewProps {
  onNavigate: (view: ScreenView) => void;
  targetJobForCv?: TargetJob | null;
  userProfile?: UserProfileState;
  onUpdateUserProfile?: (partial: Partial<UserProfileState>) => void;
  allJobs?: TargetJob[];
  onSelectJobForCv?: (job: TargetJob) => void;
  onEditProfile?: () => void;
}

const SAMPLE_PTIT_CV_TEXT = `NGUYỄN VĂN MINH
Sinh viên năm 3 - Chuyên ngành Marketing & Truyền thông số
Học viện Công nghệ Bưu chính Viễn thông (PTIT)
Email: minh.ptit@student.ptit.edu.vn | Điện thoại: 0987.654.321
Địa chỉ: Hà Đông, Hà Nội

MỤC TIÊU NGHỀ NGHIỆP:
Sinh viên năm 3 ngành Marketing PTIT có tư duy số liệu và khả năng sáng tạo nội dung. Mong muốn tìm kiếm cơ hội thực tập vị trí Digital Marketing / Content Marketing để vận dụng kiến thức truyền thông số vào thực tế.

HỌC VẤN:
Học viện Công nghệ Bưu chính Viễn thông (PTIT) (2022 - 2026)
- Chuyên ngành: Marketing & Truyền thông số
- Điểm trung bình tích lũy: 3.25/4.0

KINH NGHIỆM & DỰ ÁN:
1. Ban Truyền thông - Câu lạc bộ Marketing PTIT (09/2023 - Nay)
- Tham gia viết bài cho fanpage câu lạc bộ và hỗ trợ điều phối sự kiện.
- Phối hợp với đội thiết kế sản xuất ấn phẩm truyền thông.

2. Đồ án môn học: Xây dựng Kế hoạch Truyền thông Tích hợp (IMC)
- Nghiên cứu chân dung khách hàng Gen Z và đề xuất kế hoạch nội dung trên Facebook.

KỸ NĂNG:
- Công cụ: Canva, Meta Business Suite, Google Docs/Sheets
- Kỹ năng mềm: Làm việc nhóm, Giao tiếp, Quản lý thời gian`;

export const CVBuilderView: React.FC<CVBuilderViewProps> = ({
  onNavigate,
  targetJobForCv,
  userProfile,
  onUpdateUserProfile,
  allJobs = TARGET_JOBS,
  onSelectJobForCv,
  onEditProfile,
}) => {
  const jobsList = allJobs && allJobs.length > 0 ? allJobs : TARGET_JOBS;

  const currentTargetJob = useMemo<TargetJob>(() => {
    if (targetJobForCv) return targetJobForCv;
    if (userProfile?.targetJobId) {
      const found = jobsList.find((j) => j.id === userProfile.targetJobId);
      if (found) return found;
    }
    if (userProfile?.targetJobTitle) {
      const foundByTitle = jobsList.find((j) =>
        j.title.toLowerCase().includes(userProfile.targetJobTitle!.toLowerCase())
      );
      if (foundByTitle) return foundByTitle;

      return {
        ...jobsList[0],
        id: userProfile.targetJobId || 'custom-target-job',
        title: userProfile.targetJobTitle,
        company: userProfile.targetJobCompany || 'Doanh nghiệp đối tác PTIT',
        location: userProfile.targetJobLocation || 'Hà Nội',
        salaryDisplay: userProfile.targetJobSalary || 'Hỗ trợ 4.000.000 – 7.000.000 VNĐ/tháng',
        description: userProfile.targetJobDescription || 'Mục tiêu nghề nghiệp đã lựa chọn.',
        requiredSkills: userProfile.targetJobRequiredSkills || ['Marketing số', 'Kỹ năng giao tiếp', 'Tư duy số liệu'],
      };
    }
    return jobsList[0];
  }, [targetJobForCv, userProfile, jobsList]);

  // CV Session state (Section III & XVIII)
  const [currentSession, setCurrentSession] = useState<CVSessionState | null>(null);
  const [extractedCV, setExtractedCV] = useState<ExtractedCVData | null>(null);
  const [verifiedCV, setVerifiedCV] = useState<ExtractedCVData | null>(null);
  const [parsedJD, setParsedJD] = useState<ParsedJDData | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResultData | null>(null);
  const [suggestions, setSuggestions] = useState<CVSuggestionsData | null>(null);

  // Status & Loading states (Section XXI)
  const [loadingStepText, setLoadingStepText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [geminiError, setGeminiError] = useState<string | null>(null);
  const [isRealCvMode, setIsRealCvMode] = useState(false);

  // UI state
  const [isDragging, setIsDragging] = useState(false);
  const [showRawText, setShowRawText] = useState(false);
  const [activeTab, setActiveTab] = useState<'match' | 'suggestions' | 'missing' | 'strengths'>('match');
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  // Edit form states for Verification Modal (Section VIII)
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editSchool, setEditSchool] = useState('');
  const [editMajor, setEditMajor] = useState('');
  const [editSkillsText, setEditSkillsText] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Developer console debugging (logs without polluting the user-facing UI)
  useEffect(() => {
    if (currentSession) {
      console.log('[AI DEBUG] Current CV Session:', {
        sessionId: currentSession.id,
        fileName: currentSession.fileName,
        status: currentSession.status,
        candidate: verifiedCV?.candidate?.fullName || extractedCV?.candidate?.fullName,
        targetJob: currentTargetJob.title,
        overallMatch: matchResult ? `${matchResult.overallMatch}%` : 'Not matched yet',
        skills: extractedCV?.skills?.map((s) => s.name),
      });
    }
  }, [currentSession, verifiedCV, extractedCV, matchResult, currentTargetJob]);

  // Copy toast notification
  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNotification(`Đã sao chép ${label} vào bộ nhớ tạm!`);
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  // ==================== PIPELINE 1: USER UPLOAD PDF -> GEMINI PARSER ====================
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Check MIME type: strictly PDF (Section IV)
    const isPdf =
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setGeminiError('Vui lòng tải lên CV định dạng PDF.');
      return;
    }

    // Check file size (< 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setGeminiError('Tệp PDF vượt quá dung lượng cho phép (tối đa 10MB).');
      return;
    }

    // 1. Tạo CV session mới & xóa sạch state cũ (Section III)
    const sessionId = crypto.randomUUID();
    const uploadedAt =
      new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) +
      ', ' +
      new Date().toLocaleDateString('vi-VN');

    const newSession: CVSessionState = {
      id: sessionId,
      fileName: file.name,
      fileSize: file.size,
      uploadedAt,
      status: 'parsing_cv',
      extractedCV: null,
      targetJobId: currentTargetJob.id,
      targetJobTitle: currentTargetJob.title,
      targetCompany: currentTargetJob.company,
    };

    setCurrentSession(newSession);
    setExtractedCV(null);
    setVerifiedCV(null);
    setParsedJD(null);
    setMatchResult(null);
    setSuggestions(null);
    setGeminiError(null);
    setIsRealCvMode(true);
    setIsProcessing(true);

    try {
      // Loading State 1 & 2 (Section XXI)
      setLoadingStepText('Đang tải CV...');
      await new Promise((r) => setTimeout(r, 400));
      setLoadingStepText('Đang đọc nội dung file PDF...');

      // Convert to base64 data URL
      const base64Data: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setLoadingStepText('Đang trích xuất thông tin CV (Gemini Multimodal Document Input)...');

      // Call dedicated CV Parser
      const cvJson = await parseCVFromPDF(base64Data, file.name);

      setLoadingStepText('Đã đọc CV thành công.');
      await new Promise((r) => setTimeout(r, 400));

      setExtractedCV(cvJson);
      setVerifiedCV(JSON.parse(JSON.stringify(cvJson))); // clone for verification

      // Pre-fill verification form
      setEditFullName(cvJson.candidate?.fullName || '');
      setEditEmail(cvJson.candidate?.email || '');
      setEditPhone(cvJson.candidate?.phone || '');
      setEditSchool(cvJson.education?.[0]?.school || '');
      setEditMajor(cvJson.education?.[0]?.major || '');
      setEditSkillsText(cvJson.skills?.map((s) => s.name).join(', ') || '');

      const updatedSession: CVSessionState = {
        ...newSession,
        status: 'cv_parsed',
        extractedCV: cvJson,
      };
      setCurrentSession(updatedSession);
      saveCVSession(userProfile?.uid || 'guest', updatedSession);

      if (onUpdateUserProfile) {
        onUpdateUserProfile({
          cvFileName: file.name,
          cvFileSize: file.size,
          cvUploadedAt: uploadedAt,
          cvExtractedText: `Ứng viên: ${cvJson.candidate?.fullName || 'Chưa nhận diện'}\nMục tiêu: ${cvJson.careerObjective || '—'}`,
        });
      }

      try {
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
      } catch {}
    } catch (err: any) {
      console.error('Lỗi khi đọc file CV PDF:', err);
      setGeminiError(
        err?.message || 'Không thể đọc nội dung CV. Vui lòng kiểm tra lại file PDF.'
      );
      if (currentSession) {
        setCurrentSession({ ...currentSession, status: 'error', errorMessage: err?.message });
      }
    } finally {
      setIsProcessing(false);
      setLoadingStepText('');
    }
  };

  // ==================== PIPELINE 2: JD PARSER & MATCHING ====================
  const handleRunMatching = async () => {
    const cvToAnalyze = verifiedCV || extractedCV;
    if (!cvToAnalyze) return;

    setIsProcessing(true);
    setGeminiError(null);

    try {
      // Loading State for JD & Matching (Section XXI)
      setLoadingStepText('Đang đọc yêu cầu tuyển dụng (JD Parser)...');
      const jdData = await parseJobDescription(currentTargetJob);
      setParsedJD(jdData);

      setLoadingStepText('Đang đối chiếu từng yêu cầu CV với JD (CV-JD Matching)...');
      const matchRes = await analyzeCVMatch(cvToAnalyze, jdData);
      setMatchResult(matchRes);

      setLoadingStepText('Đang tạo gợi ý cải thiện CV (AI Optimization)...');
      const suggRes = await generateCVSuggestions(cvToAnalyze, jdData, matchRes);
      setSuggestions(suggRes);

      setLoadingStepText('Hoàn tất.');
      await new Promise((r) => setTimeout(r, 400));

      if (currentSession) {
        const completedSession: CVSessionState = {
          ...currentSession,
          status: 'completed',
          parsedJD: jdData,
          matchResult: matchRes,
          suggestions: suggRes,
        };
        setCurrentSession(completedSession);
        saveCVSession(userProfile?.uid || 'guest', completedSession);
      }

      try {
        confetti({ particleCount: 45, spread: 70, origin: { y: 0.6 } });
      } catch {}
    } catch (err: any) {
      console.error('Lỗi phân tích đối chiếu CV - JD:', err);
      setGeminiError(
        err?.message || 'Không thể hoàn thành đối chiếu CV với JD bằng Gemini.'
      );
    } finally {
      setIsProcessing(false);
      setLoadingStepText('');
    }
  };

  // ==================== PIPELINE 3: CV VERIFICATION SAVE ====================
  const handleSaveVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifiedCV) return;

    const newSkills = editSkillsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((skillName) => ({
        name: skillName,
        category: 'Chuyên môn',
        evidence: 'Người dùng xác nhận bổ sung',
        source: 'user_verified' as const,
      }));

    const updated: ExtractedCVData = {
      ...verifiedCV,
      candidate: {
        ...verifiedCV.candidate,
        fullName: editFullName.trim() || null,
        email: editEmail.trim() || null,
        phone: editPhone.trim() || null,
      },
      education: [
        {
          school: editSchool.trim() || (verifiedCV.education?.[0]?.school || ''),
          major: editMajor.trim() || null,
          degree: verifiedCV.education?.[0]?.degree || null,
          startDate: verifiedCV.education?.[0]?.startDate || null,
          endDate: verifiedCV.education?.[0]?.endDate || null,
          description: verifiedCV.education?.[0]?.description || null,
          source: 'user_verified',
        },
      ],
      skills: newSkills.length > 0 ? newSkills : verifiedCV.skills,
    };

    setVerifiedCV(updated);
    setIsVerificationModalOpen(false);

    if (currentSession) {
      const updatedSession: CVSessionState = {
        ...currentSession,
        status: 'user_verified',
        verifiedCV: updated,
      };
      setCurrentSession(updatedSession);
      saveCVSession(userProfile?.uid || 'guest', updatedSession);
    }

    setCopiedNotification('Đã cập nhật dữ liệu xác thực (source = user_verified)!');
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  // Demo Mode (Sample PTIT CV)
  const handleUseSampleCv = () => {
    setIsRealCvMode(false);
    setGeminiError(null);
    const fileName = 'CV_Mau_PTIT_Marketing_Intern.pdf';
    const uploadedAt = 'Vừa cập nhật';

    const sampleCV: ExtractedCVData = {
      candidate: {
        fullName: 'Nguyễn Văn Minh',
        email: 'minh.ptit@student.ptit.edu.vn',
        phone: '0987.654.321',
        location: 'Hà Đông, Hà Nội',
        linkedin: null,
        portfolio: null,
      },
      careerObjective: 'Sinh viên năm 3 ngành Marketing PTIT có tư duy số liệu và khả năng sáng tạo nội dung.',
      education: [
        {
          school: 'Học viện Công nghệ Bưu chính Viễn thông (PTIT)',
          major: 'Marketing & Truyền thông số',
          degree: 'Cử nhân',
          startDate: '2022',
          endDate: '2026',
          description: 'GPA: 3.25/4.0',
          source: 'cv_extracted',
        },
      ],
      workExperience: [
        {
          company: 'CLB Marketing PTIT',
          position: 'Thành viên Ban Truyền thông',
          startDate: '09/2023',
          endDate: 'Hiện tại',
          description: ['Viết bài cho fanpage', 'Hỗ trợ tổ chức sự kiện'],
          skillsMentioned: ['Content Writing', 'Social Media'],
          achievementsMentioned: [],
          source: 'cv_extracted',
        },
      ],
      internships: [],
      projects: [
        {
          name: 'Đồ án môn học: Kế hoạch Truyền thông IMC',
          role: 'Trưởng nhóm nội dung',
          description: ['Nghiên cứu đối thủ', 'Lên kế hoạch bài đăng'],
          skillsMentioned: ['Kế hoạch truyền thông', 'Canva'],
          resultsMentioned: ['Đạt điểm A'],
          source: 'cv_extracted',
        },
      ],
      activities: [],
      skills: [
        { name: 'Canva', category: 'Công cụ', evidence: 'Liệt kê trong mục Kỹ năng', source: 'cv_extracted' },
        { name: 'Meta Business Suite', category: 'Công cụ', evidence: 'Liệt kê trong mục Kỹ năng', source: 'cv_extracted' },
        { name: 'Làm việc nhóm', category: 'Kỹ năng mềm', evidence: 'Liệt kê trong mục Kỹ năng', source: 'cv_extracted' },
      ],
      certifications: [],
      languages: ['Tiếng Việt (Bản ngữ)', 'Tiếng Anh (Giao tiếp)'],
      achievements: [],
      extractedKeywords: ['Marketing', 'Canva', 'Truyền thông'],
      confidence: {
        overall: 0.95,
        candidateName: 0.98,
        education: 0.95,
        experience: 0.9,
        skills: 0.95,
      },
      missingInformation: [],
    };

    setExtractedCV(sampleCV);
    setVerifiedCV(sampleCV);
    setCurrentSession({
      id: crypto.randomUUID(),
      fileName,
      fileSize: 312000,
      uploadedAt,
      status: 'cv_parsed',
      extractedCV: sampleCV,
      targetJobId: currentTargetJob.id,
      targetJobTitle: currentTargetJob.title,
      targetCompany: currentTargetJob.company,
    });
  };

  const handleResetSession = () => {
    setCurrentSession(null);
    setExtractedCV(null);
    setVerifiedCV(null);
    setParsedJD(null);
    setMatchResult(null);
    setSuggestions(null);
    setGeminiError(null);
    setIsRealCvMode(false);
  };

  // Grouped Match Items (Section XIII & XVII)
  const matchedSkills = useMemo(() => {
    return matchResult?.matchItems.filter((i) => i.status === 'matched') || [];
  }, [matchResult]);

  const partialSkills = useMemo(() => {
    return (
      matchResult?.matchItems.filter(
        (i) => i.status === 'partial' || i.status === 'uncertain'
      ) || []
    );
  }, [matchResult]);

  const notFoundSkills = useMemo(() => {
    return matchResult?.matchItems.filter((i) => i.status === 'not_found') || [];
  }, [matchResult]);

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-8 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast Notification */}
      {copiedNotification && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{copiedNotification}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-full border border-purple-100 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              Gemini 3.8 Flash CV Intelligence
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-semibold rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Vị trí tuyển dụng: {currentTargetJob.title} • {currentTargetJob.company}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#131B2E] tracking-tight">
            Phân tích & Tối ưu hóa CV với Gemini
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Quy trình chuẩn: Đọc file PDF thực tế → Trích xuất CV JSON → Người dùng xác nhận dữ liệu → Đối chiếu yêu cầu JD → Tính điểm theo trọng số chuẩn xác.
          </p>
        </div>

      </div>

      {/* Gemini Error Alert Banner (Section XX: Báo lỗi trung thực) */}
      {geminiError && (
        <div className="p-5 rounded-2xl bg-red-50/90 border border-red-200 text-red-900 flex items-start gap-3.5 shadow-sm animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-extrabold text-sm text-red-900">
              Không thể phân tích CV bằng Gemini
            </h4>
            <p className="text-xs text-red-700 leading-relaxed font-medium">
              {geminiError}
            </p>
            <p className="text-[11px] text-red-500 pt-0.5">
              Hệ thống tuyệt đối không dùng dữ liệu giả lập (mock data) khi tải CV thật. Vui lòng kiểm tra lại file PDF hoặc biến môi trường GEMINI_API_KEY.
            </p>
          </div>
        </div>
      )}

      {/* SECTION 1: KHU VỰC TẢI FILE CV LÊN (FILE UPLOAD AREA) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#131B2E] flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-purple-600" />
              <span>Tải file CV lên</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Hỗ trợ định dạng <strong>PDF</strong> (MIME: application/pdf, tối đa 10MB)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleUseSampleCv}
              className="text-xs font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer border border-purple-200"
            >
              Dùng CV mẫu sinh viên PTIT (Demo)
            </button>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileUpload(e.target.files[0]);
            }
          }}
          accept="application/pdf,.pdf"
          className="hidden"
        />

        {currentSession ? (
          /* Active CV Session Card */
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-purple-50/50 via-slate-50 to-indigo-50/30 border border-purple-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-[#131B2E] text-sm sm:text-base break-all">
                      {currentSession.fileName}
                    </h4>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md ${
                        currentSession.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : currentSession.status === 'error'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {currentSession.status === 'completed'
                        ? 'Đã đối chiếu JD'
                        : currentSession.status === 'cv_parsed'
                        ? 'Đã đọc CV'
                        : currentSession.status === 'user_verified'
                        ? 'Đã xác nhận'
                        : 'Đang xử lý'}
                    </span>
                    {isRealCvMode && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-extrabold rounded-md">
                        REAL_CV_MODE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tải lên lúc: {currentSession.uploadedAt} • Session: {currentSession.id.slice(0, 8)}...
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 bg-white hover:bg-slate-50 text-purple-700 border border-purple-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Tải CV mới</span>
                </button>

                <button
                  onClick={handleResetSession}
                  title="Xóa phiên làm việc"
                  className="p-2 bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 hover:border-red-200 rounded-xl transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* SECTION VII: HIỂN THỊ DỮ LIỆU CV ĐÃ ĐỌC (Trích xuất nguyên bản, không bịa đặt) */}
            {extractedCV && (
              <div className="pt-4 border-t border-purple-200/70 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-purple-950">
                      AI đã đọc CV thành công
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsVerificationModalOpen(true)}
                      className="px-3 py-1.5 bg-white hover:bg-purple-50 text-purple-800 border border-purple-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-purple-600" />
                      <span>Kiểm tra / Chỉnh sửa thông tin CV</span>
                    </button>

                    {!matchResult && (
                      <button
                        onClick={handleRunMatching}
                        disabled={isProcessing}
                        className="px-4 py-1.5 bg-[#B90013] hover:bg-[#A30010] text-white text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Tiếp tục phân tích JD</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 8 Field Summary Grid (Section VII) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Họ tên:</span>
                    <span className="font-extrabold text-[#131B2E] truncate block">
                      {verifiedCV?.candidate?.fullName || extractedCV.candidate?.fullName || (
                        <span className="text-slate-400 italic">AI không tìm thấy họ tên</span>
                      )}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Email:</span>
                    <span className="font-medium text-slate-700 truncate block">
                      {verifiedCV?.candidate?.email || extractedCV.candidate?.email || (
                        <span className="text-slate-400 italic">Không tìm thấy</span>
                      )}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Trường đại học:</span>
                    <span className="font-medium text-slate-700 truncate block">
                      {verifiedCV?.education?.[0]?.school || extractedCV.education?.[0]?.school || (
                        <span className="text-slate-400 italic">Không tìm thấy</span>
                      )}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Ngành học:</span>
                    <span className="font-medium text-slate-700 truncate block">
                      {verifiedCV?.education?.[0]?.major || extractedCV.education?.[0]?.major || (
                        <span className="text-slate-400 italic">Không tìm thấy</span>
                      )}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Kinh nghiệm:</span>
                    <span className="font-bold text-purple-700">
                      {extractedCV.workExperience?.length || 0} mục
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Dự án:</span>
                    <span className="font-bold text-purple-700">
                      {extractedCV.projects?.length || 0} mục
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Kỹ năng:</span>
                    <span className="font-bold text-purple-700">
                      {verifiedCV?.skills?.length || extractedCV.skills?.length || 0} kỹ năng
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Chứng chỉ:</span>
                    <span className="font-bold text-purple-700">
                      {extractedCV.certifications?.length || 0} chứng chỉ
                    </span>
                  </div>
                </div>

                {/* Skill Pills */}
                {extractedCV.skills && extractedCV.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-[11px] font-bold text-slate-400 mr-1">Kỹ năng trích xuất:</span>
                    {extractedCV.skills.map((sk, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold rounded-md transition-colors"
                        title={sk.evidence}
                      >
                        {sk.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Dropzone Placeholder */
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`p-8 sm:p-12 rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
              isDragging
                ? 'border-purple-500 bg-purple-50/50 scale-[0.99]'
                : 'border-slate-300 hover:border-purple-400 bg-slate-50/50 hover:bg-purple-50/20'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4 shadow-sm">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-base sm:text-lg text-[#131B2E]">
              Kéo thả file CV PDF vào đây, hoặc <span className="text-purple-600 underline">chọn tệp từ máy tính</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Chỉ chấp nhận file định dạng PDF (Dung lượng tối đa 10MB)
            </p>
          </div>
        )}
      </div>

      {/* LOADING STATE INDICATOR (Section XXI) */}
      {isProcessing && (
        <div className="bg-white rounded-3xl p-8 border border-purple-200/80 shadow-sm text-center space-y-3 animate-fade-in">
          <div className="inline-flex p-3 rounded-2xl bg-purple-50 text-purple-700 animate-spin">
            <RefreshCw className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#131B2E]">
            {loadingStepText || 'AI đang xử lý...'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Hệ thống đang gọi Gemini đọc văn bản thực tế từ file PDF và chuẩn hóa dữ liệu theo cấu trúc.
          </p>
        </div>
      )}

      {/* SECTION 2: MATCH RESULT & SUGGESTIONS (Section XI, XVI, XVII) */}
      {matchResult && (
        <div className="space-y-6">
          {/* HERO SCORE CARD - NO 45% -> 88% PREDICTION (Section XVI) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Score breakdown (5 cols) */}
              <div className="lg:col-span-5 p-5 rounded-2xl bg-gradient-to-br from-purple-50/80 via-white to-indigo-50/40 border border-purple-100 space-y-3">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-900 block">
                  ĐỘ KHỚP HIỆN TẠI (CV vs JD)
                </span>

                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-black text-purple-800">
                    {matchResult.overallMatch}%
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    trên thang điểm 100%
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Có thể cải thiện mức độ thể hiện phù hợp bằng cách làm rõ các kinh nghiệm và kỹ năng đã có.
                </p>

                {/* Weighted Breakdown Bars (Section XI) */}
                <div className="pt-2 border-t border-purple-100 space-y-2 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    Điểm thành phần theo trọng số chuẩn:
                  </span>

                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Kỹ năng bắt buộc (40%):</span>
                      <span className="font-bold text-purple-700">
                        {matchResult.breakdown.requiredSkills}/40 đ
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Kinh nghiệm thực tế (25%):</span>
                      <span className="font-bold text-purple-700">
                        {matchResult.breakdown.experience}/25 đ
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Sự phù hợp trách nhiệm (15%):</span>
                      <span className="font-bold text-purple-700">
                        {matchResult.breakdown.responsibilities}/15 đ
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Học vấn & Chuyên ngành (10%):</span>
                      <span className="font-bold text-purple-700">
                        {matchResult.breakdown.education}/10 đ
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Kỹ năng ưu tiên & Công cụ (10%):</span>
                      <span className="font-bold text-purple-700">
                        {matchResult.breakdown.preferredSkills + matchResult.breakdown.keywordsAndTools}/10 đ
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary & Principles (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 text-[11px] font-bold rounded-md">
                    Nhận xét từ Gemini
                  </span>
                  <span className="text-xs text-slate-500">
                    Đối chiếu: <strong>{currentTargetJob.title}</strong> ({currentTargetJob.company})
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {matchResult.summary}
                </p>

                {/* Important Disclaimer Notice (Section XVII) */}
                <div className="p-3.5 bg-purple-50/70 rounded-2xl border border-purple-200/80 flex items-start gap-2.5 text-xs text-purple-950 leading-relaxed">
                  <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                  <span>
                    <strong>LƯU Ý QUAN TRỌNG:</strong> AI chỉ đề xuất thay đổi dựa trên thông tin có thật trong CV. Tuyệt đối không tự thêm số liệu, không bịa KPI hay kinh nghiệm ứng viên chưa có.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* TAB SELECTOR */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl overflow-x-auto">
            <button
              onClick={() => setActiveTab('match')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === 'match'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-purple-600" />
              <span>Đối chiếu Kỹ năng CV vs JD ({matchResult.matchItems.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('suggestions')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === 'suggestions'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Gợi ý viết lại trung thực ({suggestions?.bulletImprovements?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('missing')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === 'missing'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <XCircle className="w-3.5 h-3.5 text-red-600" />
              <span>Chưa thể hiện rõ & Cần bổ sung ({notFoundSkills.length + partialSkills.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('strengths')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === 'strengths'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Điểm mạnh đã có ({suggestions?.strengths?.length || 0})</span>
            </button>
          </div>

          {/* TAB 1: MATCH COMPARISON DETAILS (Section XII, XIII, XVII) */}
          {activeTab === 'match' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
              <div>
                <h3 className="font-extrabold text-[#131B2E] text-base sm:text-lg">
                  Bảng đối chiếu yêu cầu tuyển dụng với bằng chứng trong CV
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Phân loại theo 4 trạng thái: <strong>matched</strong> (có bằng chứng rõ ràng), <strong>partial</strong> (đáp ứng một phần), <strong>not_found</strong> (không tìm thấy trong CV).
                </p>
              </div>

              {/* 1. KỸ NĂNG PHÙ HỢP (matched) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-800 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Kỹ năng phù hợp ({matchedSkills.length})</span>
                </div>

                {matchedSkills.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {matchedSkills.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-emerald-50/30 border border-emerald-200/80 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-sm text-[#131B2E]">
                            ✓ {item.requirement}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                            matched
                          </span>
                        </div>
                        {item.evidence ? (
                          <p className="text-xs text-emerald-950 bg-white/90 p-2.5 rounded-xl border border-emerald-100 italic">
                            Bằng chứng trong CV: "{item.evidence}"
                          </p>
                        ) : (
                          <p className="text-[11px] text-slate-500">Được đề cập trong nội dung CV</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Không tìm thấy yêu cầu khớp hoàn toàn.</p>
                )}
              </div>

              {/* 2. CHƯA THỂ HIỆN RÕ (partial / uncertain) */}
              {partialSkills.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-amber-800 uppercase tracking-wider">
                    <HelpCircle className="w-4 h-4 text-amber-600" />
                    <span>Chưa thể hiện rõ ({partialSkills.length})</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {partialSkills.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-[#131B2E]">
                            △ {item.requirement}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-800">
                            {item.status}
                          </span>
                        </div>
                        {item.evidence && (
                          <p className="text-xs text-amber-950 bg-white/90 p-2 rounded-lg italic">
                            "{item.evidence}"
                          </p>
                        )}
                        <p className="text-[11px] text-amber-700">
                          CV có thông tin liên quan nhưng cần làm rõ thêm để đáp ứng đầy đủ yêu cầu JD.
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. CHƯA TÌM THẤY (not_found) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-extrabold text-red-800 uppercase tracking-wider">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span>Chưa tìm thấy trong CV ({notFoundSkills.length})</span>
                </div>

                {notFoundSkills.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {notFoundSkills.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-red-50/30 border border-red-200/80 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-[#131B2E]">
                            × {item.requirement}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-100 text-red-800">
                            not_found
                          </span>
                        </div>
                        <p className="text-[11px] text-red-700">
                          Không tìm thấy bằng chứng trong file PDF. AI không tự ý suy đoán ứng viên có kỹ năng này.
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-600 font-bold">Tất cả các tiêu chí cốt lõi đều được tìm thấy trong CV.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: AI REWRITE SUGGESTIONS (Section XIV & XV: Không bịa đặt số liệu) */}
          {activeTab === 'suggestions' && suggestions && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
              <div>
                <h3 className="font-extrabold text-[#131B2E] text-base sm:text-lg">
                  Gợi ý viết lại câu dựa trên thông tin thực tế đã có trong CV
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tập trung cải thiện động từ hành động và cách trình bày. <strong>Tuyệt đối không tự bịa đặt số liệu, KPI hay thành tích mới.</strong>
                </p>
              </div>

              <div className="space-y-4">
                {suggestions.bulletImprovements.map((b) => (
                  <div
                    key={b.id}
                    className="p-5 rounded-2xl border border-slate-200 hover:border-purple-300 transition-all space-y-3"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-3.5 bg-red-50/40 rounded-xl border border-red-100 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 block">
                          Câu trích xuất từ CV:
                        </span>
                        <p className="text-slate-700 line-through">"{b.original}"</p>
                      </div>

                      <div className="p-3.5 bg-purple-50/60 rounded-xl border border-purple-200 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">
                          AI đề xuất viết lại (Trung thực, không bịa KPI):
                        </span>
                        <p className="text-slate-900 font-bold">"{b.improved}"</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-500 text-[11px] italic">
                        {b.reason}
                      </span>
                      <button
                        onClick={() => handleCopyText(b.improved, 'câu viết lại')}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Sao chép câu</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: MISSING & TO ACQUIRE (Section XIV) */}
          {activeTab === 'missing' && suggestions && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
              <div>
                <h3 className="font-extrabold text-[#131B2E] text-base sm:text-lg">
                  Kỹ năng JD yêu cầu nhưng CV chưa thể hiện
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Đây là các tiêu chí JD yêu cầu nhưng chưa tìm thấy bằng chứng trong CV. Không được biến thành kỹ năng hiện tại nếu bạn chưa thực hành.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestions.skillsToAcquire.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2"
                  >
                    <span className="font-extrabold text-sm text-[#131B2E] block">
                      {item.skill}
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.note}
                    </p>
                  </div>
                ))}
              </div>

              {suggestions.missingElements && suggestions.missingElements.length > 0 && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                    Nội dung đang thiếu và lời khuyên bổ sung:
                  </h4>
                  <div className="space-y-2 text-xs">
                    {suggestions.missingElements.map((m, idx) => (
                      <div key={idx} className="p-3 bg-red-50/40 rounded-xl border border-red-100">
                        <strong className="text-red-900 block">{m.requirement}</strong>
                        <p className="text-slate-600 mt-0.5">{m.advice}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: STRENGTHS (Section XIV) */}
          {activeTab === 'strengths' && suggestions && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
              <div>
                <h3 className="font-extrabold text-[#131B2E] text-base sm:text-lg">
                  Điểm mạnh đã được ghi nhận trong CV
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chỉ sử dụng thông tin thực tế xuất hiện trong file CV PDF đã tải lên.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestions.strengths.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-purple-50/40 border border-purple-200/80 space-y-2"
                  >
                    <h4 className="font-extrabold text-sm text-purple-950">{s.title}</h4>
                    {s.evidence && (
                      <p className="text-xs text-purple-900 bg-white/90 p-2 rounded-lg italic">
                        Dẫn chứng: "{s.evidence}"
                      </p>
                    )}
                    <p className="text-xs text-slate-600 leading-relaxed">{s.impact}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION VIII: MODAL CV VERIFICATION */}
      {isVerificationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-6 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-extrabold text-[#131B2E]">
                  Kiểm tra & Xác nhận thông tin CV
                </h3>
                <p className="text-xs text-slate-500">
                  Dữ liệu do bạn chỉnh sửa sẽ được đánh dấu <strong>source = "user_verified"</strong>.
                </p>
              </div>
              <button
                onClick={() => setIsVerificationModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVerification} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Họ và tên ứng viên:</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  placeholder="Ví dụ: Vũ Ngọc Linh"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 outline-hidden font-medium text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email:</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="email@student.ptit.edu.vn"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 outline-hidden font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Số điện thoại:</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="0987.xxx.xxx"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Trường đại học:</label>
                  <input
                    type="text"
                    value={editSchool}
                    onChange={(e) => setEditSchool(e.target.value)}
                    placeholder="Học viện Công nghệ Bưu chính Viễn thông"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 outline-hidden font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Chuyên ngành đào tạo:</label>
                  <input
                    type="text"
                    value={editMajor}
                    onChange={(e) => setEditMajor(e.target.value)}
                    placeholder="Marketing & Truyền thông số"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Danh sách kỹ năng (phân tách bởi dấu phẩy):
                </label>
                <textarea
                  rows={3}
                  value={editSkillsText}
                  onChange={(e) => setEditSkillsText(e.target.value)}
                  placeholder="Canva, Content Writing, Google Analytics..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 outline-hidden font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsVerificationModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Lưu xác nhận (user_verified)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
