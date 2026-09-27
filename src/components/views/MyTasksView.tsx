import React, { useState, useEffect, useMemo } from 'react';
import { ScreenView, UserProfileState } from '../../types';
import { trackEvent } from '../../utils/analytics';
import {
  CheckCircle2,
  Circle,
  Plus,
  Compass,
  ArrowRight,
  Sparkles,
  Filter,
  Calendar,
  Clock,
  Target,
  FileText,
  Briefcase,
  Layers,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Link2,
  ExternalLink,
  CalendarRange,
  Globe,
  X,
  Trash2,
  Check,
  GripVertical,
  Edit3,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MyTasksViewProps {
  onNavigate: (view: ScreenView) => void;
  userProfile: UserProfileState;
  onUpdateUserProfile?: (updated: Partial<UserProfileState>) => void;
}

interface CareerTask {
  id: string;
  title: string;
  description: string;
  category: 'roadmap' | 'cv' | 'application' | 'learning';
  priority: 'high' | 'medium' | 'normal';
  dueDate: string;
  startDate?: string;
  endDate?: string;
  externalLink?: string;
  completed: boolean;
  linkedView?: ScreenView;
  actionText?: string;
}

const TASKS_STORAGE_KEY = 'ptit_career_hub_tasks_v2';

const padZero = (n: number) => (n < 10 ? `0${n}` : `${n}`);

const toIsoDate = (d: Date) =>
  `${d.getFullYear()}-${padZero(d.getMonth() + 1)}-${padZero(d.getDate())}`;

const formatVnDate = (iso: string) => {
  if (!iso) return '';
  const parts = iso.split('-');
  if (parts.length !== 3) return iso;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

export const MyTasksView: React.FC<MyTasksViewProps> = ({
  onNavigate,
  userProfile,
  onUpdateUserProfile,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Check if target goal is set or has been cleared
  const hasTargetGoal = useMemo(() => {
    try {
      if (localStorage.getItem('ptit_target_job_cleared') === 'true') {
        return false;
      }
    } catch {}

    const title = userProfile?.targetJobTitle?.trim();
    if (title && title !== '' && title !== 'Chưa có' && title !== 'Chưa định hướng') {
      return true;
    }

    const direction = userProfile?.careerDirection?.trim();
    if (direction && direction !== '' && direction !== 'Chưa có' && direction !== 'Chưa định hướng') {
      return true;
    }

    return false;
  }, [userProfile?.targetJobTitle, userProfile?.careerDirection]);

  const targetGoalTitle = useMemo(() => {
    if (!hasTargetGoal) return 'Chưa có';
    return userProfile?.targetJobTitle || userProfile?.careerDirection || 'Chưa có';
  }, [hasTargetGoal, userProfile?.targetJobTitle, userProfile?.careerDirection]);

  const handleRemoveTargetGoal = () => {
    try {
      localStorage.setItem('ptit_target_job_cleared', 'true');
      localStorage.removeItem('ptit_selected_target_job_id');
    } catch {}

    if (onUpdateUserProfile) {
      onUpdateUserProfile({
        targetJobTitle: '',
        targetJobId: '',
        targetJobCompany: '',
        targetJobSalary: '',
        targetJobLocation: '',
        targetJobRequiredSkills: [],
        targetJobDescription: '',
        careerDirection: '',
        skillGap: null,
      });
    }
  };

  // Form states for new or edit task
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<'roadmap' | 'cv' | 'application' | 'learning'>('roadmap');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'normal'>('medium');
  const [newTaskLink, setNewTaskLink] = useState('');

  // Drag and drop reorder states
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'above' | 'below'>('above');

  // Date selection states
  const [dateMode, setDateMode] = useState<'single' | 'range'>('single');
  const todayStr = useMemo(() => toIsoDate(new Date()), []);
  const [selectedDate, setSelectedDate] = useState<string>(() => toIsoDate(new Date()));
  const [startDate, setStartDate] = useState<string>(() => toIsoDate(new Date()));
  const [endDate, setEndDate] = useState<string>('');

  // Mini calendar navigation
  const [calYear, setCalYear] = useState<number>(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState<number>(() => new Date().getMonth());

  // Listen for prefilled task navigation from Roadmap or Career Check
  useEffect(() => {
    try {
      const pendingStr = sessionStorage.getItem('ptit_pending_new_task');
      if (pendingStr) {
        const item = JSON.parse(pendingStr);
        if (item.title) setNewTaskTitle(item.title);
        if (item.description) setNewTaskDescription(item.description);
        if (item.category) setNewTaskCategory(item.category);
        if (item.priority) setNewTaskPriority(item.priority);
        if (item.externalLink) setNewTaskLink(item.externalLink);
        if (item.startDate) {
          setStartDate(item.startDate);
          setSelectedDate(item.startDate);
        }
        if (item.endDate) {
          setEndDate(item.endDate);
          setDateMode('range');
        } else {
          setDateMode('single');
        }
        setShowAddModal(true);
        sessionStorage.removeItem('ptit_pending_new_task');
      }
    } catch {
      // silent
    }
  }, []);

  // Tasks state with LocalStorage persistence
  const [tasks, setTasks] = useState<CareerTask[]>(() => {
    try {
      const saved = localStorage.getItem(TASKS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }

    return [
      {
        id: 'task-1',
        title: 'Hoàn thành bài viết SEO & Kế hoạch Content mẫu',
        description: 'Tạo 1 bài viết chuẩn SEO 1,200 từ cho câu lạc bộ hoặc fanpage sinh viên PTIT.',
        category: 'roadmap',
        priority: 'high',
        dueDate: '15/09 - 20/09/2026',
        startDate: '2026-09-15',
        endDate: '2026-09-20',
        externalLink: 'https://ptit.edu.vn',
        completed: true,
        linkedView: 'roadmap',
        actionText: 'Xem Lộ trình',
      },
      {
        id: 'task-2',
        title: 'Tối ưu hóa CV chuẩn ATS với AI CV Builder',
        description: `Bổ sung các từ khóa cốt lõi cho vị trí ${userProfile.careerDirection || 'Digital Marketing'} và tải bản PDF chuẩn.`,
        category: 'cv',
        priority: 'high',
        dueDate: 'Trước 25/10/2026',
        startDate: '2026-10-25',
        externalLink: 'https://careerhub.ptit.edu.vn/cv-templates',
        completed: false,
        linkedView: 'cv-builder',
        actionText: 'Mở AI CV Builder',
      },
      {
        id: 'task-3',
        title: 'Đăng ký Workshop Kết nối Tuyển dụng Doanh nghiệp PTIT',
        description: 'Tham gia buổi chia sẻ kỹ năng phỏng vấn cùng chuyên gia nhân sự từ VNPT / Viettel.',
        category: 'learning',
        priority: 'medium',
        dueDate: '28/10/2026',
        startDate: '2026-10-28',
        externalLink: 'https://facebook.com/ptitcareer',
        completed: false,
        linkedView: 'events',
        actionText: 'Xem Sự kiện',
      },
      {
        id: 'task-4',
        title: 'Nộp hồ sơ ứng tuyển 2 vị trí Thực tập sinh ưu tiên',
        description: `Lựa chọn các vị trí Intern phù hợp với ngành ${userProfile.major} trên cổng việc làm.`,
        category: 'application',
        priority: 'medium',
        dueDate: '15/09 - 30/09/2026',
        startDate: '2026-09-15',
        endDate: '2026-09-30',
        completed: false,
        linkedView: 'jobs',
        actionText: 'Khám phá việc làm',
      },
      {
        id: 'task-5',
        title: 'Luyện tập kỹ năng đọc báo cáo Google Analytics 4',
        description: 'Hoàn thành module phân tích dữ liệu để thu hẹp khoảng cách kỹ năng (Skill Gap).',
        category: 'learning',
        priority: 'normal',
        dueDate: '30/10/2026',
        startDate: '2026-10-30',
        externalLink: 'https://skillshop.exceedlms.com',
        completed: false,
      },
    ];
  });

  // Sync tasks to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // silent
    }
  }, [tasks]);

  // Listen for storage / custom event updates so task list stays updated in real time
  useEffect(() => {
    const handleTasksUpdated = () => {
      try {
        const saved = localStorage.getItem(TASKS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setTasks(parsed);
          }
        }
      } catch {}
    };

    window.addEventListener('storage', handleTasksUpdated);
    window.addEventListener('ptit_tasks_updated', handleTasksUpdated);
    return () => {
      window.removeEventListener('storage', handleTasksUpdated);
      window.removeEventListener('ptit_tasks_updated', handleTasksUpdated);
    };
  }, []);

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextState = !t.completed;
          if (nextState) {
            try {
              confetti({
                particleCount: 40,
                spread: 50,
                origin: { y: 0.6 },
              });
            } catch {
              // silent
            }
            trackEvent('todo_complete', { taskId });
          }
          return { ...t, completed: nextState };
        }
        return t;
      })
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => {
      const updated = prev.filter((t) => t.id !== taskId);
      try {
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(
          new CustomEvent('ptit_tasks_updated', { detail: { taskId, action: 'deleted' } })
        );
      } catch {}
      return updated;
    });
  };

  // Calendar month navigation
  const handlePrevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else {
      setCalMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else {
      setCalMonth((m) => m + 1);
    }
  };

  // Calendar days generation
  const calendarGrid = useMemo(() => {
    const daysInCurrentMonth = new Date(calYear, calMonth + 1, 0).getDate();
    // Monday as first day: 0=Mon, 1=Tue ... 6=Sun
    const firstDayIndex = (new Date(calYear, calMonth, 1).getDay() + 6) % 7;
    const daysInPrevMonth = new Date(calYear, calMonth, 0).getDate();

    const cells: Array<{
      day: number;
      isoDate: string;
      isCurrentMonth: boolean;
    }> = [];

    // Leading days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevMonth = calMonth === 0 ? 11 : calMonth - 1;
      const prevYear = calMonth === 0 ? calYear - 1 : calYear;
      cells.push({
        day: d,
        isoDate: `${prevYear}-${padZero(prevMonth + 1)}-${padZero(d)}`,
        isCurrentMonth: false,
      });
    }

    // Days in current month
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      cells.push({
        day: d,
        isoDate: `${calYear}-${padZero(calMonth + 1)}-${padZero(d)}`,
        isCurrentMonth: true,
      });
    }

    // Trailing days to fill out grid (up to multiple of 7)
    const totalSlots = Math.ceil(cells.length / 7) * 7;
    const remaining = totalSlots - cells.length;
    const nextMonth = calMonth === 11 ? 0 : calMonth + 1;
    const nextYear = calMonth === 11 ? calYear + 1 : calYear;
    for (let d = 1; d <= remaining; d++) {
      cells.push({
        day: d,
        isoDate: `${nextYear}-${padZero(nextMonth + 1)}-${padZero(d)}`,
        isCurrentMonth: false,
      });
    }

    return cells;
  }, [calYear, calMonth]);

  // Handle clicking a calendar day
  const handleDayClick = (isoDate: string) => {
    if (dateMode === 'single') {
      setSelectedDate(isoDate);
      setStartDate(isoDate);
      setEndDate('');
    } else {
      // Range mode
      if (!startDate || (startDate && endDate)) {
        setStartDate(isoDate);
        setEndDate('');
      } else {
        if (isoDate < startDate) {
          setStartDate(isoDate);
          setEndDate('');
        } else {
          setEndDate(isoDate);
        }
      }
    }
  };

  // Preset shortcut selections
  const handleSelectPreset = (preset: 'today' | 'tomorrow' | 'this_week' | 'next_week' | 'end_month') => {
    const now = new Date();
    const todayIso = toIsoDate(now);

    if (preset === 'today') {
      setDateMode('single');
      setSelectedDate(todayIso);
      setStartDate(todayIso);
      setEndDate('');
      setCalYear(now.getFullYear());
      setCalMonth(now.getMonth());
    } else if (preset === 'tomorrow') {
      setDateMode('single');
      const tm = new Date(now);
      tm.setDate(tm.getDate() + 1);
      const tmIso = toIsoDate(tm);
      setSelectedDate(tmIso);
      setStartDate(tmIso);
      setEndDate('');
      setCalYear(tm.getFullYear());
      setCalMonth(tm.getMonth());
    } else if (preset === 'this_week') {
      setDateMode('range');
      const curr = new Date(now);
      const day = curr.getDay();
      const diffToSun = day === 0 ? 0 : 7 - day;
      const sun = new Date(curr);
      sun.setDate(curr.getDate() + diffToSun);
      setStartDate(todayIso);
      setEndDate(toIsoDate(sun));
      setCalYear(now.getFullYear());
      setCalMonth(now.getMonth());
    } else if (preset === 'next_week') {
      setDateMode('range');
      const curr = new Date(now);
      const day = curr.getDay();
      const daysToNextMon = day === 0 ? 1 : 8 - day;
      const nextMon = new Date(curr);
      nextMon.setDate(curr.getDate() + daysToNextMon);
      const nextSun = new Date(nextMon);
      nextSun.setDate(nextMon.getDate() + 6);
      setStartDate(toIsoDate(nextMon));
      setEndDate(toIsoDate(nextSun));
      setCalYear(nextMon.getFullYear());
      setCalMonth(nextMon.getMonth());
    } else if (preset === 'end_month') {
      setDateMode('range');
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setStartDate(todayIso);
      setEndDate(toIsoDate(endOfMonth));
      setCalYear(now.getFullYear());
      setCalMonth(now.getMonth());
    }
  };

  // Formatted display for chosen time
  const formattedChosenDate = useMemo(() => {
    if (dateMode === 'single') {
      return selectedDate ? formatVnDate(selectedDate) : 'Chưa chọn';
    } else {
      if (startDate && endDate) {
        return `${formatVnDate(startDate)} - ${formatVnDate(endDate)}`;
      } else if (startDate) {
        return `Từ ${formatVnDate(startDate)} (chọn ngày kết thúc)`;
      }
      return 'Chưa chọn khoảng ngày';
    }
  }, [dateMode, selectedDate, startDate, endDate]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingTaskId(null);
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskCategory('roadmap');
    setNewTaskPriority('medium');
    setNewTaskLink('');
    setDateMode('single');
    setSelectedDate(todayStr);
    setStartDate(todayStr);
    setEndDate('');
    setShowAddModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (task: CareerTask) => {
    setEditingTaskId(task.id);
    setNewTaskTitle(task.title);
    setNewTaskDescription(task.description || '');
    setNewTaskCategory(task.category);
    setNewTaskPriority(task.priority);
    setNewTaskLink(task.externalLink || '');

    if (task.startDate && task.endDate) {
      setDateMode('range');
      setStartDate(task.startDate);
      setEndDate(task.endDate);
      setSelectedDate(task.startDate);
    } else if (task.startDate) {
      setDateMode('single');
      setSelectedDate(task.startDate);
      setStartDate(task.startDate);
      setEndDate('');
    } else {
      setDateMode('single');
      setSelectedDate(todayStr);
      setStartDate(todayStr);
      setEndDate('');
    }
    setShowAddModal(true);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedTaskId === id) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const isAbove = offsetY < rect.height / 2;

    if (dragOverTaskId !== id || dropPosition !== (isAbove ? 'above' : 'below')) {
      setDragOverTaskId(id);
      setDropPosition(isAbove ? 'above' : 'below');
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedTaskId || draggedTaskId === targetId) {
      setDraggedTaskId(null);
      setDragOverTaskId(null);
      return;
    }

    setTasks((prev) => {
      const fromIdx = prev.findIndex((t) => t.id === draggedTaskId);
      const toIdx = prev.findIndex((t) => t.id === targetId);
      if (fromIdx === -1 || toIdx === -1) return prev;

      const updated = [...prev];
      const [movedItem] = updated.splice(fromIdx, 1);

      let newToIdx = updated.findIndex((t) => t.id === targetId);
      if (dropPosition === 'below') {
        newToIdx += 1;
      }
      updated.splice(newToIdx, 0, movedItem);
      return updated;
    });

    setDraggedTaskId(null);
    setDragOverTaskId(null);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverTaskId(null);
  };

  const handleMoveTask = (id: string, direction: 'up' | 'down') => {
    setTasks((prev) => {
      const idx = prev.findIndex((t) => t.id === id);
      if (idx === -1) return prev;
      if (direction === 'up' && idx === 0) return prev;
      if (direction === 'down' && idx === prev.length - 1) return prev;

      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      const updated = [...prev];
      const temp = updated[idx];
      updated[idx] = updated[targetIdx];
      updated[targetIdx] = temp;
      return updated;
    });
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    let computedDueDate = 'Hôm nay';
    if (dateMode === 'single') {
      computedDueDate = selectedDate ? formatVnDate(selectedDate) : 'Sớm nhất';
    } else {
      if (startDate && endDate) {
        computedDueDate = `${formatVnDate(startDate)} - ${formatVnDate(endDate)}`;
      } else if (startDate) {
        computedDueDate = `Từ ${formatVnDate(startDate)}`;
      }
    }

    let link = newTaskLink.trim();
    if (link && !/^https?:\/\//i.test(link)) {
      link = 'https://' + link;
    }

    if (editingTaskId) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTaskId
            ? {
                ...t,
                title: newTaskTitle.trim(),
                description: newTaskDescription.trim(),
                category: newTaskCategory,
                priority: newTaskPriority,
                dueDate: computedDueDate,
                startDate: dateMode === 'single' ? selectedDate : startDate,
                endDate: dateMode === 'range' ? endDate : undefined,
                externalLink: link || undefined,
              }
            : t
        )
      );
      trackEvent('todo_update', { category: newTaskCategory, priority: newTaskPriority });
    } else {
      const created: CareerTask = {
        id: `task-${Date.now()}`,
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim() || 'Nhiệm vụ cá nhân tự đặt mục tiêu thực hiện.',
        category: newTaskCategory,
        priority: newTaskPriority,
        dueDate: computedDueDate,
        startDate: dateMode === 'single' ? selectedDate : startDate,
        endDate: dateMode === 'range' ? endDate : undefined,
        externalLink: link || undefined,
        completed: false,
      };

      setTasks((prev) => [created, ...prev]);
      trackEvent('todo_create', { category: newTaskCategory, priority: newTaskPriority });
    }

    // Reset form
    setEditingTaskId(null);
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskLink('');
    setShowAddModal(false);
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100) || 0;

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-[#B90013] text-xs font-bold mb-2 border border-red-100">
            <Target className="w-3.5 h-3.5" />
            <span>Kế hoạch hành động theo lộ trình</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#131B2E]">
            My Tasks (Danh sách hành động)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {hasTargetGoal ? (
              <>
                Các đầu việc trọng tâm giúp sinh viên {userProfile.major} ({userProfile.academicYear}) đạt mục tiêu{' '}
                <strong className="text-slate-800">{targetGoalTitle}</strong>.
              </>
            ) : (
              <>
                Các đầu việc trọng tâm giúp sinh viên {userProfile.major} ({userProfile.academicYear}) rèn luyện kỹ năng và chuẩn bị nghề nghiệp (Mục tiêu định hướng: <strong className="text-amber-700">Chưa có</strong>).
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAddModal}
            className="bg-[#B90013] hover:bg-[#A30010] text-white font-bold px-4 py-2.5 rounded-xl shadow-xs text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm nhiệm vụ</span>
          </button>
        </div>
      </div>

      {/* Progress & Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(15,23,42,0.04)] space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Tiến độ hoàn thành
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-[#B90013]">{progressPercent}%</span>
            <span className="text-xs font-semibold text-slate-500">
              {completedCount}/{tasks.length} đầu việc
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#B90013] h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(15,23,42,0.04)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Mục tiêu định hướng
            </span>
            {hasTargetGoal && (
              <button
                onClick={handleRemoveTargetGoal}
                className="text-[11px] font-semibold text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                title="Gỡ bỏ mục tiêu định hướng này"
              >
                Gỡ bỏ
              </button>
            )}
          </div>

          {hasTargetGoal ? (
            <>
              <p className="text-lg font-extrabold text-[#131B2E] truncate" title={targetGoalTitle}>
                {targetGoalTitle}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Compass className="w-3.5 h-3.5 text-[#B90013]" />
                <span>{userProfile.careerCheckCompleted ? 'Đã làm Career Check' : 'Dựa trên JD đã chọn'}</span>
              </div>
            </>
          ) : (
            <>
              <p className="text-lg font-extrabold text-amber-600">
                Chưa có
              </p>
              <button
                onClick={() => onNavigate('jobs')}
                className="flex items-center gap-1.5 text-xs text-[#B90013] hover:underline font-bold cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-[#B90013]" />
                <span>Chọn mục tiêu từ việc làm</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả ({tasks.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'pending'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cần làm ({tasks.length - completedCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'completed'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Đã xong ({completedCount})
          </button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">Không có nhiệm vụ nào trong mục này</h3>
            <p className="text-xs text-slate-500">Tất cả các đầu việc hiện tại đã được giải quyết hoặc chưa tạo mới.</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              draggable
              onDragStart={(e) => handleDragStart(e, task.id)}
              onDragOver={(e) => handleDragOver(e, task.id)}
              onDrop={(e) => handleDrop(e, task.id)}
              onDragEnd={handleDragEnd}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                draggedTaskId === task.id
                  ? 'opacity-40 bg-purple-50/70 border-purple-300 scale-[0.99]'
                  : dragOverTaskId === task.id
                  ? dropPosition === 'above'
                    ? 'border-t-4 border-t-purple-600 bg-purple-50/20'
                    : 'border-b-4 border-b-purple-600 bg-purple-50/20'
                  : task.completed
                  ? 'bg-slate-50/70 border-slate-200/60 opacity-80'
                  : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div className="flex items-start gap-2.5 sm:gap-3 flex-1 min-w-0">
                {/* Drag Handle & Up/Down reorder */}
                <div className="flex flex-col items-center shrink-0 -ml-1 text-slate-300 group-hover:text-slate-500">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveTask(task.id, 'up');
                    }}
                    className="p-0.5 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                    title="Chuyển lên trên"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <div
                    className="cursor-grab active:cursor-grabbing p-0.5 hover:text-slate-800 transition-colors"
                    title="Kéo thả lên/xuống để đổi thứ tự nhiệm vụ"
                  >
                    <GripVertical className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveTask(task.id, 'down');
                    }}
                    className="p-0.5 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                    title="Chuyển xuống dưới"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => handleToggleTask(task.id)}
                  className="mt-1.5 text-slate-400 hover:text-[#B90013] transition-colors shrink-0 cursor-pointer"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 hover:text-[#B90013]" />
                  )}
                </button>

                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4
                      className={`text-sm sm:text-base font-bold text-[#131B2E] ${
                        task.completed ? 'line-through text-slate-400' : ''
                      }`}
                    >
                      {task.title}
                    </h4>
                    {task.priority === 'high' && !task.completed && (
                      <span className="px-2 py-0.5 rounded-md bg-red-50 text-[#B90013] text-[10px] font-extrabold border border-red-100">
                        Ưu tiên cao
                      </span>
                    )}
                    {task.priority === 'medium' && !task.completed && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-100">
                        Trung bình
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                    {task.description}
                  </p>

                  {/* Meta Details: Dates (external link removed as requested) */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 pt-0.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                      <Calendar className="w-3 h-3 text-[#B90013]" />
                      <span>{task.dueDate}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center sm:justify-end gap-2 shrink-0 pl-10 sm:pl-0">
                {task.externalLink && !task.completed && (
                  <a
                    href={task.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors flex items-center gap-1.5 border border-blue-200 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>Mở link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}

                {task.linkedView && !task.completed && (
                  <button
                    onClick={() => {
                      if (task.linkedView) onNavigate(task.linkedView);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-[#B90013] font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200"
                  >
                    <span>{task.actionText || 'Mở'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Edit Task Button */}
                <button
                  onClick={() => handleOpenEditModal(task)}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                  title="Chỉnh sửa thông tin nhiệm vụ"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                  title="Xóa nhiệm vụ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Task Modal with Mini Calendar & Link */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 my-8 max-h-[90vh] overflow-y-auto space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <h3 className="text-lg font-extrabold text-[#131B2E] flex items-center gap-2">
                  {editingTaskId ? (
                    <>
                      <Edit3 className="w-5 h-5 text-blue-600" />
                      <span>Chỉnh sửa thông tin nhiệm vụ</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 text-[#B90013]" />
                      <span>Thêm nhiệm vụ sự nghiệp mới</span>
                    </>
                  )}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingTaskId
                    ? 'Cập nhật lại tiêu đề, mô tả, mức độ ưu tiên, ngày thực hiện hoặc liên kết'
                    : 'Lên kế hoạch, ấn định thời hạn và đính kèm tài liệu liên quan'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingTaskId(null);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4">
              {/* Tên nhiệm vụ */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Tên nhiệm vụ <span className="text-[#B90013]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Viết bài nghiên cứu, học khóa học Google Data Analytics..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#B90013] focus:ring-1 focus:ring-[#B90013]/20"
                />
              </div>

              {/* Mô tả chi tiết (tùy chọn) */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Ghi chú / Mô tả chi tiết
                </label>
                <input
                  type="text"
                  placeholder="VD: Đạt 80% điểm bài test, hoàn thiện slide thuyết trình..."
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#B90013] focus:ring-1 focus:ring-[#B90013]/20"
                />
              </div>

              {/* Nhóm mục tiêu & Mức độ ưu tiên */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nhóm mục tiêu
                  </label>
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium cursor-pointer focus:outline-none focus:border-[#B90013]"
                  >
                    <option value="roadmap">Theo Lộ trình (Roadmap)</option>
                    <option value="cv">Hồ sơ & CV (AI CV)</option>
                    <option value="application">Ứng tuyển việc làm (Jobs)</option>
                    <option value="learning">Học tập & Sự kiện (Events)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Mức độ ưu tiên
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium cursor-pointer focus:outline-none focus:border-[#B90013]"
                  >
                    <option value="high">Ưu tiên cao</option>
                    <option value="medium">Trung bình</option>
                    <option value="normal">Tiêu chuẩn</option>
                  </select>
                </div>
              </div>

              {/* Section Thời gian thực hiện (Lịch Mini & Khoảng ngày) */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#B90013]" />
                    <span>Thời gian thực hiện</span>
                  </label>

                  {/* Toggle Chọn 1 ngày vs Khoảng ngày */}
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setDateMode('single')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        dateMode === 'single'
                          ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      1 Ngày
                    </button>
                    <button
                      type="button"
                      onClick={() => setDateMode('range')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        dateMode === 'range'
                          ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Khoảng ngày
                    </button>
                  </div>
                </div>

                {/* Phím tắt nhanh */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="text-slate-400 text-[10px] mr-0.5">Chọn nhanh:</span>
                  <button
                    type="button"
                    onClick={() => handleSelectPreset('today')}
                    className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-red-50 hover:text-[#B90013] text-slate-600 font-medium transition-colors cursor-pointer"
                  >
                    Hôm nay
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPreset('tomorrow')}
                    className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-red-50 hover:text-[#B90013] text-slate-600 font-medium transition-colors cursor-pointer"
                  >
                    Ngày mai
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPreset('this_week')}
                    className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-red-50 hover:text-[#B90013] text-slate-600 font-medium transition-colors cursor-pointer"
                  >
                    Tuần này
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPreset('next_week')}
                    className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-red-50 hover:text-[#B90013] text-slate-600 font-medium transition-colors cursor-pointer"
                  >
                    Tuần tới
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPreset('end_month')}
                    className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-red-50 hover:text-[#B90013] text-slate-600 font-medium transition-colors cursor-pointer"
                  >
                    Cuối tháng
                  </button>
                </div>

                {/* Box Lịch Mini Tương Tác */}
                <div className="p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-2.5">
                  {/* Calendar Top Month Navigation */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Tháng {calMonth + 1}, {calYear}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={handlePrevMonth}
                        className="p-1 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                        title="Tháng trước"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextMonth}
                        className="p-1 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                        title="Tháng sau"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Day of week headers */}
                  <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400">
                    <span>T2</span>
                    <span>T3</span>
                    <span>T4</span>
                    <span>T5</span>
                    <span>T6</span>
                    <span>T7</span>
                    <span className="text-[#B90013]">CN</span>
                  </div>

                  {/* Grid cells */}
                  <div className="grid grid-cols-7 gap-1">
                    {calendarGrid.map((cell, idx) => {
                      const isToday = cell.isoDate === todayStr;
                      const isSelectedSingle = dateMode === 'single' && cell.isoDate === selectedDate;
                      const isRangeStart = dateMode === 'range' && cell.isoDate === startDate;
                      const isRangeEnd = dateMode === 'range' && cell.isoDate === endDate;
                      const isInRange =
                        dateMode === 'range' &&
                        startDate &&
                        endDate &&
                        cell.isoDate > startDate &&
                        cell.isoDate < endDate;

                      let cellStyle = 'hover:bg-slate-200 text-slate-700';

                      if (!cell.isCurrentMonth) {
                        cellStyle = 'text-slate-300 hover:bg-slate-100';
                      }

                      if (isSelectedSingle) {
                        cellStyle = 'bg-[#B90013] text-white font-bold shadow-xs scale-105';
                      } else if (isRangeStart && isRangeEnd) {
                        cellStyle = 'bg-[#B90013] text-white font-bold rounded-lg';
                      } else if (isRangeStart) {
                        cellStyle = 'bg-[#B90013] text-white font-bold rounded-l-lg';
                      } else if (isRangeEnd) {
                        cellStyle = 'bg-[#B90013] text-white font-bold rounded-r-lg';
                      } else if (isInRange) {
                        cellStyle = 'bg-red-100 text-[#B90013] font-bold rounded-none';
                      } else if (isToday && cell.isCurrentMonth) {
                        cellStyle = 'border border-[#B90013] text-[#B90013] font-bold';
                      }

                      return (
                        <button
                          key={`${cell.isoDate}-${idx}`}
                          type="button"
                          onClick={() => handleDayClick(cell.isoDate)}
                          className={`h-7 sm:h-8 flex items-center justify-center text-xs rounded-lg transition-all cursor-pointer ${cellStyle}`}
                        >
                          {cell.day}
                        </button>
                      );
                    })}
                  </div>

                  {/* Tóm tắt thời gian đã chọn */}
                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">
                      {dateMode === 'single' ? 'Ngày đã chọn:' : 'Khoảng ngày:'}
                    </span>
                    <span className="font-bold text-[#B90013] flex items-center gap-1">
                      {dateMode === 'single' ? (
                        <Calendar className="w-3.5 h-3.5" />
                      ) : (
                        <CalendarRange className="w-3.5 h-3.5" />
                      )}
                      {formattedChosenDate}
                    </span>
                  </div>
                </div>

                {/* Hoặc nhập tay bằng bộ chọn ngày native */}
                <div className="pt-1">
                  {dateMode === 'single' ? (
                    <div>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => {
                          setSelectedDate(e.target.value);
                          setStartDate(e.target.value);
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-[#B90013]"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Từ ngày:</span>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-[#B90013]"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Đến ngày:</span>
                        <input
                          type="date"
                          value={endDate}
                          min={startDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-[#B90013]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Section Link dẫn đính kèm */}
              <div className="pt-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                  <Link2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Link dẫn đính kèm (nếu có)</span>
                </label>
                <div className="relative flex items-center">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    type="url"
                    placeholder="https://... (Link khóa học, link JD tuyển dụng, tài liệu, sự kiện...)"
                    value={newTaskLink}
                    onChange={(e) => setNewTaskLink(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#B90013] focus:ring-1 focus:ring-[#B90013]/20"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Link sẽ hiển thị trực tiếp trên thẻ nhiệm vụ để bạn nhấp mở nhanh khi thực hiện.
                </p>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingTaskId(null);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#B90013] text-white hover:bg-[#A30010] shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingTaskId ? 'Lưu thay đổi' : 'Lưu nhiệm vụ'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
