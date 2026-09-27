import React, { useState, useEffect } from 'react';
import { ScreenView, CareerEvent, UserProfileState } from '../../types';
import { CAREER_EVENTS } from '../../data/mockData';
import { trackEvent } from '../../utils/analytics';
import confetti from 'canvas-confetti';
import {
  Calendar,
  MapPin,
  Clock,
  ExternalLink,
  Sparkles,
  Bookmark,
  CheckCircle2,
  Filter,
  Users,
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  Award,
  Video,
  Building2,
  ArrowRight,
  CalendarPlus,
  Trash2,
  ListPlus,
} from 'lucide-react';

const TASKS_STORAGE_KEY = 'ptit_career_hub_tasks_v2';

interface EventsViewProps {
  onNavigate: (view: ScreenView) => void;
  searchTerm: string;
  onSearchChange?: (term: string) => void;
  onSelectEventDetail: (event: CareerEvent) => void;
  events?: CareerEvent[];
  onToggleSaveEvent?: (eventId: string) => void;
  userProfile?: UserProfileState;
}

export const EventsView: React.FC<EventsViewProps> = ({
  onNavigate,
  searchTerm,
  onSearchChange,
  onSelectEventDetail,
  events: externalEvents,
  onToggleSaveEvent: externalToggleSaveEvent,
  userProfile,
}) => {
  const [internalEvents, setInternalEvents] = useState<CareerEvent[]>(CAREER_EVENTS);
  const events = externalEvents || internalEvents;
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    actionLabel?: string;
    onAction?: () => void;
  } | null>(null);

  // Helper to read task event IDs from localStorage
  const loadTaskEventIds = (): Set<string> => {
    try {
      const raw = localStorage.getItem(TASKS_STORAGE_KEY);
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          const set = new Set<string>();
          list.forEach((t: any) => {
            if (t.id && typeof t.id === 'string' && t.id.startsWith('task-event-')) {
              set.add(t.id.replace('task-event-', ''));
            } else if (t.eventId) {
              set.add(t.eventId);
            }
          });
          return set;
        }
      }
    } catch {}
    return new Set<string>();
  };

  const [taskEventIds, setTaskEventIds] = useState<Set<string>>(loadTaskEventIds);

  // Sync taskEventIds with storage updates
  useEffect(() => {
    const handleStorageChange = () => {
      setTaskEventIds(loadTaskEventIds());
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('ptit_tasks_updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('ptit_tasks_updated', handleStorageChange);
    };
  }, []);

  // Filters State
  const [typeFilter, setTypeFilter] = useState<string>('Tất cả');
  const [formatFilter, setFormatFilter] = useState<string>('Tất cả');
  const [careerFilter, setCareerFilter] = useState<string>('Tất cả');
  const [benefitFilter, setBenefitFilter] = useState<string>('Tất cả');

  const showToast = (msg: string, actionLabel?: string, onAction?: () => void) => {
    setToastMessage({ text: msg, actionLabel, onAction });
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  const handleToggleAddTask = (e: React.MouseEvent, event: CareerEvent) => {
    e.stopPropagation();
    try {
      const existingStr = localStorage.getItem(TASKS_STORAGE_KEY);
      let list: any[] = [];
      if (existingStr) {
        try {
          list = JSON.parse(existingStr) || [];
        } catch {
          list = [];
        }
      }

      const taskId = `task-event-${event.id}`;
      const isAlreadyIn = list.some((t: any) => t.id === taskId || t.eventId === event.id);

      if (isAlreadyIn) {
        // Remove
        list = list.filter((t: any) => t.id !== taskId && t.eventId !== event.id);
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(list));
        setTaskEventIds((prev) => {
          const next = new Set(prev);
          next.delete(event.id);
          return next;
        });
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('ptit_tasks_updated', { detail: { eventId: event.id, action: 'removed' } }));
        showToast(`Đã gỡ sự kiện "${event.title}" khỏi My Tasks`);
      } else {
        // Add
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
        setTaskEventIds((prev) => new Set(prev).add(event.id));
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('ptit_tasks_updated', { detail: { eventId: event.id, action: 'added' } }));

        try {
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch {}

        trackEvent('todo_create', { source: 'events_view', eventId: event.id, eventTitle: event.title });

        showToast(
          `Đã thêm sự kiện vào danh sách My Tasks!`,
          'Xem My Tasks',
          () => onNavigate('my-tasks')
        );
      }
    } catch (err) {
      console.error('Error adding event to tasks', err);
    }
  };

  const handleRemoveTaskForEvent = (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation();
    try {
      const existingStr = localStorage.getItem(TASKS_STORAGE_KEY);
      if (existingStr) {
        let list = JSON.parse(existingStr) || [];
        list = list.filter((t: any) => t.id !== `task-event-${eventId}` && t.eventId !== eventId);
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(list));
      }
      setTaskEventIds((prev) => {
        const next = new Set(prev);
        next.delete(eventId);
        return next;
      });
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('ptit_tasks_updated', { detail: { eventId, action: 'removed' } }));
      showToast('Đã gỡ sự kiện khỏi My Tasks');
    } catch {}
  };

  const handleToggleSaveEvent = (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation();
    const target = events.find((ev) => ev.id === eventId);
    const willBeSaved = target ? !target.isSaved : false;

    if (externalToggleSaveEvent) {
      externalToggleSaveEvent(eventId);
    } else {
      setInternalEvents((prev) =>
        prev.map((ev) =>
          ev.id === eventId ? { ...ev, isSaved: !ev.isSaved } : ev
        )
      );
    }

    showToast(
      willBeSaved
        ? `Đã lưu sự kiện "${target?.title || 'Sự kiện'}" vào mục đã lưu!`
        : `Đã bỏ lưu sự kiện "${target?.title || 'Sự kiện'}"`
    );
  };

  const resetAllFilters = () => {
    setTypeFilter('Tất cả');
    setFormatFilter('Tất cả');
    setCareerFilter('Tất cả');
    setBenefitFilter('Tất cả');
    if (onSearchChange) onSearchChange('');
  };

  // Active filter chips
  const activeChips: { label: string; onRemove: () => void }[] = [];
  if (typeFilter !== 'Tất cả') {
    activeChips.push({ label: `Loại: ${typeFilter}`, onRemove: () => setTypeFilter('Tất cả') });
  }
  if (formatFilter !== 'Tất cả') {
    activeChips.push({ label: `Hình thức: ${formatFilter}`, onRemove: () => setFormatFilter('Tất cả') });
  }
  if (careerFilter !== 'Tất cả') {
    activeChips.push({ label: `Ngành: ${careerFilter}`, onRemove: () => setCareerFilter('Tất cả') });
  }
  if (benefitFilter !== 'Tất cả') {
    activeChips.push({ label: `Quyền lợi: ${benefitFilter}`, onRemove: () => setBenefitFilter('Tất cả') });
  }
  if (searchTerm) {
    activeChips.push({ label: `Từ khóa: "${searchTerm}"`, onRemove: () => onSearchChange && onSearchChange('') });
  }

  const rawFilteredEvents = events.filter((ev) => {
    // Type Filter
    if (typeFilter !== 'Tất cả' && ev.eventType !== typeFilter) {
      return false;
    }

    // Format Filter
    if (formatFilter !== 'Tất cả') {
      if (formatFilter === 'Trực tuyến' && !ev.isOnline && ev.format !== 'Trực tuyến') return false;
      if (formatFilter === 'Trực tiếp' && (ev.isOnline || ev.format === 'Trực tuyến')) return false;
      if (formatFilter === 'Hybrid' && ev.format !== 'Hybrid') return false;
    }

    // Career Filter
    if (careerFilter !== 'Tất cả') {
      const match =
        ev.relatedCareers.includes(careerFilter) ||
        ev.relatedCareers.includes('Tất cả các ngành');
      if (!match) return false;
    }

    // Benefit Filter
    if (benefitFilter !== 'Tất cả') {
      if (benefitFilter === 'Điểm rèn luyện' && (!ev.trainingPoints || ev.trainingPoints <= 0)) return false;
      if (benefitFilter === 'Có chứng nhận' && !ev.hasCertificate) return false;
    }

    // Search Term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchTitle = ev.title.toLowerCase().includes(term);
      const matchOrg = ev.organizer.toLowerCase().includes(term);
      const matchSkill = ev.relatedSkills.some((s) => s.toLowerCase().includes(term));
      const matchCareer = ev.relatedCareers.some((c) => c.toLowerCase().includes(term));
      const matchDesc = ev.description.toLowerCase().includes(term);
      if (!matchTitle && !matchOrg && !matchSkill && !matchCareer && !matchDesc) {
        return false;
      }
    }

    return true;
  });

  // Tendency-based matcher
  const topTendency = userProfile?.topCareerTendencies?.[0]?.code;

  const isEventMatchedToTendency = (ev: CareerEvent): boolean => {
    if (!userProfile?.careerCheckCompleted || !topTendency) return false;
    const text = `${ev.title} ${ev.eventType} ${ev.description} ${ev.relatedSkills.join(' ')} ${ev.relatedCareers.join(' ')}`.toLowerCase();
    if (topTendency === 'CR') {
      return (
        text.includes('marketing') ||
        text.includes('sáng tạo') ||
        text.includes('creative') ||
        text.includes('content') ||
        text.includes('design') ||
        text.includes('workshop')
      );
    }
    if (topTendency === 'AN') {
      return (
        text.includes('data') ||
        text.includes('phân tích') ||
        text.includes('case') ||
        text.includes('hackathon') ||
        text.includes('analytics') ||
        text.includes('nghiên cứu')
      );
    }
    if (topTendency === 'OP') {
      return (
        text.includes('chuỗi cung ứng') ||
        text.includes('logistics') ||
        text.includes('vận hành') ||
        text.includes('project') ||
        text.includes('quản trị')
      );
    }
    if (topTendency === 'CO') {
      return (
        text.includes('pitching') ||
        text.includes('networking') ||
        text.includes('sales') ||
        text.includes('kinh doanh') ||
        text.includes('đàm phán') ||
        text.includes('giao tiếp')
      );
    }
    return false;
  };

  // Multi-signal event relevance scoring (Career Check test results, Major, Target Job)
  const calculateEventRelevanceScore = (ev: CareerEvent): number => {
    let score = 0;
    const text = `${ev.title} ${ev.eventType} ${ev.description} ${ev.relatedSkills.join(' ')} ${ev.relatedCareers.join(' ')}`.toLowerCase();

    // 1. Career Check Test Result Match (up to +40 pts)
    if (topTendency) {
      if (topTendency === 'CR' && /marketing|sáng tạo|creative|content|design|workshop|video/.test(text)) score += 40;
      else if (topTendency === 'AN' && /data|phân tích|case|hackathon|analytics|nghiên cứu/.test(text)) score += 40;
      else if (topTendency === 'OP' && /chuỗi cung ứng|logistics|vận hành|project|quản trị/.test(text)) score += 40;
      else if (topTendency === 'CO' && /pitching|networking|sales|kinh doanh|đàm phán|giao tiếp/.test(text)) score += 40;
    }

    // 2. Ngành học PTIT (Major Match - up to +35 pts)
    if (userProfile?.major) {
      const maj = userProfile.major.toLowerCase();
      const directMatch = ev.relatedCareers.some((c) => {
        const cLower = c.toLowerCase();
        return maj.includes(cLower) || cLower.includes('tất cả các ngành');
      });
      if (directMatch) score += 35;
    }

    // 3. Công việc mục tiêu (Target Job / Career Direction Match - up to +35 pts)
    const targetJob = (userProfile?.targetJobTitle || userProfile?.careerDirection || '').toLowerCase();
    if (targetJob) {
      const targetWords = targetJob.split(/[\s,–-]+/).filter((w: string) => w.length > 2);
      if (targetWords.some((w: string) => text.includes(w))) {
        score += 35;
      }
    }

    // Target Skills Match (+10 pts per skill, up to 20 pts)
    if (userProfile?.targetJobRequiredSkills && userProfile.targetJobRequiredSkills.length > 0) {
      const matchedSkillCount = userProfile.targetJobRequiredSkills.filter((s: string) =>
        text.includes(s.toLowerCase())
      ).length;
      score += Math.min(matchedSkillCount * 10, 20);
    }

    return score;
  };

  // Prioritize matching events based on test results + major + target job
  const filteredEvents = [...rawFilteredEvents].sort((a, b) => {
    const scoreA = calculateEventRelevanceScore(a);
    const scoreB = calculateEventRelevanceScore(b);
    if (scoreB !== scoreA) return scoreB - scoreA;
    return (b.trainingPoints || 0) - (a.trainingPoints || 0);
  });

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-7 font-['Plus_Jakarta_Sans',sans-serif]">
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

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-red-50 text-[#B90013] text-xs font-bold rounded-full border border-red-100 inline-block">
              Học hỏi • Trải nghiệm • Tích lũy điểm rèn luyện
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-semibold rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Tự động đồng bộ theo kết quả & hồ sơ của bạn
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#131B2E]">
            Sự kiện & Workshop Hướng nghiệp
          </h1>
          <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
            Khám phá các buổi tọa đàm công nghệ, ngày hội việc làm quy mô lớn và workshop chuyên sâu cùng chuyên gia dành cho sinh viên PTIT.
          </p>
        </div>

        <button
          onClick={() => onNavigate('saved-items')}
          className="self-start md:self-auto px-4 py-2.5 rounded-2xl bg-white border border-slate-200 hover:border-red-200 text-xs font-bold text-slate-700 flex items-center gap-2 shadow-2xs hover:bg-red-50/50 transition-all cursor-pointer"
        >
          <Bookmark className="w-4 h-4 text-[#B90013]" />
          <span>Sự kiện & Việc làm đã lưu</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Main Keyword Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder="Tìm kiếm sự kiện theo tên, chủ đề, diễn giả, đơn vị tổ chức, kỹ năng..."
              className="w-full pl-11 pr-10 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#B90013] focus:ring-2 focus:ring-red-100 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange && onSearchChange('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Advanced Filter Toggle Button */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-5 py-3 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              showAdvancedFilters || activeChips.length > 0
                ? 'bg-red-50 border-red-200 text-[#B90013]'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Bộ lọc nâng cao</span>
            {activeChips.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#B90013] text-white text-[10px] font-bold flex items-center justify-center">
                {activeChips.length}
              </span>
            )}
            {showAdvancedFilters ? (
              <ChevronUp className="w-4 h-4 ml-1" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-1" />
            )}
          </button>
        </div>

        {/* Category Fast-Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 shrink-0">Loại sự kiện:</span>
          {['Tất cả', 'Workshop', 'Career', 'Competition', 'Networking', 'Training'].map((cat) => (
            <button
              key={cat}
              onClick={() => setTypeFilter(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                typeFilter === cat
                  ? 'bg-[#B90013] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'
              }`}
            >
              {cat === 'Tất cả' ? 'Tất cả' : cat === 'Career' ? 'Ngày hội việc làm' : cat}
            </button>
          ))}
        </div>

        {/* Collapsible Advanced Filters Section */}
        {showAdvancedFilters && (
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in-50 duration-200">
            {/* Filter 1: Format */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Hình thức tổ chức</label>
              <select
                value={formatFilter}
                onChange={(e) => setFormatFilter(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#B90013]"
              >
                <option value="Tất cả">Tất cả hình thức</option>
                <option value="Trực tiếp">Trực tiếp (Tại trường / Hội trường)</option>
                <option value="Trực tuyến">Trực tuyến (Zoom / MS Teams)</option>
                <option value="Hybrid">Kết hợp (Hybrid)</option>
              </select>
            </div>

            {/* Filter 2: Career / Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Lĩnh vực nghề nghiệp</label>
              <select
                value={careerFilter}
                onChange={(e) => setCareerFilter(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#B90013]"
              >
                <option value="Tất cả">Tất cả các ngành</option>
                <option value="Digital Marketing">Digital Marketing & Truyền thông</option>
                <option value="Software Engineering">Công nghệ thông tin / Phần mềm</option>
                <option value="Data Analytics">Data & Marketing Analytics</option>
                <option value="Business Development">Kinh doanh & Phát triển dự án</option>
                <option value="Thương mại điện tử">Thương mại điện tử (E-Commerce)</option>
              </select>
            </div>

            {/* Filter 3: Benefits & Points */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Quyền lợi sinh viên</label>
              <select
                value={benefitFilter}
                onChange={(e) => setBenefitFilter(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#B90013]"
              >
                <option value="Tất cả">Tất cả quyền lợi</option>
                <option value="Điểm rèn luyện">Có cộng Điểm rèn luyện</option>
                <option value="Có chứng nhận">Có cấp Giấy chứng nhận (Certificate)</option>
              </select>
            </div>

            {/* Filter 4: Quick Reset */}
            <div className="space-y-1.5 flex flex-col justify-end">
              <button
                onClick={resetAllFilters}
                className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition-colors"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          </div>
        )}

        {/* Active Filter Chips Bar */}
        {activeChips.length > 0 && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400">Đang lọc theo:</span>
            {activeChips.map((chip, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-[#B90013] text-xs font-bold border border-red-100"
              >
                <span>{chip.label}</span>
                <button
                  onClick={chip.onRemove}
                  className="hover:bg-red-100 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              onClick={resetAllFilters}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 underline ml-2"
            >
              Xóa tất cả
            </button>
          </div>
        )}
      </div>

      {/* Results Meta Info */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Hiển thị <strong>{filteredEvents.length}</strong> sự kiện phù hợp
        </span>
        <span className="text-slate-400">
          Dữ liệu cập nhật liên tục từ PTIT Career Hub & Phòng CTSV
        </span>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-50 text-[#B90013] flex items-center justify-center mx-auto text-2xl">
            🔍
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-[#131B2E]">
              Không tìm thấy sự kiện phù hợp
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Không có sự kiện nào khớp với tiêu chí tìm kiếm hoặc bộ lọc hiện tại của bạn. Hãy thử thay đổi từ khóa hoặc thiết lập lại bộ lọc.
            </p>
          </div>
          <button
            onClick={resetAllFilters}
            className="px-5 py-2.5 rounded-xl bg-[#B90013] text-white font-bold text-xs hover:bg-[#A30010] transition-colors"
          >
            Thiết lập lại bộ lọc
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => {
                onSelectEventDetail(event);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-[0_4px_20px_rgba(15,23,42,0.04)] hover:shadow-md hover:border-red-200 transition-all flex flex-col justify-between space-y-5 cursor-pointer group"
            >
              <div className="space-y-4">
                {/* Event Top Bar */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    {/* Date Badge Box */}
                    <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#B90013] flex flex-col items-center justify-center shrink-0 border border-red-100 group-hover:bg-[#B90013] group-hover:text-white transition-colors">
                      <span className="text-[10px] font-black uppercase leading-none">
                        {event.month}
                      </span>
                      <span className="text-xl font-black leading-none mt-1">
                        {event.day}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-full">
                          {event.eventType}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full flex items-center gap-1">
                          {event.isOnline ? <Video className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                          {event.format || (event.isOnline ? 'Online' : 'Offline')}
                        </span>
                        {event.trainingPoints && (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold rounded-full">
                            +{event.trainingPoints}đ Rèn luyện
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-[#131B2E] mt-1.5 leading-snug group-hover:text-[#B90013] transition-colors line-clamp-2">
                        {event.title}
                      </h3>

                      {isEventMatchedToTendency(event) && (
                        <div className="pt-1.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">
                            <Sparkles className="w-3 h-3 text-purple-600" />
                            Phù hợp với xu hướng nghề nghiệp của bạn
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bookmark Button */}
                  <button
                    onClick={(e) => handleToggleSaveEvent(e, event.id)}
                    className={`p-2.5 rounded-xl border transition-all shrink-0 cursor-pointer ${
                      event.isSaved
                        ? 'bg-red-50 border-red-200 text-[#B90013]'
                        : 'border-slate-200 text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-50'
                    }`}
                    title={event.isSaved ? 'Đã lưu sự kiện' : 'Lưu sự kiện'}
                  >
                    <Bookmark className={`w-4 h-4 ${event.isSaved ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Event Details Meta Box */}
                <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      Đơn vị: <strong>{event.organizer}</strong>
                    </span>
                  </div>
                </div>

                {/* Description Snippet */}
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {event.description}
                </p>

                {/* Related Skills */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap gap-1.5">
                    {event.relatedSkills.slice(0, 3).map((sk) => (
                      <span
                        key={sk}
                        className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-[11px] font-semibold border border-purple-100"
                      >
                        {sk}
                      </span>
                    ))}
                    {event.relatedSkills.length > 3 && (
                      <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-semibold">
                        +{event.relatedSkills.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Thanh Thêm vào My Task */}
                <div className="pt-2">
                  {taskEventIds.has(event.id) ? (
                    <div className="w-full flex items-center gap-2">
                      <button
                        id={`btn-event-task-${event.id}`}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate('my-tasks');
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs group/taskbtn"
                        title="Sự kiện đã có trong My Tasks. Nhấn để mở danh sách task"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate">Đã thêm vào My Tasks • Mở task</span>
                        <ArrowRight className="w-3.5 h-3.5 text-emerald-700 group-hover/taskbtn:translate-x-0.5 transition-transform shrink-0" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleRemoveTaskForEvent(e, event.id)}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 hover:border-red-200 transition-colors cursor-pointer shrink-0"
                        title="Gỡ sự kiện này khỏi My Tasks"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      id={`btn-event-task-${event.id}`}
                      type="button"
                      onClick={(e) => handleToggleAddTask(e, event)}
                      className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-red-50 via-white to-amber-50/70 hover:from-[#B90013] hover:to-[#A30010] text-[#B90013] hover:text-white border border-red-200 hover:border-[#B90013] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-[0.99] group/btn"
                      title="Thêm sự kiện này vào danh sách My Tasks để theo dõi và nhắc nhở"
                    >
                      <CalendarPlus className="w-4 h-4 text-[#B90013] group-hover/btn:text-white transition-colors shrink-0" />
                      <span>Thêm vào My Tasks</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Bottom Action Row */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400">
                  Nguồn: {event.source}
                </span>

                <div className="flex items-center gap-1.5 text-xs font-bold text-[#B90013] group-hover:translate-x-0.5 transition-transform">
                  <span>Xem chi tiết sự kiện</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
