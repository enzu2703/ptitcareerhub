import React, { useState, useEffect } from 'react';
import { ScreenView, CareerEvent } from '../../types';
import {
  Calendar,
  Clock,
  MapPin,
  Bookmark,
  Share2,
  ChevronLeft,
  Users,
  Award,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Send,
  X,
  Building2,
  Video,
  FileText,
  Mail,
  Phone,
  ArrowRight,
  UserCheck,
  CalendarPlus,
  ListPlus,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const TASKS_STORAGE_KEY = 'ptit_career_hub_tasks_v2';

interface EventDetailViewProps {
  event: CareerEvent;
  allEvents: CareerEvent[];
  onBack: () => void;
  onNavigate: (view: ScreenView) => void;
  onSelectEventDetail?: (event: CareerEvent) => void;
  onToggleSaveEvent?: (eventId: string) => void;
}

export const EventDetailView: React.FC<EventDetailViewProps> = ({
  event,
  allEvents,
  onBack,
  onNavigate,
  onSelectEventDetail,
  onToggleSaveEvent,
}) => {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    actionLabel?: string;
    onAction?: () => void;
  } | null>(null);

  const checkIsTaskAdded = (): boolean => {
    try {
      const raw = localStorage.getItem(TASKS_STORAGE_KEY);
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          return list.some(
            (t: any) => t.id === `task-event-${event.id}` || t.eventId === event.id
          );
        }
      }
    } catch {}
    return false;
  };

  const [isTaskAdded, setIsTaskAdded] = useState<boolean>(checkIsTaskAdded);

  useEffect(() => {
    setIsTaskAdded(checkIsTaskAdded());
    const handleStorageChange = () => {
      setIsTaskAdded(checkIsTaskAdded());
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('ptit_tasks_updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('ptit_tasks_updated', handleStorageChange);
    };
  }, [event.id]);

  // Form State
  const [fullName, setFullName] = useState('Nguyễn Văn Minh');
  const [studentId, setStudentId] = useState('B22DCCN123');
  const [studentClass, setStudentClass] = useState('D22CQMR01-B');
  const [email, setEmail] = useState('minh.nv@student.ptit.edu.vn');
  const [phone, setPhone] = useState('0987 654 321');
  const [question, setQuestion] = useState('');

  const showToast = (msg: string, actionLabel?: string, onAction?: () => void) => {
    setToastMessage({ text: msg, actionLabel, onAction });
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  const handleToggleTask = () => {
    try {
      const raw = localStorage.getItem(TASKS_STORAGE_KEY);
      let list: any[] = [];
      if (raw) {
        try {
          list = JSON.parse(raw) || [];
        } catch {
          list = [];
        }
      }

      const taskId = `task-event-${event.id}`;
      const exists = list.some((t: any) => t.id === taskId || t.eventId === event.id);

      if (exists) {
        list = list.filter((t: any) => t.id !== taskId && t.eventId !== event.id);
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(list));
        setIsTaskAdded(false);
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(
          new CustomEvent('ptit_tasks_updated', { detail: { eventId: event.id, action: 'removed' } })
        );
        showToast(`Đã gỡ sự kiện "${event.title}" khỏi My Tasks`);
      } else {
        const monthClean = event.month ? event.month.replace(/[^0-9]/g, '') : '10';
        const safeMonth = (monthClean || '10').padStart(2, '0');
        const safeDay = String(event.day || '25').padStart(2, '0');
        const isoDate = `2026-${safeMonth}-${safeDay}`;

        const newTask = {
          id: taskId,
          eventId: event.id,
          title: `Tham gia: ${event.title}`,
          description: `${event.time} • ${event.location} • Đơn vị: ${event.organizer}${event.trainingPoints ? ` • Nhận +${event.trainingPoints}đ rèn luyện` : ''}`,
          category: 'learning',
          priority: (event.trainingPoints && event.trainingPoints >= 5) || event.eventType === 'Career' ? 'high' : 'medium',
          dueDate: event.date || `${event.day}/${safeMonth}/2026`,
          startDate: isoDate,
          externalLink: event.registrationUrl || 'https://careerhub.ptit.edu.vn',
          completed: false,
          linkedView: 'events',
          actionText: 'Xem Sự kiện',
        };

        list = [newTask, ...list];
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(list));
        setIsTaskAdded(true);
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(
          new CustomEvent('ptit_tasks_updated', { detail: { eventId: event.id, action: 'added' } })
        );

        try {
          confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
        } catch {}

        showToast(
          'Đã thêm sự kiện vào danh sách My Tasks!',
          'Xem My Tasks',
          () => onNavigate('my-tasks')
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSave = () => {
    if (onToggleSaveEvent) {
      onToggleSaveEvent(event.id);
    }
    showToast(
      event.isSaved
        ? `Đã bỏ lưu sự kiện "${event.title}"`
        : `Đã lưu sự kiện "${event.title}" vào mục đã lưu!`
    );
  };

  const handleOpenRegister = () => {
    setRegisterModalOpen(true);
  };

  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistered(true);
    try {
      confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
    } catch (err) {
      // silent
    }
    showToast('🎉 Đăng ký tham gia sự kiện thành công! Thông tin vé đã gửi qua Email.');
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Đã sao chép liên kết sự kiện vào bộ nhớ tạm!');
  };

  const handleAddToCalendar = () => {
    // Generate Google Calendar Link
    const startTimeFormatted = '20261025T123000Z';
    const endTimeFormatted = '20261025T143000Z';
    const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.title
    )}&dates=${startTimeFormatted}/${endTimeFormatted}&details=${encodeURIComponent(
      event.description
    )}&location=${encodeURIComponent(event.location)}`;
    window.open(calUrl, '_blank');
  };

  // Related events
  const relatedEvents = allEvents
    .filter(
      (ev) =>
        ev.id !== event.id &&
        (ev.eventType === event.eventType ||
          ev.relatedCareers.some((c) => event.relatedCareers.includes(c)))
    )
    .slice(0, 3);

  const fillPercentage =
    event.maxSlots && event.registeredCount
      ? Math.min(100, Math.round((event.registeredCount / event.maxSlots) * 100))
      : 75;

  return (
    <div className="max-w-[1150px] mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-9 space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 bg-[#131B2E] text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="max-w-xs">{toastMessage.text}</span>
          {toastMessage.actionLabel && (
            <button
              onClick={() => {
                if (toastMessage.onAction) toastMessage.onAction();
                setToastMessage(null);
              }}
              className="px-2.5 py-1 rounded-lg bg-[#B90013] hover:bg-[#A30010] text-white text-[11px] font-bold cursor-pointer transition-colors shrink-0"
            >
              {toastMessage.actionLabel}
            </button>
          )}
        </div>
      )}

      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-[#B90013] transition-colors group"
        >
          <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center group-hover:border-red-200 group-hover:bg-red-50 transition-colors">
            <ChevronLeft className="w-4 h-4 text-slate-600 group-hover:text-[#B90013]" />
          </div>
          <span>Quay lại danh sách sự kiện</span>
        </button>

        {/* Breadcrumbs */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <span
            onClick={() => onNavigate('home')}
            className="hover:text-slate-700 cursor-pointer"
          >
            Trang chủ
          </span>
          <span>/</span>
          <span
            onClick={() => onNavigate('events')}
            className="hover:text-slate-700 cursor-pointer"
          >
            Sự kiện
          </span>
          <span>/</span>
          <span className="text-[#131B2E] font-bold truncate max-w-[200px]">
            {event.title}
          </span>
        </div>
      </div>

      {/* Hero Event Banner Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-[0_4px_24px_rgba(15,23,42,0.05)] relative overflow-hidden">
        {/* Subtle Decorative Gradient Background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-red-100/40 via-purple-50/30 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 space-y-6">
          {/* Top Tag Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 bg-red-50 text-[#B90013] text-xs font-black rounded-xl border border-red-100 uppercase tracking-wider">
              {event.eventType}
            </span>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl border border-blue-100 flex items-center gap-1.5">
              {event.isOnline ? <Video className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
              {event.format || (event.isOnline ? 'Trực tuyến' : 'Trực tiếp')}
            </span>
            {event.trainingPoints && (
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-extrabold rounded-xl border border-emerald-100 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                +{event.trainingPoints} Điểm rèn luyện
              </span>
            )}
            {event.hasCertificate && (
              <span className="px-3 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-xl border border-amber-100">
                📜 Cấp Giấy chứng nhận
              </span>
            )}
            <span className="px-3 py-1 bg-purple-50 text-[#712AE2] text-xs font-bold rounded-xl border border-purple-100">
              {event.fee || 'Miễn phí tham dự'}
            </span>
          </div>

          {/* Event Header & Organizer */}
          <div className="space-y-3">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#131B2E] leading-tight">
              {event.title}
            </h1>
            <div className="flex items-center gap-2.5 text-sm text-slate-600">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-base shrink-0">
                {event.organizerLogo || '🏛️'}
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Đơn vị chủ trì & tổ chức:</span>
                <span className="font-bold text-[#131B2E]">{event.organizer}</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-2">
            <div className="bg-slate-50/90 rounded-2xl p-3.5 border border-slate-100">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Calendar className="w-3.5 h-3.5 text-[#B90013]" />
                <span>Ngày diễn ra</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-[#131B2E]">{event.date}</p>
            </div>

            <div className="bg-slate-50/90 rounded-2xl p-3.5 border border-slate-100">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Clock className="w-3.5 h-3.5 text-[#712AE2]" />
                <span>Khung giờ</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-[#131B2E]">{event.time}</p>
            </div>

            <div className="bg-slate-50/90 rounded-2xl p-3.5 border border-slate-100">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Địa điểm</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-[#131B2E] truncate" title={event.location}>
                {event.location}
              </p>
            </div>

            <div className="bg-slate-50/90 rounded-2xl p-3.5 border border-slate-100">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span>Số lượng tham gia</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-[#131B2E]">
                {event.registeredCount ? `${event.registeredCount}/${event.maxSlots || 200} sinh viên` : 'Mở rộng'}
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleOpenRegister}
                className="bg-[#B90013] hover:bg-[#A30010] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isRegistered ? 'Đã đăng ký (Xem lại vé)' : 'Đăng ký tham gia ngay'}</span>
              </button>

              {/* Thanh thêm vào My Tasks */}
              <button
                id={`btn-detail-add-task-${event.id}`}
                onClick={handleToggleTask}
                className={`px-4 py-3 rounded-2xl border text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-2xs ${
                  isTaskAdded
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-gradient-to-r from-red-50 to-white hover:bg-[#B90013] text-[#B90013] hover:text-white border-red-200 hover:border-[#B90013]'
                }`}
                title={isTaskAdded ? 'Nhấn để gỡ khỏi My Tasks' : 'Thêm sự kiện này vào My Tasks'}
              >
                {isTaskAdded ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Đã thêm vào My Tasks</span>
                  </>
                ) : (
                  <>
                    <CalendarPlus className="w-4 h-4 shrink-0" />
                    <span>Thêm vào My Tasks</span>
                  </>
                )}
              </button>

              <button
                onClick={handleToggleSave}
                className={`p-3 rounded-2xl border transition-all flex items-center gap-1.5 text-xs sm:text-sm font-bold cursor-pointer ${
                  event.isSaved
                    ? 'bg-red-50 border-red-200 text-[#B90013]'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${event.isSaved ? 'fill-current' : ''}`} />
                <span className="hidden sm:inline">{event.isSaved ? 'Đã lưu' : 'Lưu sự kiện'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAddToCalendar}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Thêm vào Google Calendar"
              >
                <CalendarPlus className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Google Calendar</span>
              </button>

              <button
                onClick={handleShare}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Chia sẻ sự kiện"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Chia sẻ</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Detailed Content (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Overview Description */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-base sm:text-lg font-extrabold text-[#131B2E] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#B90013]" />
              <span>Tổng quan & Ý nghĩa chương trình</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {event.detailedContent || event.description}
            </p>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Section 2: Agenda / Program Timeline */}
          {event.agenda && event.agenda.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xs space-y-4">
              <h2 className="text-base sm:text-lg font-extrabold text-[#131B2E] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#712AE2]" />
                <span>Lịch trình chương trình (Agenda)</span>
              </h2>
              <div className="space-y-3 pt-2 relative before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-100">
                {event.agenda.map((item, idx) => (
                  <div key={idx} className="relative pl-8 group">
                    <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-white border-2 border-[#712AE2] group-hover:bg-[#712AE2] transition-colors" />
                    <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100">
                      <span className="text-[11px] font-extrabold text-[#712AE2] bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100 inline-block mb-1">
                        {item.time}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-[#131B2E]">
                        {item.activity}
                      </h4>
                      {item.speaker && (
                        <p className="text-xs text-slate-500 mt-1">Diễn giả: {item.speaker}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Speakers & Mentors */}
          {event.speakers && event.speakers.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xs space-y-4">
              <h2 className="text-base sm:text-lg font-extrabold text-[#131B2E] flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Diễn giả & Khách mời chuyên gia</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {event.speakers.map((sp, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200/90 flex items-start gap-3.5"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-red-100 text-[#B90013] font-black text-lg flex items-center justify-center shrink-0 border border-red-200">
                      {sp.name.charAt(0)}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-extrabold text-[#131B2E] truncate">
                        {sp.name}
                      </h4>
                      <p className="text-[11px] font-bold text-[#B90013]">{sp.role}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{sp.company}</p>
                      {sp.bio && (
                        <p className="text-[11px] text-slate-600 leading-snug pt-1">
                          {sp.bio}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Benefits for Students */}
          {event.benefits && event.benefits.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xs space-y-4">
              <h2 className="text-base sm:text-lg font-extrabold text-[#131B2E] flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Quyền lợi & Giá trị dành cho sinh viên</span>
              </h2>
              <div className="grid grid-cols-1 gap-2.5 pt-1">
                {event.benefits.map((ben, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-xs sm:text-sm text-emerald-950 font-medium"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{ben}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 5: Target Audience */}
          {event.targetAudience && event.targetAudience.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xs space-y-4">
              <h2 className="text-base sm:text-lg font-extrabold text-[#131B2E] flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-600" />
                <span>Đối tượng & Yêu cầu tham dự</span>
              </h2>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                {event.targetAudience.map((aud, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                    <span>{aud}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Section 6: Related Skills & Fields */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-base sm:text-lg font-extrabold text-[#131B2E]">
              Kỹ năng & Lĩnh vực thu nhận được
            </h2>
            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold text-slate-400 block mb-2">KỸ NĂNG TRỌNG TÂM:</span>
                <div className="flex flex-wrap gap-2">
                  {event.relatedSkills.map((sk) => (
                    <span
                      key={sk}
                      className="px-3 py-1.5 rounded-xl bg-purple-50 text-[#712AE2] text-xs font-bold border border-purple-100"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
              <div className="pt-2">
                <span className="text-xs font-bold text-slate-400 block mb-2">NGÀNH NGHỀ LIÊN QUAN:</span>
                <div className="flex flex-wrap gap-2">
                  {event.relatedCareers.map((car) => (
                    <span
                      key={car}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
                    >
                      {car}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Registration Card & Sidebar */}
        <div className="space-y-6">
          {/* Registration Box Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-5 sticky top-20">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-100 uppercase">
                {isRegistered ? 'Đã xác nhận chỗ' : 'Đang mở đăng ký'}
              </span>
              <h3 className="text-base font-extrabold text-[#131B2E]">
                Đăng ký tham gia sự kiện
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Hạn đăng ký: <strong>{event.registrationDeadline || 'Trước ngày diễn ra 1 ngày'}</strong>
              </p>
            </div>

            {/* Slots Capacity Progress */}
            {event.maxSlots && (
              <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Số chỗ đã đăng ký</span>
                  <span className="text-[#B90013]">{event.registeredCount} / {event.maxSlots}</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-[#B90013] rounded-full transition-all duration-500"
                    style={{ width: `${fillPercentage}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 text-right">Còn lại {event.maxSlots - (event.registeredCount || 0)} suất</p>
              </div>
            )}

            <button
              onClick={handleOpenRegister}
              className="w-full bg-[#B90013] hover:bg-[#A30010] text-white font-bold text-sm py-3.5 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isRegistered ? 'Xem thông tin vé & QR Code' : 'Đăng ký ngay (Miễn phí)'}</span>
            </button>

            {/* External link fallback */}
            {event.registrationUrl && (
              <a
                href={event.registrationUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full text-center block text-xs font-bold text-slate-500 hover:text-slate-800 py-1.5"
              >
                Hoặc mở form website đơn vị tổ chức →
              </a>
            )}

            {/* Contact Box */}
            <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Thông tin liên hệ BTC:
              </span>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{event.contactEmail || 'careerhub@ptit.edu.vn'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{event.contactPhone || '024 3756 2186'}</span>
              </div>
            </div>
          </div>

          {/* Related Events Widget */}
          {relatedEvents.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <h3 className="text-sm font-extrabold text-[#131B2E]">
                Sự kiện tương tự cùng chủ đề
              </h3>
              <div className="space-y-3">
                {relatedEvents.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => {
                      if (onSelectEventDetail) {
                        onSelectEventDetail(rel);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-red-50/40 border border-slate-100 hover:border-red-200 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-1">
                      <span className="font-bold text-[#B90013]">{rel.date}</span>
                      <span>•</span>
                      <span>{rel.eventType}</span>
                    </div>
                    <h4 className="text-xs font-bold text-[#131B2E] group-hover:text-[#B90013] transition-colors line-clamp-2">
                      {rel.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 truncate">{rel.organizer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Registration Modal */}
      {registerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 bg-red-50 text-[#B90013] text-[10px] font-bold rounded-full border border-red-100 inline-block mb-1">
                  Đăng ký tham gia
                </span>
                <h3 className="text-lg font-extrabold text-[#131B2E]">{event.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Thời gian: {event.time}, {event.date} • {event.location}
                </p>
              </div>
              <button
                onClick={() => setRegisterModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isRegistered ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto text-2xl">
                  ✓
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-extrabold text-[#131B2E]">
                    Bạn đã đăng ký tham gia thành công!
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Mã xác nhận vé và thông tin phòng họp trực tuyến/hội trường đã được gửi tới email <strong>{email}</strong>.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-1.5 text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Người đăng ký:</span>
                    <span className="font-bold">{fullName} ({studentId})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Lớp:</span>
                    <span className="font-semibold">{studentClass}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Điểm rèn luyện ghi nhận:</span>
                    <span className="font-bold text-emerald-600">+{event.trainingPoints || 3} Điểm</span>
                  </div>
                </div>

                <button
                  onClick={() => setRegisterModalOpen(false)}
                  className="w-full bg-[#131B2E] text-white font-bold text-xs py-3 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Đóng cửa sổ
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitRegistration} className="space-y-4">
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Họ và tên sinh viên *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#B90013] text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Mã số sinh viên (MSSV) *</label>
                      <input
                        type="text"
                        required
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#B90013] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Lớp sinh hoạt / Khóa *</label>
                      <input
                        type="text"
                        required
                        value={studentClass}
                        onChange={(e) => setStudentClass(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#B90013] text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Email sinh viên / PTIT *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#B90013] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Số điện thoại *</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#B90013] text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Câu hỏi muốn đặt trước cho Diễn giả / Doanh nghiệp (Không bắt buộc)
                    </label>
                    <textarea
                      rows={2}
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Nhập câu hỏi hoặc băn khoăn nghề nghiệp của bạn..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#B90013] text-xs"
                    />
                  </div>
                </div>

                <div className="p-3 bg-red-50 rounded-xl border border-red-100 text-[11px] text-[#B90013]">
                  💡 Điểm rèn luyện (+{event.trainingPoints || 3}đ) sẽ được đối soát tự động qua mã sinh viên và quét mã QR check-in tại sự kiện.
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setRegisterModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#B90013] hover:bg-[#A30010] text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Xác nhận đăng ký</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
