import React, { useState, useEffect } from 'react';
import { FirestoreJob, CareerTendencyCode } from '../../types';
import {
  loadAllJobsFromStorage,
  adminSaveJob,
  adminToggleJobStatus,
  adminVerifyJob,
  adminDeleteJob,
  adminMarkExpired,
  getJobInteractions,
  isJobExpired,
} from '../../services/jobs/jobService';
import { analyzeJdWithAI } from '../../services/jobs/aiJobAnalyzer';
import {
  Briefcase,
  Search,
  Plus,
  Building2,
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  Sparkles,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AdminJobsTabProps {
  showToast?: (message: string) => void;
  onRefreshStats?: () => void;
}

export const AdminJobsTab: React.FC<AdminJobsTabProps> = ({ showToast, onRefreshStats }) => {
  const [adminJobs, setAdminJobs] = useState<FirestoreJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobSearchTerm, setJobSearchTerm] = useState('');
  const [jobStatusFilter, setJobStatusFilter] = useState<'all' | 'active' | 'expired' | 'hidden'>('all');
  const [jobCareerCategoryFilter, setJobCareerCategoryFilter] = useState<string>('all');
  const [jobEmploymentTypeFilter, setJobEmploymentTypeFilter] = useState<string>('all');
  const [jobLocationFilter, setJobLocationFilter] = useState<string>('all');
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<FirestoreJob | null>(null);
  const [jobFormError, setJobFormError] = useState<string | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formCompanyName, setFormCompanyName] = useState('');
  const [formCompanyLogo, setFormCompanyLogo] = useState('');
  const [formLocation, setFormLocation] = useState('Hà Nội');
  const [formEmploymentType, setFormEmploymentType] = useState<'Internship' | 'Full-time' | 'Part-time' | 'Trainee' | 'Freelance'>('Internship');
  const [formSalaryText, setFormSalaryText] = useState('3.000.000 – 5.000.000 VNĐ/tháng');
  const [formDescription, setFormDescription] = useState('');
  const [formRequirements, setFormRequirements] = useState('');
  const [formBenefits, setFormBenefits] = useState('');
  const [formMajorTags, setFormMajorTags] = useState('Marketing & Truyền thông số, Kinh tế số');
  const [formSkillTags, setFormSkillTags] = useState('Content Creation, Social Media, Canva');
  const [formTendencies, setFormTendencies] = useState<CareerTendencyCode[]>(['CR', 'AN']);
  const [formAcademicYears, setFormAcademicYears] = useState<string[]>(['Năm 2', 'Năm 3', 'Năm 4']);
  const [formCareerCategory, setFormCareerCategory] = useState('Marketing');
  const [formSourceName, setFormSourceName] = useState('');
  const [formSourceUrl, setFormSourceUrl] = useState('');
  const [formApplyUrl, setFormApplyUrl] = useState('');
  const [formPublishedAt, setFormPublishedAt] = useState('2026-03-01');
  const [formExpiresAt, setFormExpiresAt] = useState('2026-11-30');
  const [formVerified, setFormVerified] = useState(true);
  const [formStatus, setFormStatus] = useState<'active' | 'expired' | 'hidden'>('active');
  const [formIsDemo, setFormIsDemo] = useState(false);

  // AI JD Analysis & Preview Modal State
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);
  const [aiAnalysisFeedback, setAiAnalysisFeedback] = useState<string | null>(null);
  const [previewJob, setPreviewJob] = useState<FirestoreJob | null>(null);

  const refreshJobsList = () => {
    try {
      setLoading(true);
      const jobs = loadAllJobsFromStorage();
      setAdminJobs(jobs);
      if (onRefreshStats) onRefreshStats();
    } catch (err) {
      console.warn('Error loading jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshJobsList();
  }, []);

  const triggerToast = (msg: string) => {
    if (showToast) {
      showToast(msg);
    }
  };

  const handleAnalyzeJdWithAi = async () => {
    const content = `${formDescription}\n\n${formRequirements}`.trim();
    if (!content) {
      setJobFormError('Vui lòng nhập nội dung mô tả hoặc yêu cầu công việc để AI có dữ liệu phân tích.');
      return;
    }
    setIsAnalyzingAi(true);
    setJobFormError(null);
    setAiAnalysisFeedback(null);
    try {
      const result = await analyzeJdWithAI(content);
      if (result.majorTags && result.majorTags.length > 0) {
        setFormMajorTags(result.majorTags.join(', '));
      }
      if (result.skillTags && result.skillTags.length > 0) {
        setFormSkillTags(result.skillTags.join(', '));
      }
      if (result.careerTendencies && result.careerTendencies.length > 0) {
        setFormTendencies(result.careerTendencies);
      }
      if (result.suitableAcademicYears && result.suitableAcademicYears.length > 0) {
        setFormAcademicYears(result.suitableAcademicYears);
      }
      if (result.careerCategory) {
        setFormCareerCategory(result.careerCategory);
      }
      setAiAnalysisFeedback(
        `Đã tự động trích xuất theo khung đào tạo PTIT (${result.source === 'gemini' ? 'Gemini 2.5 Flash' : 'Deterministic Engine'}). Bạn có thể tùy chỉnh lại trước khi lưu.`
      );
    } catch (err: any) {
      setJobFormError(err.message || 'Không thể phân tích JD bằng AI. Vui lòng điền thông tin thủ công.');
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  const handleSaveJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setJobFormError('Vui lòng nhập Tên vị trí (Job Title).');
      return;
    }
    if (!formCompanyName.trim()) {
      setJobFormError('Vui lòng nhập Tên công ty / doanh nghiệp.');
      return;
    }
    if (!formApplyUrl.trim()) {
      setJobFormError('Vui lòng nhập Đường dẫn ứng tuyển (Apply URL).');
      return;
    }
    if (!formSourceUrl.trim()) {
      setJobFormError('Vui lòng nhập Đường dẫn tin gốc (Source URL).');
      return;
    }
    if (!formDescription.trim()) {
      setJobFormError('Vui lòng nhập Nội dung mô tả công việc.');
      return;
    }

    const payload: Partial<FirestoreJob> = {
      title: formTitle.trim(),
      companyName: formCompanyName.trim(),
      companyLogo: formCompanyLogo.trim() || undefined,
      location: formLocation.trim() || 'Hà Nội',
      employmentType: formEmploymentType,
      salaryText: formSalaryText.trim() || 'Thỏa thuận',
      description: formDescription.trim(),
      requirements: formRequirements
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      benefits: formBenefits
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      majorTags: formMajorTags
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      skillTags: formSkillTags
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      careerTendencies: formTendencies,
      suitableAcademicYears: formAcademicYears,
      careerCategory: formCareerCategory,
      sourceName: formSourceName.trim() || formCompanyName.trim(),
      sourceUrl: formSourceUrl.trim(),
      applyUrl: formApplyUrl.trim(),
      publishedAt: formPublishedAt || new Date().toISOString().split('T')[0],
      expiresAt: formExpiresAt || '2026-12-31',
      verified: formVerified,
      status: formStatus,
      isDemo: formIsDemo,
      id: editingJob?.id || '',
    };

    try {
      const res = await adminSaveJob(payload as FirestoreJob);
      if (!res.success) {
        setJobFormError(res.error || 'Lỗi khi lưu việc làm vào hệ thống.');
        return;
      }
      setIsJobModalOpen(false);
      setEditingJob(null);
      refreshJobsList();
      triggerToast(editingJob ? 'Đã cập nhật việc làm thành công!' : 'Đã đăng tin việc làm mới thành công!');
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
    } catch (err: any) {
      setJobFormError(err.message || 'Lỗi khi lưu việc làm vào hệ thống.');
    }
  };

  const filteredJobs = adminJobs.filter((job) => {
    const matchesSearch =
      !jobSearchTerm.trim() ||
      job.title.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
      job.companyName.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(jobSearchTerm.toLowerCase());

    const isExp = isJobExpired(job);
    const matchesStatus =
      jobStatusFilter === 'all' ||
      (jobStatusFilter === 'active' && job.status === 'active' && !isExp) ||
      (jobStatusFilter === 'expired' && (job.status === 'expired' || isExp)) ||
      (jobStatusFilter === 'hidden' && job.status === 'hidden');

    const matchesCategory =
      jobCareerCategoryFilter === 'all' || job.careerCategory === jobCareerCategoryFilter;

    const matchesType =
      jobEmploymentTypeFilter === 'all' || job.employmentType === jobEmploymentTypeFilter;

    const matchesLocation =
      jobLocationFilter === 'all' || job.location.includes(jobLocationFilter);

    return matchesSearch && matchesStatus && matchesCategory && matchesType && matchesLocation;
  });

  return (
    <div className="space-y-5">
      {/* Header & Stats Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-[#131B2E] text-lg flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#B90013]" />
              <span>Quản lý Tin Tuyển dụng & Cơ hội Thực tập</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Hệ thống quản trị việc làm thực tế dành cho sinh viên PTIT. Hỗ trợ thêm mới, xác minh, cập nhật link ứng tuyển trực tiếp và phân tích tương tác.
            </p>
          </div>
          <button
            id="btn-admin-add-job"
            onClick={() => {
              setEditingJob(null);
              setFormTitle('');
              setFormCompanyName('');
              setFormCompanyLogo('');
              setFormLocation('Hà Nội');
              setFormEmploymentType('Internship');
              setFormSalaryText('4.000.000 – 6.000.000 VNĐ/tháng');
              setFormDescription('');
              setFormRequirements('Sinh viên năm 3, 4 hoặc mới tốt nghiệp khối ngành Kinh tế / CNTT PTIT.\nKỹ năng làm việc nhóm tốt, chủ động.');
              setFormBenefits('Phụ cấp thực tập cạnh tranh.\nCung cấp dấu mộc thực tập chuẩn.');
              setFormMajorTags('Marketing & Truyền thông số, Kinh tế số');
              setFormSkillTags('Social Media, Canva, Content Planning');
              setFormTendencies(['CR', 'AN']);
              setFormAcademicYears(['Năm 3', 'Năm 4']);
              setFormCareerCategory('Marketing');
              setFormSourceName('Cổng Tuyển dụng Doanh nghiệp');
              setFormSourceUrl('https://');
              setFormApplyUrl('https://');
              setFormPublishedAt(new Date().toISOString().split('T')[0]);
              setFormExpiresAt('2026-12-31');
              setFormVerified(true);
              setFormStatus('active');
              setFormIsDemo(false);
              setJobFormError(null);
              setIsJobModalOpen(true);
            }}
            className="px-4 py-2.5 bg-[#B90013] hover:bg-[#A30010] text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Thêm việc làm</span>
          </button>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-500 text-[11px] block font-bold">Tổng JD trong hệ thống</span>
            <span className="text-xl font-extrabold text-slate-900">{adminJobs.length}</span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
            <span className="text-emerald-700 text-[11px] block font-bold">Đang hiển thị tuyển (Active)</span>
            <span className="text-xl font-extrabold text-emerald-800">
              {adminJobs.filter((j) => j.status === 'active' && !isJobExpired(j)).length}
            </span>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
            <span className="text-blue-700 text-[11px] block font-bold">Đã xác minh (Verified)</span>
            <span className="text-xl font-extrabold text-blue-800">
              {adminJobs.filter((j) => j.verified).length}
            </span>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
            <span className="text-amber-700 text-[11px] block font-bold">Hết hạn / Ẩn (Expired / Hidden)</span>
            <span className="text-xl font-extrabold text-amber-800">
              {adminJobs.filter((j) => j.status === 'hidden' || isJobExpired(j)).length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={jobSearchTerm}
              onChange={(e) => setJobSearchTerm(e.target.value)}
              placeholder="Tìm theo tên công việc, doanh nghiệp, địa điểm..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#B90013]"
            />
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <select
              value={jobStatusFilter}
              onChange={(e) => setJobStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:border-[#B90013]"
            >
              <option value="all">Trạng thái: Tất cả</option>
              <option value="active">Đang tuyển (Active)</option>
              <option value="expired">Hết hạn (Expired)</option>
              <option value="hidden">Đã ẩn (Hidden)</option>
            </select>

            <select
              value={jobCareerCategoryFilter}
              onChange={(e) => setJobCareerCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:border-[#B90013]"
            >
              <option value="all">Ngành: Tất cả</option>
              <option value="Marketing">Marketing</option>
              <option value="E-commerce">Thương mại điện tử</option>
              <option value="Data">Dữ liệu & Phân tích</option>
              <option value="Business">Kinh doanh / Sales</option>
              <option value="Fintech">Tài chính & Fintech</option>
            </select>

            <select
              value={jobEmploymentTypeFilter}
              onChange={(e) => setJobEmploymentTypeFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:border-[#B90013]"
            >
              <option value="all">Loại hình: Tất cả</option>
              <option value="Internship">Thực tập (Internship)</option>
              <option value="Full-time">Toàn thời gian (Full-time)</option>
              <option value="Part-time">Bán thời gian (Part-time)</option>
              <option value="Trainee">Tập sự (Trainee)</option>
            </select>

            <select
              value={jobLocationFilter}
              onChange={(e) => setJobLocationFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:border-[#B90013]"
            >
              <option value="all">Địa điểm: Tất cả</option>
              <option value="Hà Nội">Hà Nội</option>
              <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
              <option value="Hybrid">Hybrid / Linh hoạt</option>
              <option value="Remote">Remote</option>
            </select>

            {(jobSearchTerm || jobStatusFilter !== 'all' || jobCareerCategoryFilter !== 'all' || jobEmploymentTypeFilter !== 'all' || jobLocationFilter !== 'all') && (
              <button
                onClick={() => {
                  setJobSearchTerm('');
                  setJobStatusFilter('all');
                  setJobCareerCategoryFilter('all');
                  setJobEmploymentTypeFilter('all');
                  setJobLocationFilter('all');
                }}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl flex items-center gap-1 font-semibold cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Đặt lại lọc</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800">
            Hiển thị {filteredJobs.length} / {adminJobs.length} vị trí tuyển dụng
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200">
                <th className="py-3 px-4">Vị trí & Doanh nghiệp</th>
                <th className="py-3 px-4">Địa điểm & Loại hình</th>
                <th className="py-3 px-4">Mức lương</th>
                <th className="py-3 px-4">Ngành / Chuyên ngành</th>
                <th className="py-3 px-4">Hạn nộp</th>
                <th className="py-3 px-4 text-center">Tương tác</th>
                <th className="py-3 px-4 text-center">Xác minh</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Chưa có dữ liệu việc làm phù hợp với tiêu chí lọc.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => {
                  const allInteractions = getJobInteractions();
                  const jobInteractions = allInteractions.filter((i) => i.jobId === job.id);
                  const views = jobInteractions.filter((i) => i.action === 'view').length;
                  const applies = jobInteractions.filter((i) => i.action === 'click_apply').length;
                  const expired = isJobExpired(job);
                  return (
                    <tr key={job.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* 1. Vị trí & Doanh nghiệp */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-2.5">
                          {job.companyLogo ? (
                            <img
                              src={job.companyLogo}
                              alt={job.companyName}
                              className="w-8 h-8 rounded-lg object-contain bg-white border border-slate-100 p-0.5 shrink-0"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs shrink-0">
                              <Building2 className="w-4 h-4" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900 text-[13px] flex items-center gap-1.5">
                              <span>{job.title}</span>
                              {job.isDemo && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                  Demo
                                </span>
                              )}
                            </div>
                            <span className="text-slate-500 text-xs font-semibold block">{job.companyName}</span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Địa điểm & Loại hình */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="text-slate-800 font-medium block flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{job.location}</span>
                          </span>
                          <span className="text-slate-500 text-[11px] block">{job.employmentType}</span>
                        </div>
                      </td>

                      {/* 3. Mức lương */}
                      <td className="py-3.5 px-4">
                        <span className="text-emerald-700 font-bold whitespace-nowrap">{job.salaryText}</span>
                      </td>

                      {/* 4. Ngành / Chuyên ngành */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-[#B90013] border border-red-100 inline-block">
                            {job.careerCategory}
                          </span>
                          <span className="text-slate-500 text-[11px] block truncate max-w-[140px]" title={job.majorTags.join(', ')}>
                            {job.majorTags.slice(0, 2).join(', ')}
                          </span>
                        </div>
                      </td>

                      {/* 5. Hạn nộp */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`font-semibold ${expired ? 'text-red-600' : 'text-slate-700'}`}>
                          {job.expiresAt}
                        </span>
                        {expired && (
                          <span className="text-[10px] text-red-500 block font-bold">Hết hạn nộp</span>
                        )}
                      </td>

                      {/* 6. Tương tác */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="text-slate-700 font-medium text-[11px]">
                          <div><strong className="text-slate-900">{views}</strong> xem</div>
                          <div><strong className="text-emerald-700">{applies}</strong> apply</div>
                        </div>
                      </td>

                      {/* 7. Xác minh */}
                      <td className="py-3.5 px-4 text-center">
                        {job.verified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Đã duyệt</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                            Chưa duyệt
                          </span>
                        )}
                      </td>

                      {/* 8. Trạng thái */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {job.status === 'hidden' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                            Đã ẩn
                          </span>
                        ) : expired || job.status === 'expired' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Hết hạn
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Đang tuyển
                          </span>
                        )}
                      </td>

                      {/* 9. Thao tác */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Xem (Preview Modal) */}
                          <button
                            onClick={() => setPreviewJob(job)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Xem trước việc làm (Preview)"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Sửa */}
                          <button
                            onClick={() => {
                              setEditingJob(job);
                              setFormTitle(job.title);
                              setFormCompanyName(job.companyName);
                              setFormCompanyLogo(job.companyLogo || '');
                              setFormLocation(job.location);
                              setFormEmploymentType(job.employmentType);
                              setFormSalaryText(job.salaryText);
                              setFormDescription(job.description);
                              setFormRequirements(job.requirements.join('\n'));
                              setFormBenefits(job.benefits.join('\n'));
                              setFormMajorTags(job.majorTags.join(', '));
                              setFormSkillTags(job.skillTags.join(', '));
                              setFormTendencies(job.careerTendencies);
                              setFormAcademicYears(job.suitableAcademicYears);
                              setFormCareerCategory(job.careerCategory);
                              setFormSourceName(job.sourceName);
                              setFormSourceUrl(job.sourceUrl);
                              setFormApplyUrl(job.applyUrl);
                              setFormPublishedAt(job.publishedAt);
                              setFormExpiresAt(job.expiresAt);
                              setFormVerified(job.verified);
                              setFormStatus(job.status);
                              setFormIsDemo(!!job.isDemo);
                              setJobFormError(null);
                              setAiAnalysisFeedback(null);
                              setIsJobModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#B90013] hover:bg-red-50 transition-colors cursor-pointer"
                            title="Chỉnh sửa việc làm"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Ẩn / Hiện */}
                          <button
                            onClick={async () => {
                              const nextStatus = job.status === 'hidden' ? 'active' : 'hidden';
                              await adminToggleJobStatus(job.id, nextStatus);
                              refreshJobsList();
                              triggerToast(`Đã ${nextStatus === 'hidden' ? 'ẩn' : 'kích hoạt lại'} việc làm!`);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                            title={job.status === 'hidden' ? 'Hiện việc làm' : 'Ẩn việc làm'}
                          >
                            {job.status === 'hidden' ? (
                              <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                            ) : (
                              <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </button>

                          {/* Xác minh */}
                          <button
                            onClick={async () => {
                              await adminVerifyJob(job.id, !job.verified);
                              refreshJobsList();
                              triggerToast(`Đã ${!job.verified ? 'xác minh' : 'bỏ xác minh'} việc làm!`);
                            }}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              job.verified
                                ? 'text-emerald-600 hover:bg-emerald-50'
                                : 'text-slate-400 hover:text-emerald-600 hover:bg-slate-100'
                            }`}
                            title={job.verified ? 'Bỏ xác minh' : 'Xác minh việc làm'}
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </button>

                          {/* Đánh dấu hết hạn */}
                          <button
                            onClick={async () => {
                              if (job.status === 'expired') {
                                triggerToast('Việc làm này đã hết hạn rồi.');
                                return;
                              }
                              await adminMarkExpired(job.id);
                              refreshJobsList();
                              triggerToast('Đã đánh dấu việc làm hết hạn!');
                            }}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              job.status === 'expired' || expired
                                ? 'text-red-500 bg-red-50'
                                : 'text-slate-400 hover:text-amber-700 hover:bg-amber-50'
                            }`}
                            title="Đánh dấu hết hạn"
                          >
                            <Clock className="w-3.5 h-3.5" />
                          </button>

                          {/* Xóa */}
                          <button
                            onClick={async () => {
                              if (window.confirm(`Bạn có chắc muốn xóa việc làm "${job.title}" không?`)) {
                                await adminDeleteJob(job.id);
                                refreshJobsList();
                                triggerToast('Đã xóa việc làm thành công!');
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Xóa việc làm"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD / EDIT JOB (ADMIN) */}
      {isJobModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-[#B90013] flex items-center justify-center font-bold">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#131B2E]">
                    {editingJob ? 'Chỉnh sửa tin tuyển dụng' : 'Đăng tin việc làm mới cho PTIT'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cung cấp link apply thật và thông tin kiểm chứng cho sinh viên.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsJobModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {jobFormError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{jobFormError}</span>
              </div>
            )}

            {aiAnalysisFeedback && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{aiAnalysisFeedback}</span>
              </div>
            )}

            <form onSubmit={handleSaveJobSubmit} className="space-y-4 text-xs">
              {/* 1. Tên vị trí & Công ty */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">
                    Tên vị trí tuyển dụng (Job Title) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="VD: Thực tập sinh Digital Marketing"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-[#B90013]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">
                    Tên công ty / Doanh nghiệp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formCompanyName}
                    onChange={(e) => setFormCompanyName(e.target.value)}
                    placeholder="VD: Tập đoàn Công nghệ VNPT"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-[#B90013]"
                  />
                </div>
              </div>

              {/* 2. Logo URL & Địa điểm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Logo URL (tùy chọn):</label>
                  <input
                    type="url"
                    value={formCompanyLogo}
                    onChange={(e) => setFormCompanyLogo(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-[#B90013]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Địa điểm làm việc:</label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="Hà Nội / TP. Hồ Chí Minh / Hybrid"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-[#B90013]"
                  />
                </div>
              </div>

              {/* 3. Loại hình & Mức lương */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Loại hình công việc:</label>
                  <select
                    value={formEmploymentType}
                    onChange={(e) => setFormEmploymentType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-[#B90013]"
                  >
                    <option value="Internship">Thực tập (Internship)</option>
                    <option value="Full-time">Toàn thời gian (Full-time)</option>
                    <option value="Part-time">Bán thời gian (Part-time)</option>
                    <option value="Trainee">Tập sự / Trainee</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Mức lương / Trợ cấp:</label>
                  <input
                    type="text"
                    value={formSalaryText}
                    onChange={(e) => setFormSalaryText(e.target.value)}
                    placeholder="VD: 3.000.000 – 5.000.000 VNĐ / Thỏa thuận"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-[#B90013]"
                  />
                </div>
              </div>

              {/* 4. Mô tả công việc */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800">
                    Mô tả công việc (Job Description) <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    disabled={isAnalyzingAi}
                    onClick={handleAnalyzeJdWithAi}
                    className="text-[#B90013] hover:text-[#A30010] font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isAnalyzingAi ? 'Đang phân tích...' : 'AI Phân tích JD & Khớp ngành PTIT'}</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Mô tả chi tiết công việc hàng ngày, dự án tham gia..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-[#B90013]"
                />
              </div>

              {/* 5. Yêu cầu ứng viên */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800">
                  Yêu cầu ứng viên (mỗi yêu cầu trên 1 dòng):
                </label>
                <textarea
                  rows={3}
                  value={formRequirements}
                  onChange={(e) => setFormRequirements(e.target.value)}
                  placeholder="Sinh viên năm 3, năm 4 khối ngành Kinh tế / CNTT&#10;Có kỹ năng phân tích dữ liệu cơ bản&#10;Tinh thần học hỏi cao"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-[#B90013]"
                />
              </div>

              {/* 6. Quyền lợi */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800">
                  Quyền lợi & Đãi ngộ (mỗi quyền lợi trên 1 dòng):
                </label>
                <textarea
                  rows={2}
                  value={formBenefits}
                  onChange={(e) => setFormBenefits(e.target.value)}
                  placeholder="Trợ cấp thực tập hấp dẫn&#10;Được cấp mộc thực tập chuẩn từ doanh nghiệp&#10;Cơ hội trở thành nhân viên chính thức"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-[#B90013]"
                />
              </div>

              {/* PHÂN LOẠI & GẮN TAG THEO PTIT */}
              <div className="pt-2 border-t border-slate-200 space-y-3">
                <h4 className="font-extrabold text-[#131B2E] text-xs uppercase tracking-wider flex items-center gap-1.5 text-slate-700">
                  <Building2 className="w-3.5 h-3.5 text-[#B90013]" />
                  <span>Phân loại & Gắn thẻ chuẩn theo Hệ sinh thái PTIT</span>
                </h4>

                {/* 7. Nhóm ngành & Danh sách chuyên ngành */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">Nhóm định hướng chính:</label>
                    <select
                      value={formCareerCategory}
                      onChange={(e) => setFormCareerCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-[#B90013]"
                    >
                      <option value="Marketing">Marketing & Truyền thông</option>
                      <option value="E-commerce">Thương mại điện tử & Sàn</option>
                      <option value="Data">Dữ liệu & Phân tích kinh doanh</option>
                      <option value="Business">Kinh doanh / B2B Sales</option>
                      <option value="Fintech">Tài chính & Fintech</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">Ngành đào tạo PTIT phù hợp:</label>
                    <input
                      type="text"
                      value={formMajorTags}
                      onChange={(e) => setFormMajorTags(e.target.value)}
                      placeholder="Marketing & Truyền thông số, Kinh tế số, TMĐT"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-[#B90013]"
                    />
                  </div>
                </div>

                {/* 8. Kỹ năng & Xu hướng tính cách */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">Kỹ năng tags (phân cách bằng dấu phẩy):</label>
                    <input
                      type="text"
                      value={formSkillTags}
                      onChange={(e) => setFormSkillTags(e.target.value)}
                      placeholder="Content Creation, Social Media, Google Analytics"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-[#B90013]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">Nhóm xu hướng Career Check phù hợp:</label>
                    <div className="flex items-center gap-3 pt-2">
                      {[
                        { code: 'CR' as CareerTendencyCode, label: 'CR (Sáng tạo)' },
                        { code: 'AN' as CareerTendencyCode, label: 'AN (Phân tích)' },
                        { code: 'OP' as CareerTendencyCode, label: 'OP (Vận hành)' },
                        { code: 'CO' as CareerTendencyCode, label: 'CO (Kinh doanh)' },
                      ].map((t) => (
                        <label key={t.code} className="flex items-center gap-1.5 text-slate-700 cursor-pointer font-bold">
                          <input
                            type="checkbox"
                            checked={formTendencies.includes(t.code)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormTendencies([...formTendencies, t.code]);
                              } else {
                                setFormTendencies(formTendencies.filter((x) => x !== t.code));
                              }
                            }}
                            className="rounded text-[#B90013] focus:ring-[#B90013]"
                          />
                          <span title={t.label}>{t.code}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 9. Năm học phù hợp */}
                <div className="space-y-1.5 pt-1">
                  <label className="font-bold text-slate-800 block">Năm học phù hợp:</label>
                  <div className="flex flex-wrap items-center gap-3">
                    {(['Năm 1', 'Năm 2', 'Năm 3', 'Năm 4', 'Đã tốt nghiệp']).map((yr) => (
                      <label key={yr} className="flex items-center gap-1.5 text-slate-700 cursor-pointer font-bold">
                        <input
                          type="checkbox"
                          checked={formAcademicYears.includes(yr)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormAcademicYears([...formAcademicYears, yr]);
                            } else {
                              setFormAcademicYears(formAcademicYears.filter((x) => x !== yr));
                            }
                          }}
                          className="rounded text-[#B90013] focus:ring-[#B90013]"
                        />
                        <span>{yr}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* NGUỒN VÀ LIÊN KẾT ỨNG TUYỂN THẬT */}
              <div className="pt-2 border-t border-slate-200 space-y-3">
                <h4 className="font-extrabold text-[#131B2E] text-xs uppercase tracking-wider flex items-center gap-1.5 text-slate-700">
                  <ExternalLink className="w-3.5 h-3.5 text-[#B90013]" />
                  <span>Xác thực Nguồn & Đường dẫn Ứng tuyển Trực tiếp</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">Tên nguồn tin:</label>
                    <input
                      type="text"
                      value={formSourceName}
                      onChange={(e) => setFormSourceName(e.target.value)}
                      placeholder="Cổng tuyển dụng doanh nghiệp / TopCV..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-[#B90013]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">
                      Link bài gốc (Source URL) <span className="text-red-500">*</span>:
                    </label>
                    <input
                      type="url"
                      required
                      value={formSourceUrl}
                      onChange={(e) => setFormSourceUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-[#B90013]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">
                      Link nộp hồ sơ (Apply URL) <span className="text-red-500">*</span>:
                    </label>
                    <input
                      type="url"
                      required
                      value={formApplyUrl}
                      onChange={(e) => setFormApplyUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-[#B90013]"
                    />
                  </div>
                </div>

                {/* Hạn nộp & Ngày đăng */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">Ngày đăng tin:</label>
                    <input
                      type="date"
                      value={formPublishedAt}
                      onChange={(e) => setFormPublishedAt(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-[#B90013]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">Hạn nộp hồ sơ:</label>
                    <input
                      type="date"
                      value={formExpiresAt}
                      onChange={(e) => setFormExpiresAt(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-[#B90013]"
                    />
                  </div>
                </div>

                {/* Trạng thái, Xác minh, Demo Check */}
                <div className="flex flex-wrap items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 text-slate-800 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formVerified}
                      onChange={(e) => setFormVerified(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Đã xác minh uy tín đối tác</span>
                    </span>
                  </label>

                  <label className="flex items-center gap-2 text-slate-800 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formStatus === 'active'}
                      onChange={(e) => setFormStatus(e.target.checked ? 'active' : 'hidden')}
                      className="rounded text-[#B90013] focus:ring-[#B90013]"
                    />
                    <span>Kích hoạt hiển thị cho sinh viên (Active)</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsJobModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#B90013] hover:bg-[#A30010] text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingJob ? 'Lưu thay đổi' : 'Đăng tin tuyển dụng'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PREVIEW JOB */}
      {previewJob && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                {previewJob.companyLogo ? (
                  <img
                    src={previewJob.companyLogo}
                    alt={previewJob.companyName}
                    className="w-12 h-12 rounded-xl object-contain border border-slate-100 p-1"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold">
                    <Building2 className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-[#131B2E]">{previewJob.title}</h3>
                    {previewJob.verified && (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-full flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-semibold">{previewJob.companyName}</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewJob(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Meta information chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-400 text-[10px] block font-bold">Địa điểm</span>
                <span className="font-bold text-slate-800">{previewJob.location}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-400 text-[10px] block font-bold">Loại hình</span>
                <span className="font-bold text-slate-800">{previewJob.employmentType}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-400 text-[10px] block font-bold">Mức lương</span>
                <span className="font-bold text-emerald-700">{previewJob.salaryText}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-400 text-[10px] block font-bold">Hạn nộp</span>
                <span className={`font-bold ${isJobExpired(previewJob) ? 'text-red-600' : 'text-slate-800'}`}>
                  {previewJob.expiresAt}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5 text-xs">
              <h4 className="font-bold text-slate-900">Mô tả công việc:</h4>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-xl">
                {previewJob.description}
              </p>
            </div>

            {/* Requirements */}
            {previewJob.requirements && previewJob.requirements.length > 0 && (
              <div className="space-y-1.5 text-xs">
                <h4 className="font-bold text-slate-900">Yêu cầu ứng viên:</h4>
                <ul className="space-y-1 list-disc pl-4 text-slate-600">
                  {previewJob.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {previewJob.benefits && previewJob.benefits.length > 0 && (
              <div className="space-y-1.5 text-xs">
                <h4 className="font-bold text-slate-900">Quyền lợi:</h4>
                <ul className="space-y-1 list-disc pl-4 text-slate-600">
                  {previewJob.benefits.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tags */}
            <div className="space-y-2 text-xs pt-1 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-bold text-slate-700 text-[11px]">Ngành học:</span>
                {previewJob.majorTags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded-md bg-red-50 text-[#B90013] text-[10px] font-bold">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-bold text-slate-700 text-[11px]">Kỹ năng:</span>
                {previewJob.skillTags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* External Links & Apply Action */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              {previewJob.sourceUrl ? (
                <a
                  href={previewJob.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
                >
                  <span>Mở nguồn ({previewJob.sourceName || 'Gốc'})</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : <div />}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewJob(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Đóng xem trước
                </button>
                {previewJob.applyUrl ? (
                  <a
                    href={previewJob.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[#B90013] hover:bg-[#A30010] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Thử mở link ứng tuyển</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
