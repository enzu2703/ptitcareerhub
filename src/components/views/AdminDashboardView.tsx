import React, { useState, useEffect } from 'react';
import { ScreenView, FirestoreEvent, UserProfileState } from '../../types';
import { Logo } from '../Logo';
import { loadAllEventsFromStorage } from '../../services/events/eventService';
import { loadAllUsersForAdmin } from '../../services/userService';
import { getAnalyticsMetrics } from '../../utils/analytics';
import { AdminOverviewTab } from '../admin/AdminOverviewTab';
import { AdminJobsTab } from '../admin/AdminJobsTab';
import { AdminEventsTab } from '../admin/AdminEventsTab';
import { AdminUsersTab } from '../admin/AdminUsersTab';
import { AdminAnalyticsTab } from '../admin/AdminAnalyticsTab';
import {
  Users,
  Briefcase,
  Calendar,
  BarChart3,
  TrendingUp,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  LogOut,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AdminDashboardViewProps {
  onNavigate: (view: ScreenView) => void;
  initialTab?: 'overview' | 'jobs' | 'events' | 'users' | 'analytics';
  onLogoutAdmin?: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  onNavigate,
  initialTab,
  onLogoutAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'users' | 'jobs' | 'events' | 'roadmaps' | 'templates' | 'analytics'
  >(initialTab || 'overview');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [notification, setNotification] = useState<string | null>(null);

  // Overall State for Admin Overview
  const [adminEvents, setAdminEvents] = useState<FirestoreEvent[]>([]);
  const [adminUsers, setAdminUsers] = useState<UserProfileState[]>([]);
  const [analyticsMetrics, setAnalyticsMetrics] = useState(getAnalyticsMetrics());
  const [hasLoadedOverview, setHasLoadedOverview] = useState(false);

  const refreshAllAdminData = async () => {
    try {
      const [eventsList, usersList] = await Promise.all([
        loadAllEventsFromStorage(),
        loadAllUsersForAdmin(),
      ]);
      setAdminEvents(eventsList);
      setAdminUsers(usersList);
      setAnalyticsMetrics(getAnalyticsMetrics());
      setHasLoadedOverview(true);
    } catch (err) {
      console.warn('Error refreshing admin overview data:', err);
    }
  };

  useEffect(() => {
    refreshAllAdminData();
  }, []);

  const showActionToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
    try {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
    } catch {
      // silent
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Admin Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Logo variant="compact" />
            <span className="px-2.5 py-0.5 bg-red-100 text-[#B90013] text-[11px] font-black rounded-md tracking-wider uppercase">
              Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (onLogoutAdmin) {
                  onLogoutAdmin();
                } else {
                  onNavigate('home');
                }
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
              title="Đăng xuất quyền quản trị"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Đăng xuất Admin</span>
            </button>

            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Về trang sinh viên</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Real-time System Banner */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-700">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Khu vực Quản trị Hệ thống (Admin Portal):</strong> Quản lý việc làm, sự kiện và tổng hợp báo cáo thời gian thực từ cơ sở dữ liệu Firestore.
            </span>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 whitespace-nowrap">
            Firestore & Interactions Active
          </span>
        </div>

        {notification && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* Admin Navigation Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-2 border-b border-slate-200">
          {[
            { id: 'overview', label: 'Tổng quan', icon: <TrendingUp className="w-4 h-4" /> },
            { id: 'jobs', label: 'Quản lý việc làm', icon: <Briefcase className="w-4 h-4" /> },
            { id: 'events', label: 'Quản lý sự kiện', icon: <Calendar className="w-4 h-4" /> },
            { id: 'users', label: 'Quản lý người dùng & Career Check', icon: <Users className="w-4 h-4" /> },
            { id: 'analytics', label: 'Website Analytics & AI Insights', icon: <BarChart3 className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (tab.id === 'jobs') onNavigate('admin-jobs');
                else if (tab.id === 'events') onNavigate('admin-events');
                else if (tab.id === 'users') onNavigate('admin-users');
                else if (tab.id === 'analytics') onNavigate('admin-analytics');
                else onNavigate('admin-dashboard');
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#B90013] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB: OVERVIEW (REAL DATA METRICS) */}
        {activeTab === 'overview' && (
          <AdminOverviewTab
            totalUsers={adminUsers.length}
            careerCheckCompleted={adminUsers.filter((u) => u.careerCheckCompleted).length}
            eventsCount={adminEvents.length}
            analyticsMetrics={analyticsMetrics}
            hasLoaded={hasLoadedOverview}
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              if (tab === 'jobs') onNavigate('admin-jobs');
              else if (tab === 'events') onNavigate('admin-events');
              else if (tab === 'users') onNavigate('admin-users');
              else if (tab === 'analytics') onNavigate('admin-analytics');
              else onNavigate('admin-dashboard');
            }}
          />
        )}

        {/* TAB: JOBS (ADMIN JOB MANAGEMENT) */}
        {activeTab === 'jobs' && (
          <AdminJobsTab
            showToast={showActionToast}
            onRefreshStats={refreshAllAdminData}
          />
        )}

        {/* TAB: USERS */}
        {activeTab === 'users' && <AdminUsersTab />}

        {/* TAB: EVENTS */}
        {activeTab === 'events' && (
          <AdminEventsTab
            events={adminEvents}
            onRefreshEvents={refreshAllAdminData}
            showToast={showActionToast}
          />
        )}

        {/* TAB: ANALYTICS */}
        {activeTab === 'analytics' && <AdminAnalyticsTab />}
      </div>
    </div>
  );
};
