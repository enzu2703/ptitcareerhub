import React, { useState, useRef, useEffect } from 'react';
import { Logo } from './Logo';
import { ScreenView, UserAuth, NotificationItem } from '../types';
import {
  Search,
  Sparkles,
  Briefcase,
  Calendar,
  Compass,
  User,
  Bell,
  CheckCircle2,
  Menu,
  X,
  LogOut,
  Bookmark,
  FileText,
  ArrowRight,
} from 'lucide-react';

interface HeaderProps {
  currentView: ScreenView;
  onNavigate: (view: ScreenView) => void;
  auth: UserAuth;
  onOpenLogin: () => void;
  onLogout: () => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onOpenOrientationModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  auth,
  onOpenLogin,
  onLogout,
  notifications,
  onMarkNotificationRead,
  searchTerm,
  onSearchChange,
  onOpenOrientationModal,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Hide global header in standalone quiz or admin dashboard
  if (
    currentView === 'assessment-quiz' ||
    currentView === 'admin' ||
    currentView === 'admin-dashboard' ||
    currentView === 'admin-jobs' ||
    currentView === 'admin-events' ||
    currentView === 'admin-users' ||
    currentView === 'admin-analytics'
  ) {
    return null;
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navLinks: { label: string; view: ScreenView; icon?: React.ReactNode; isAI?: boolean; highlight?: boolean }[] = [
    { label: 'Trang chủ', view: 'home' },
    { label: 'Career Map', view: 'roadmap' },
    { label: 'Việc làm', view: 'jobs' },
    { label: 'Sự kiện', view: 'events' },
    {
      label: 'AI CV',
      view: 'cv-builder',
      icon: <Sparkles className="w-3.5 h-3.5 text-purple-600" />,
      isAI: true,
    },
    {
      label: 'My Tasks',
      view: 'my-tasks',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.03)] font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-[1360px] mx-auto px-3 sm:px-5 lg:px-7 h-18 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate('home')}
          className="cursor-pointer transition-transform hover:opacity-95 shrink-0"
        >
          <Logo />
        </div>

        {/* Primary Desktop & Tablet Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
          {navLinks.map((link) => {
            const isActive = currentView === link.view;

            return (
              <button
                key={link.label}
                onClick={() => onNavigate(link.view)}
                className={`relative px-2.5 lg:px-3 py-2 rounded-xl text-xs sm:text-[13px] font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'text-[#B90013] font-bold bg-red-50/70 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                } ${link.isAI ? 'hover:text-purple-700' : ''}`}
              >
                {link.icon}
                <span>{link.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-2.5 right-2.5 h-0.5 bg-[#B90013] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User / Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {auth.isLoggedIn ? (
            <>
              {/* Notifications Dropdown (Bell) */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
                  title="Thông báo"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#B90013] rounded-full ring-2 ring-white"></span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 px-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800">Thông báo</span>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 bg-red-50 text-[#B90013] rounded-full text-[10px] font-bold">
                            {unreadCount} mới
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => notifications.forEach((n) => onMarkNotificationRead(n.id))}
                        className="text-xs text-[#B90013] font-medium hover:underline"
                      >
                        Đánh dấu tất cả đã đọc
                      </button>
                    </div>

                    <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            onMarkNotificationRead(notif.id);
                            if (notif.linkView) {
                              onNavigate(notif.linkView);
                              setShowNotifications(false);
                            }
                          }}
                          className={`p-3 rounded-xl border transition-all cursor-pointer ${
                            notif.read
                              ? 'bg-slate-50/70 border-slate-100 text-slate-600'
                              : 'bg-[#FAF8FF] border-purple-100 text-slate-900 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-xs text-[#131B2E]">{notif.title}</h4>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">
                              {notif.timeAgo}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {notif.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Dropdown */}
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2.5 p-1 pl-3 pr-1.5 rounded-full border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all"
                >
                  <span className="text-xs font-bold text-slate-800 hidden sm:inline">
                    {auth.name}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#B90013] to-red-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {auth.avatarLetter}
                  </div>
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 py-2.5 px-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-1">
                    <div className="px-2 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-bold text-slate-900 truncate">{auth.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{auth.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        onNavigate('my-career');
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <User className="w-4 h-4 text-slate-500" />
                      <span>Hồ sơ của tôi</span>
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('roadmap');
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <Compass className="w-4 h-4 text-slate-500" />
                      <span>Tiến độ nghề nghiệp</span>
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('cv-builder');
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-slate-500" />
                        <span>CV của tôi</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full">
                        3/6
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('my-tasks');
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-slate-500" />
                      <span>Nhiệm vụ của tôi</span>
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('saved-jobs');
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <Bookmark className="w-4 h-4 text-slate-500" />
                      <span>Việc làm đã lưu</span>
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('saved-events');
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span>Sự kiện đã lưu</span>
                    </button>

                    {/* Dedicated 'Tính năng thêm' Section */}
                    <div className="pt-2 border-t border-slate-100 my-1">
                      <div className="px-2 pb-1.5 flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          Tính năng thêm
                        </span>
                        <span className="text-[9px] font-bold text-[#B90013] bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                          Định hướng
                        </span>
                      </div>
                      <div className="space-y-1">
                        <button
                          onClick={() => {
                            onNavigate('assessment-intro');
                            setShowUserDropdown(false);
                          }}
                          className="w-full flex items-center justify-between px-2.5 py-2.5 rounded-xl text-xs font-bold text-[#B90013] bg-red-50/70 hover:bg-red-100 transition-colors cursor-pointer text-left"
                        >
                          <div className="flex items-center gap-2">
                            <Compass className="w-4 h-4 text-[#B90013] shrink-0" />
                            <span>Career Check</span>
                          </div>
                          <span className="text-[10px] font-semibold px-2 py-0.5 bg-white text-[#B90013] rounded-full border border-red-200 shrink-0">
                            10 câu hỏi
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="pt-1 border-t border-slate-100 mt-1">
                      <button
                        onClick={() => {
                          onLogout();
                          setShowUserDropdown(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Logged Out State: Single Clear Đăng nhập button */
            <button
              onClick={onOpenLogin}
              className="bg-[#B90013] hover:bg-[#A30010] text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <span>Đăng nhập</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Mobile menu hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
            title="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-5 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm nghề nghiệp, việc làm..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => {
                  onNavigate(link.view);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
                  currentView === link.view
                    ? 'bg-red-50 text-[#B90013] font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </button>
            ))}
          </div>

          {!auth.isLoggedIn ? (
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  onOpenLogin();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 text-center text-xs font-bold bg-[#B90013] text-white rounded-xl shadow-xs"
              >
                Đăng nhập tài khoản PTIT
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-100 space-y-1">
              <button
                onClick={() => {
                  onNavigate('my-career');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <User className="w-4 h-4 text-slate-500" />
                <span>Góc sinh viên: {auth.name}</span>
              </button>

              {/* Tính năng thêm (Mobile) */}
              <div className="pt-1.5 pb-1 px-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Tính năng thêm
                </span>
                <div className="mt-1 space-y-1">
                  <button
                    onClick={() => {
                      onNavigate('assessment-intro');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-[#B90013] bg-red-50/70 hover:bg-red-100 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Compass className="w-4 h-4 text-[#B90013]" />
                      <span>Career Check</span>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-white text-[#B90013] rounded-full border border-red-200">
                      10 câu hỏi
                    </span>
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
