import React, { useState } from 'react';
import { FirestoreEvent } from '../../types';
import {
  adminSaveEvent,
  adminToggleEventStatus,
  adminVerifyEvent,
  adminDeleteEvent,
  isEventExpired,
} from '../../services/events/eventService';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  Edit3,
  Trash2,
  ExternalLink,
  MapPin,
  Clock,
  Building2,
  ShieldCheck,
  AlertTriangle,
  X,
  Sparkles,
} from 'lucide-react';

interface AdminEventsTabProps {
  events: FirestoreEvent[];
  onRefreshEvents: () => Promise<void>;
  showToast: (msg: string) => void;
}

const EVENT_CATEGORIES = [
  { id: 'workshop', label: 'Workshop' },
  { id: 'talkshow', label: 'Talkshow' },
  { id: 'career-fair', label: 'Ngày hội việc làm (Career Fair)' },
  { id: 'competition', label: 'Cuộc thi học thuật / Case study' },
  { id: 'training', label: 'Khóa đào tạo kỹ năng' },
];

export const AdminEventsTab: React.FC<AdminEventsTabProps> = ({
  events,
  onRefreshEvents,
  showToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'hidden' | 'expired'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<FirestoreEvent | null>(null);
  const [previewEvent, setPreviewEvent] = useState<FirestoreEvent | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [formTitle, setFormTitle] = useState('');
  const [formOrganizer, setFormOrganizer] = useState('');
  const [formOrganizerLogo, setFormOrganizerLogo] = useState('');
  const [formDate, setFormDate] = useState('2026-04-15');
  const [formTime, setFormTime] = useState('08:30 - 11:30');
  const [formLocation, setFormLocation] = useState('Hội trường A2, Học viện PTIT');
  const [formLocationType, setFormLocationType] = useState<'offline' | 'online' | 'hybrid'>('offline');
  const [formCategory, setFormCategory] = useState('workshop');
  const [formDescription, setFormDescription] = useState('');
  const [formAgenda, setFormAgenda] = useState('');
  const [formSpeakers, setFormSpeakers] = useState('');
  const [formTargetAudience, setFormTargetAudience] = useState('Sinh viên PTIT khối ngành Kinh tế & Truyền thông');
  const [formBenefits, setFormBenefits] = useState('Cấp giấy chứng nhận, Cộng 3 điểm rèn luyện, Cơ hội kết nối Mentor');
  const [formRegistrationUrl, setFormRegistrationUrl] = useState('');
  const [formSourceUrl, setFormSourceUrl] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'hidden' | 'expired'>('active');
  const [formVerified, setFormVerified] = useState(true);

  // Open Form for Create
  const handleOpenCreateModal = () => {
    setEditingEvent(null);
    setFormTitle('');
    setFormOrganizer('Phòng CTSV PTIT & Doanh nghiệp đối tác');
    setFormOrganizerLogo('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormTime('09:00 - 11:30');
    setFormLocation('Hội trường A2, Học viện PTIT');
    setFormLocationType('offline');
    setFormCategory('workshop');
    setFormDescription('');
    setFormAgenda('09:00: Check-in & Khai mạc\n09:30: Chia sẻ chuyên đề từ Diễn giả\n10:30: Q&A & Thực hành phỏng vấn thử');
    setFormSpeakers('ThS. Nguyễn Hoàng Lan (HR Lead, VNG)\nTrần Quốc Huy (Senior Data Analyst, FPT)');
    setFormTargetAudience('Sinh viên PTIT năm 2, năm 3, năm 4');
    setFormBenefits('Cộng 3 điểm rèn luyện, Nhận tài liệu thực chiến, Cơ hội phỏng vấn trực tiếp');
    setFormRegistrationUrl('https://ptit.edu.vn/events');
    setFormSourceUrl('');
    setFormStatus('active');
    setFormVerified(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open Form for Edit
  const handleOpenEditModal = (event: FirestoreEvent) => {
    setEditingEvent(event);
    setFormTitle(event.title);
    setFormOrganizer(event.organizer);
    setFormOrganizerLogo(event.organizerLogo || '');
    setFormDate(event.date);
    setFormTime(event.time);
    setFormLocation(event.location);
    setFormLocationType(event.locationType);
    setFormCategory(event.category);
    setFormDescription(event.description);
    setFormAgenda(event.agenda ? event.agenda.join('\n') : '');
    setFormSpeakers(
      event.speakers
        ? event.speakers.map((s) => `${s.name} (${s.role}, ${s.company})`).join('\n')
        : ''
    );
    setFormTargetAudience(event.targetAudience || '');
    setFormBenefits(event.benefits ? event.benefits.join(', ') : '');
    setFormRegistrationUrl(event.registrationUrl);
    setFormSourceUrl(event.sourceUrl || '');
    setFormStatus(event.status);
    setFormVerified(event.verified);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Submit Save
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    // Parse Agenda
    const agendaArray = formAgenda
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    // Parse Speakers
    const speakersArray = formSpeakers
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        // extract name (role, company)
        const match = line.match(/^(.*?)\s*\((.*?)(?:,\s*(.*?))?\)$/);
        if (match) {
          return {
            name: match[1].trim(),
            role: (match[2] || 'Diễn giả').trim(),
            company: (match[3] || 'Đối tác').trim(),
          };
        }
        return { name: line, role: 'Diễn giả khách mời', company: formOrganizer };
      });

    // Parse Benefits
    const benefitsArray = formBenefits
      .split(/[,;\n]/)
      .map((b) => b.trim())
      .filter((b) => b.length > 0);

    const eventPayload = {
      ...(editingEvent ? { id: editingEvent.id } : {}),
      title: formTitle.trim(),
      organizer: formOrganizer.trim(),
      organizerLogo: formOrganizerLogo.trim() || undefined,
      date: formDate.trim(),
      time: formTime.trim(),
      location: formLocation.trim(),
      locationType: formLocationType,
      category: formCategory,
      description: formDescription.trim(),
      agenda: agendaArray,
      speakers: speakersArray,
      targetAudience: formTargetAudience.trim(),
      benefits: benefitsArray,
      registrationUrl: formRegistrationUrl.trim(),
      sourceUrl: formSourceUrl.trim() || undefined,
      status: formStatus,
      verified: formVerified,
    };

    const res = await adminSaveEvent(eventPayload);
    setIsSubmitting(false);

    if (res.success) {
      setIsModalOpen(false);
      await onRefreshEvents();
      showToast(
        editingEvent
          ? `Đã cập nhật sự kiện "${formTitle}" thành công!`
          : `Đã thêm mới sự kiện "${formTitle}" và đồng bộ Firestore!`
      );
    } else {
      setFormError(res.error || 'Có lỗi xảy ra khi lưu sự kiện.');
    }
  };

  // Toggle Status
  const handleToggleStatus = async (event: FirestoreEvent) => {
    const nextStatus = event.status === 'active' ? 'hidden' : 'active';
    const ok = await adminToggleEventStatus(event.id, nextStatus);
    if (ok) {
      await onRefreshEvents();
      showToast(`Đã chuyển trạng thái sự kiện sang: ${nextStatus === 'active' ? 'Hiển thị' : 'Ẩn'}`);
    }
  };

  // Toggle Verified
  const handleToggleVerified = async (event: FirestoreEvent) => {
    const ok = await adminVerifyEvent(event.id, !event.verified);
    if (ok) {
      await onRefreshEvents();
      showToast(
        !event.verified
          ? 'Đã xác minh sự kiện chính thức!'
          : 'Đã bỏ dấu xác minh sự kiện.'
      );
    }
  };

  // Delete Action
  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    const ok = await adminDeleteEvent(deleteTargetId);
    setDeleteTargetId(null);
    if (ok) {
      await onRefreshEvents();
      showToast('Đã xóa sự kiện thành công khỏi hệ thống.');
    }
  };

  // Filter & Search Logic
  const filteredEvents = events.filter((event) => {
    const matchSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'expired'
        ? isEventExpired(event)
        : event.status === statusFilter;

    const matchCategory =
      categoryFilter === 'all' ? true : event.category.toLowerCase() === categoryFilter.toLowerCase();

    return matchSearch && matchStatus && matchCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-red-600" />
            <span>Quản Lý Sự Kiện & Hội Thảo (Events)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý và xuất bản các Workshop, Talkshow, Ngày hội việc làm từ Khoa và Doanh nghiệp đối tác tới sinh viên.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 bg-[#B90013] hover:bg-[#8F000F] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Thêm sự kiện</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên sự kiện, đơn vị tổ chức..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 bg-slate-50/50"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full text-xs py-2 px-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-red-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang mở (Active)</option>
              <option value="hidden">Đang ẩn (Hidden)</option>
              <option value="expired">Đã hết hạn</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full text-xs py-2 px-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-red-500"
            >
              <option value="all">Tất cả phân loại</option>
              {EVENT_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Tên sự kiện & Đơn vị</th>
                <th className="py-3 px-3">Thời gian & Địa điểm</th>
                <th className="py-3 px-3">Phân loại</th>
                <th className="py-3 px-3">Trạng thái</th>
                <th className="py-3 px-3">Xác minh</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold">Chưa có dữ liệu sự kiện phù hợp với bộ lọc.</p>
                    <p className="text-[11px] mt-1">Nhấn "+ Thêm sự kiện" để xuất bản sự kiện mới vào hệ thống.</p>
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event) => {
                  const expired = isEventExpired(event);
                  return (
                    <tr key={event.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="space-y-1 max-w-xs sm:max-w-md">
                          <span className="font-bold text-slate-900 line-clamp-1">
                            {event.title}
                          </span>
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="line-clamp-1">{event.organizer}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="space-y-1 text-slate-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{event.date} ({event.time})</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-400">
                            <MapPin className="w-3 h-3" />
                            <span className="line-clamp-1">{event.location}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                          {event.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {expired ? (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-bold text-[10px]">
                            Hết hạn
                          </span>
                        ) : event.status === 'active' ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                            Đang mở
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px]">
                            Đang ẩn
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {event.verified ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Chính thức</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-400 text-[11px]">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Chưa duyệt</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Preview */}
                          <button
                            onClick={() => setPreviewEvent(event)}
                            title="Xem chi tiết"
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEditModal(event)}
                            title="Chỉnh sửa"
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-blue-600 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Toggle status */}
                          <button
                            onClick={() => handleToggleStatus(event)}
                            title={event.status === 'active' ? 'Ẩn sự kiện' : 'Hiện sự kiện'}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-amber-600 transition-colors"
                          >
                            {event.status === 'active' ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                          </button>

                          {/* Verify */}
                          <button
                            onClick={() => handleToggleVerified(event)}
                            title={event.verified ? 'Hủy xác minh' : 'Xác minh sự kiện'}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-emerald-600 transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteTargetId(event.id)}
                            title="Xóa sự kiện"
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Calendar className="w-5 h-5 text-red-600" />
                <span>{editingEvent ? 'Chỉnh Sửa Sự Kiện' : 'Thêm Sự Kiện Mới'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveEvent} className="p-6 overflow-y-auto space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Title & Organizer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-700">Tên sự kiện / Workshop *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="VD: Workshop Tối ưu hóa CV và Mô phỏng Phỏng vấn"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Đơn vị tổ chức *</label>
                  <input
                    type="text"
                    required
                    value={formOrganizer}
                    onChange={(e) => setFormOrganizer(e.target.value)}
                    placeholder="VD: Phòng CTSV PTIT & FPT Telecom"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">URL Logo đơn vị (Optional)</label>
                  <input
                    type="text"
                    value={formOrganizerLogo}
                    onChange={(e) => setFormOrganizerLogo(e.target.value)}
                    placeholder="VD: https://.../logo.png"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Date, Time, Category, Location Type */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Ngày diễn ra *</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Khung giờ *</label>
                  <input
                    type="text"
                    required
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    placeholder="09:00 - 11:30"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Phân loại *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500"
                  >
                    {EVENT_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Hình thức *</label>
                  <select
                    value={formLocationType}
                    onChange={(e) => setFormLocationType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500"
                  >
                    <option value="offline">Trực tiếp (Offline)</option>
                    <option value="online">Trực tuyến (Online)</option>
                    <option value="hybrid">Kết hợp (Hybrid)</option>
                  </select>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Địa điểm tổ chức *</label>
                <input
                  type="text"
                  required
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="VD: Hội trường A2 - Học viện Công nghệ Bưu chính Viễn thông"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Mô tả sự kiện *</label>
                <textarea
                  required
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Giới thiệu nội dung trọng tâm và mục đích của sự kiện..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 leading-relaxed"
                />
              </div>

              {/* Agenda & Speakers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Lịch trình (Mỗi dòng một mốc)</label>
                  <textarea
                    rows={3}
                    value={formAgenda}
                    onChange={(e) => setFormAgenda(e.target.value)}
                    placeholder="08:30: Đón tiếp đại biểu&#10;09:00: Diễn thuyết chính&#10;10:30: Giao lưu hỏi đáp"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Diễn giả (Tên (Chức vụ, Công ty))</label>
                  <textarea
                    rows={3}
                    value={formSpeakers}
                    onChange={(e) => setFormSpeakers(e.target.value)}
                    placeholder="Nguyễn Văn A (Head of Marketing, VinAI)&#10;Trần Thị B (HR Director, Viettel)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Target Audience & Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Đối tượng tham gia</label>
                  <input
                    type="text"
                    value={formTargetAudience}
                    onChange={(e) => setFormTargetAudience(e.target.value)}
                    placeholder="VD: Toàn bộ sinh viên PTIT, đặc biệt khối ngành Kinh tế"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Quyền lợi tham gia</label>
                  <input
                    type="text"
                    value={formBenefits}
                    onChange={(e) => setFormBenefits(e.target.value)}
                    placeholder="VD: Cộng 3 điểm rèn luyện, Nhận quà lưu niệm"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Registration & Source URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Link đăng ký tham gia * (Bắt đầu http/https)</label>
                  <input
                    type="url"
                    required
                    value={formRegistrationUrl}
                    onChange={(e) => setFormRegistrationUrl(e.target.value)}
                    placeholder="https://forms.gle/... hoặc link cổng đăng ký"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Link nguồn bài đăng gốc (Optional)</label>
                  <input
                    type="url"
                    value={formSourceUrl}
                    onChange={(e) => setFormSourceUrl(e.target.value)}
                    placeholder="https://facebook.com/... hoặc link website"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Status & Verified */}
              <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <label className="font-bold text-slate-700">Trạng thái:</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="active">Hiển thị (Active)</option>
                    <option value="hidden">Ẩn tạm thời (Hidden)</option>
                    <option value="expired">Hết hạn (Expired)</option>
                  </select>
                </div>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formVerified}
                    onChange={(e) => setFormVerified(e.target.checked)}
                    className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                  />
                  <span>Đã xác minh chính thức từ PTIT</span>
                </label>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#B90013] hover:bg-[#8F000F] text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Đang lưu...</span>
                  ) : (
                    <span>{editingEvent ? 'Lưu thay đổi' : 'Xuất bản sự kiện'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-[#B90013] text-[10px] font-bold uppercase tracking-wider">
                  {previewEvent.category}
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  {previewEvent.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewEvent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span className="font-semibold">{previewEvent.organizer}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{previewEvent.date} ({previewEvent.time})</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{previewEvent.location} ({previewEvent.locationType})</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {previewEvent.description}
            </p>

            {previewEvent.speakers && previewEvent.speakers.length > 0 && (
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-800">Diễn giả:</span>
                <div className="flex flex-wrap gap-1.5">
                  {previewEvent.speakers.map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-700">
                      {s.name} ({s.company})
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Link: {previewEvent.registrationUrl}
              </span>
              <a
                href={previewEvent.registrationUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5"
              >
                <span>Mở link đăng ký</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-black text-slate-900">Xác nhận xóa sự kiện?</h4>
              <p className="text-xs text-slate-500 mt-1">
                Sự kiện này sẽ bị gỡ bỏ vĩnh viễn khỏi cơ sở dữ liệu Firestore và website sinh viên.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
