import React, { useState, useEffect } from 'react';
import { ScreenView, UserAuth, NotificationItem, TargetJob, CareerEvent, UserProfileState } from './types';
import { NOTIFICATIONS_DATA, TARGET_JOBS, CAREER_EVENTS } from './data/mockData';
import { loadUserProfile, saveUserProfile } from './services/userService';
import { getActiveJobs } from './services/jobs/jobService';
import { trackEvent } from './utils/analytics';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LoginModal } from './components/LoginModal';
import { OrientationModal } from './components/OrientationModal';
import { MinimalProfileModal } from './components/MinimalProfileModal';
import { AdminLoginView } from './components/AdminLoginView';
import { HomeView } from './components/views/HomeView';
import { AssessmentIntroView } from './components/views/AssessmentIntroView';
import { AssessmentQuizView } from './components/views/AssessmentQuizView';
import { AssessmentResultView } from './components/views/AssessmentResultView';
import { RoadmapView } from './components/views/RoadmapView';
import { JobsView } from './components/views/JobsView';
import { JobDetailView } from './components/views/JobDetailView';
import { EventsView } from './components/views/EventsView';
import { EventDetailView } from './components/views/EventDetailView';
import { CVBuilderView } from './components/views/CVBuilderView';
import { MyCareerView } from './components/views/MyCareerView';
import { MyTasksView } from './components/views/MyTasksView';
import { StudentDashboardView } from './components/views/StudentDashboardView';
import { SavedItemsView } from './components/views/SavedItemsView';
import { AdminDashboardView } from './components/views/AdminDashboardView';
import {
  Compass,
  Sparkles,
  User,
  Home,
  CheckSquare,
  Briefcase,
} from 'lucide-react';

export function App() {
  const [currentView, setCurrentView] = useState<ScreenView>('home');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCareerTitle, setSelectedCareerTitle] = useState<string>('Digital Marketing');
  const [selectedJobForCv, setSelectedJobForCv] = useState<TargetJob | null>(null);
  const [selectedJobDetail, setSelectedJobDetail] = useState<TargetJob | null>(TARGET_JOBS[0]);
  const [selectedEventDetail, setSelectedEventDetail] = useState<CareerEvent | null>(CAREER_EVENTS[0]);

  // Centralized User Profile State with persistence
  const [userProfile, setUserProfile] = useState<UserProfileState>(() => loadUserProfile());
  const [showProfileSetupModal, setShowProfileSetupModal] = useState<boolean>(() => {
    try {
      const initial = loadUserProfile();
      return !initial?.onboardingCompleted;
    } catch {
      return false;
    }
  });

  // Admin authentication state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      const initial = loadUserProfile();
      return initial?.role === 'admin';
    } catch {
      return false;
    }
  });

  // Shared Jobs & Events state with persistence across views
  const [jobs, setJobs] = useState<TargetJob[]>(TARGET_JOBS);
  const [events, setEvents] = useState<CareerEvent[]>(CAREER_EVENTS);

  // Path routing helpers
  const viewToPath = (view: ScreenView): string => {
    switch (view) {
      case 'home':
        return '/';
      case 'assessment-intro':
        return '/career-check';
      case 'assessment-quiz':
        return '/career-check';
      case 'assessment-result':
        return '/career-direction';
      case 'roadmap':
        return '/career-map';
      case 'jobs':
        return '/jobs';
      case 'events':
        return '/events';
      case 'cv-builder':
        return '/cv-analysis';
      case 'my-tasks':
        return '/todo';
      case 'admin':
      case 'admin-dashboard':
        return '/admin/dashboard';
      case 'admin-jobs':
        return '/admin/jobs';
      case 'admin-events':
        return '/admin/events';
      case 'admin-users':
        return '/admin/users';
      case 'admin-analytics':
        return '/admin/analytics';
      case 'admin-login':
        return '/admin-login';
      default:
        return '/';
    }
  };

  const pathToView = (path: string): ScreenView => {
    const clean = (path || '/').toLowerCase().replace(/\/$/, '') || '/';
    if (clean === '/' || clean === '') return 'home';
    if (clean === '/career-check' || clean === '/skill-gap') return 'assessment-intro';
    if (clean === '/career-direction') return 'assessment-result';
    if (clean === '/career-map') return 'roadmap';
    if (clean === '/jobs') return 'jobs';
    if (clean === '/events') return 'events';
    if (clean === '/cv-analysis') return 'cv-builder';
    if (clean === '/todo') return 'my-tasks';
    if (clean === '/admin' || clean === '/admin/dashboard') return 'admin-dashboard';
    if (clean === '/admin/jobs') return 'admin-jobs';
    if (clean === '/admin/events') return 'admin-events';
    if (clean === '/admin/users') return 'admin-users';
    if (clean === '/admin/analytics') return 'admin-analytics';
    if (clean === '/admin-login') return 'admin-login';
    return 'home';
  };

  const isAdminView = (view: ScreenView): boolean => {
    return [
      'admin',
      'admin-dashboard',
      'admin-jobs',
      'admin-events',
      'admin-users',
      'admin-analytics',
    ].includes(view);
  };

  // Safe router navigation with strict RBAC
  const handleNavigate = (view: ScreenView) => {
    const isTargetAdmin = isAdminView(view);
    const isAuthorizedAdmin = (userProfile?.role === 'admin') || isAdminAuthenticated;

    // RBAC Rule: If not admin and attempting to access admin route -> redirect to home
    if (isTargetAdmin && !isAuthorizedAdmin) {
      setCurrentView('home');
      if (window.location.pathname !== '/') {
        window.history.replaceState(null, '', '/');
      }
      return;
    }

    setCurrentView(view);
    const targetPath = viewToPath(view);
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Initialize and listen to URL popstate events
  useEffect(() => {
    const initialView = pathToView(window.location.pathname);
    const isTargetAdmin = isAdminView(initialView);
    const isAuthorizedAdmin = (userProfile?.role === 'admin') || isAdminAuthenticated;

    if (isTargetAdmin && !isAuthorizedAdmin) {
      setCurrentView('home');
      if (window.location.pathname !== '/') {
        window.history.replaceState(null, '', '/');
      }
    } else {
      setCurrentView(initialView);
    }

    const handlePopState = () => {
      const popView = pathToView(window.location.pathname);
      const isPopAdmin = isAdminView(popView);
      const currentRole = loadUserProfile()?.role;
      const authorizedNow = currentRole === 'admin' || isAdminAuthenticated;

      if (isPopAdmin && !authorizedNow) {
        setCurrentView('home');
        window.history.replaceState(null, '', '/');
      } else {
        setCurrentView(popView);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAdminAuthenticated, userProfile?.role]);

  // Sync with JobService
  useEffect(() => {
    getActiveJobs(true)
      .then((active) => {
        if (active && active.length > 0) {
          setJobs(active);
        }
      })
      .catch(() => {});
  }, []);

  const handleToggleSaveJob = (jobId: string) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, isSaved: !j.isSaved } : j))
    );
    setSelectedJobDetail((prev) =>
      prev && prev.id === jobId ? { ...prev, isSaved: !prev.isSaved } : prev
    );
  };

  const handleSelectJobDetail = (job: TargetJob) => {
    trackEvent('job_view', { jobId: job.id, title: job.title, company: job.company });
    setSelectedJobDetail(job);
    setCurrentView('job-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleSaveEvent = (eventId: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, isSaved: !e.isSaved } : e))
    );
    setSelectedEventDetail((prev) =>
      prev && prev.id === eventId ? { ...prev, isSaved: !prev.isSaved } : prev
    );
  };

  const handleSelectEventDetail = (event: CareerEvent) => {
    trackEvent('event_view', { eventId: event.id, title: event.title, organizer: event.organizer });
    setSelectedEventDetail(event);
    setCurrentView('event-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Authentication State
  const [auth, setAuth] = useState<UserAuth>(() => {
    const profile = loadUserProfile();
    const displayName = profile?.displayName || 'Minh';
    return {
      isLoggedIn: true,
      name: displayName,
      email: profile?.email || 'minh.ptit@student.ptit.edu.vn',
      avatarLetter: displayName[0]?.toUpperCase() || 'M',
      studentId: 'B22DCMK120',
      major: profile?.major || 'Marketing & Truyền thông Đa phương tiện',
      year: profile?.academicYear || 'Năm 3',
    };
  });
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [orientationModalOpen, setOrientationModalOpen] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>(NOTIFICATIONS_DATA);

  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleSelectCareer = (careerId: string) => {
    if (careerId === 'cm-1') setSelectedCareerTitle('Digital Marketing');
    else if (careerId === 'cm-2') setSelectedCareerTitle('Brand Marketing');
    else if (careerId === 'cm-3') setSelectedCareerTitle('Marketing Analytics');
    else setSelectedCareerTitle('Digital Marketing');
  };

  const handleFinishQuiz = () => {
    setCurrentView('assessment-result');
  };

  // User Profile handlers
  const handleSaveProfile = (updated: Partial<UserProfileState>) => {
    const merged = saveUserProfile(updated);
    setUserProfile(merged);
    setShowProfileSetupModal(false);
    const displayName = merged?.displayName || 'Minh';
    setAuth((prev) => ({
      ...prev,
      name: displayName,
      major: merged?.major || prev.major,
      year: merged?.academicYear || prev.year,
      avatarLetter: displayName[0]?.toUpperCase() || 'M',
    }));
    trackEvent('onboarding_complete', {
      major: merged.major,
      academicYear: merged.academicYear,
      careerGoal: merged.careerGoal,
    });
  };

  const handleUpdateUserProfile = (partial: Partial<UserProfileState>) => {
    const updated = saveUserProfile(partial);
    setUserProfile(updated);
  };

  const handleStartCareerCheck = () => {
    trackEvent('career_check_start', {
      major: userProfile.major,
      academicYear: userProfile.academicYear,
    });
    setCurrentView('assessment-intro');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSkipCareerCheck = () => {
    trackEvent('career_check_skip', {
      major: userProfile.major,
      academicYear: userProfile.academicYear,
    });
    const updated = saveUserProfile({ careerCheckCompleted: false });
    setUserProfile(updated);
    setCurrentView('jobs');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF9] text-[#131B2E] font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#B90013] selection:text-white">
      {/* Universal Header (Hidden in standalone Quiz and Admin Dashboard) */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        auth={auth}
        onOpenLogin={() => setLoginModalOpen(true)}
        onLogout={() =>
          setAuth({
            isLoggedIn: false,
            name: '',
            email: '',
            avatarLetter: '',
          })
        }
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onOpenOrientationModal={() => setOrientationModalOpen(true)}
      />

      {/* Main Screen Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView
            onNavigate={handleNavigate}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onOpenOrientationModal={() => setOrientationModalOpen(true)}
            userProfile={userProfile}
            onStartCareerCheck={handleStartCareerCheck}
            onSkipCareerCheck={handleSkipCareerCheck}
            onEditProfile={() => setShowProfileSetupModal(true)}
          />
        )}

        {currentView === 'assessment-intro' && (
          <AssessmentIntroView
            onNavigate={handleNavigate}
            onOpenOrientationModal={() => setOrientationModalOpen(true)}
          />
        )}

        {currentView === 'assessment-quiz' && (
          <AssessmentQuizView
            onNavigate={handleNavigate}
            onFinishQuiz={handleFinishQuiz}
            userProfile={userProfile}
            onUpdateUserProfile={handleUpdateUserProfile}
          />
        )}

        {currentView === 'assessment-result' && (
          <AssessmentResultView
            onNavigate={handleNavigate}
            onSelectCareer={handleSelectCareer}
            userProfile={userProfile}
            onUpdateUserProfile={handleUpdateUserProfile}
            onSelectJobDetail={handleSelectJobDetail}
            onSelectJobForCv={(job) => setSelectedJobForCv(job)}
          />
        )}

        {currentView === 'roadmap' && (
          <RoadmapView
            onNavigate={handleNavigate}
            selectedCareerTitle={userProfile.careerDirection || selectedCareerTitle}
            onOpenOrientationModal={() => setOrientationModalOpen(true)}
            userProfile={userProfile}
            onUpdateUserProfile={handleUpdateUserProfile}
            onSelectJobDetail={handleSelectJobDetail}
          />
        )}

        {currentView === 'jobs' && (
          <JobsView
            onNavigate={handleNavigate}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onSelectJobDetail={handleSelectJobDetail}
            jobs={jobs}
            onToggleSaveJob={handleToggleSaveJob}
            userProfile={userProfile}
            onUpdateUserProfile={handleUpdateUserProfile}
          />
        )}

        {currentView === 'job-detail' && (
          <JobDetailView
            job={
              jobs.find((j) => j.id === selectedJobDetail?.id) ||
              selectedJobDetail ||
              jobs[0]
            }
            allJobs={jobs}
            onBack={() => handleNavigate('jobs')}
            onNavigate={handleNavigate}
            onSelectJobForCv={(job) => setSelectedJobForCv(job)}
            onSelectJobDetail={handleSelectJobDetail}
            onToggleSaveJob={handleToggleSaveJob}
            userProfile={userProfile}
            onUpdateUserProfile={handleUpdateUserProfile}
          />
        )}

        {currentView === 'events' && (
          <EventsView
            onNavigate={handleNavigate}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onSelectEventDetail={handleSelectEventDetail}
            events={events}
            onToggleSaveEvent={handleToggleSaveEvent}
            userProfile={userProfile}
          />
        )}

        {currentView === 'event-detail' && (
          <EventDetailView
            event={
              events.find((e) => e.id === selectedEventDetail?.id) ||
              selectedEventDetail ||
              events[0]
            }
            allEvents={events}
            onBack={() => handleNavigate('events')}
            onNavigate={handleNavigate}
            onSelectEventDetail={handleSelectEventDetail}
            onToggleSaveEvent={handleToggleSaveEvent}
          />
        )}

        {currentView === 'cv-builder' && (
          <CVBuilderView
            onNavigate={handleNavigate}
            targetJobForCv={selectedJobForCv}
            userProfile={userProfile}
            onUpdateUserProfile={handleUpdateUserProfile}
            allJobs={jobs}
            onSelectJobForCv={(job) => {
              setSelectedJobForCv(job);
              handleUpdateUserProfile({
                targetJobId: job.id,
                targetJobTitle: job.title,
                targetJobCompany: job.company,
                targetJobSalary: job.salaryDisplay,
                targetJobLocation: job.location,
                targetJobRequiredSkills: job.requiredSkills || job.skillTags || [],
                targetJobDescription: job.description,
              });
            }}
            onEditProfile={() => setShowProfileSetupModal(true)}
          />
        )}

        {currentView === 'my-tasks' && (
          <MyTasksView
            onNavigate={handleNavigate}
            userProfile={userProfile}
            onUpdateUserProfile={handleUpdateUserProfile}
          />
        )}

        {currentView === 'student-dashboard' && (
          <StudentDashboardView
            onNavigate={handleNavigate}
            userProfile={userProfile}
            onEditProfile={() => setShowProfileSetupModal(true)}
          />
        )}

        {currentView === 'my-career' && (
          <MyCareerView
            onNavigate={handleNavigate}
            auth={auth}
            jobs={jobs}
            events={events}
            onSelectJobDetail={handleSelectJobDetail}
            onSelectEventDetail={handleSelectEventDetail}
          />
        )}

        {(currentView === 'saved-jobs' ||
          currentView === 'saved-events' ||
          currentView === 'saved-items') && (
          <SavedItemsView
            onNavigate={handleNavigate}
            initialTab={currentView === 'saved-events' ? 'events' : 'jobs'}
            jobs={jobs}
            onToggleSaveJob={handleToggleSaveJob}
            events={events}
            onToggleSaveEvent={handleToggleSaveEvent}
            onSelectJobForCv={(job) => setSelectedJobForCv(job)}
            onSelectJobDetail={handleSelectJobDetail}
            onSelectEventDetail={handleSelectEventDetail}
          />
        )}

        {currentView === 'admin-login' && (
          <AdminLoginView
            onNavigate={handleNavigate}
            onAdminLoginSuccess={() => {
              setIsAdminAuthenticated(true);
              const updated = saveUserProfile({ role: 'admin' });
              setUserProfile(updated);
            }}
          />
        )}

        {isAdminView(currentView) && (
          (userProfile?.role === 'admin' || isAdminAuthenticated) ? (
            <AdminDashboardView
              onNavigate={handleNavigate}
              initialTab={
                currentView === 'admin-jobs'
                  ? 'jobs'
                  : currentView === 'admin-events'
                  ? 'events'
                  : currentView === 'admin-users'
                  ? 'users'
                  : currentView === 'admin-analytics'
                  ? 'analytics'
                  : 'overview'
              }
              onLogoutAdmin={() => {
                setIsAdminAuthenticated(false);
                const updated = saveUserProfile({ role: 'student' });
                setUserProfile(updated);
                handleNavigate('home');
              }}
            />
          ) : (
            <HomeView
              onNavigate={handleNavigate}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onOpenOrientationModal={() => setOrientationModalOpen(true)}
              userProfile={userProfile}
              onStartCareerCheck={handleStartCareerCheck}
              onSkipCareerCheck={handleSkipCareerCheck}
              onEditProfile={() => setShowProfileSetupModal(true)}
            />
          )
        )}
      </main>

      {/* Main Flow Navigation Floating Bar */}
      {!isAdminView(currentView) &&
        currentView !== 'assessment-quiz' &&
        currentView !== 'admin-login' && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.12)] border border-slate-200 hidden md:flex items-center gap-2 text-xs font-bold text-slate-600">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 px-2 font-extrabold">
              Luồng chính:
            </span>

            {/* 1. Trang chủ */}
            <button
              onClick={() => handleNavigate('home')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                currentView === 'home'
                  ? 'bg-[#B90013] text-white shadow-xs'
                  : 'hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </button>

            {/* 2. Việc làm */}
            <button
              onClick={() => handleNavigate('jobs')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                currentView === 'jobs'
                  ? 'bg-[#B90013] text-white shadow-xs'
                  : 'hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Việc làm</span>
            </button>

            {/* 3. Lộ trình */}
            <button
              onClick={() => handleNavigate('roadmap')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                currentView === 'roadmap'
                  ? 'bg-[#B90013] text-white shadow-xs'
                  : 'hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Career Map</span>
            </button>

            {/* 4. My Tasks */}
            <button
              onClick={() => handleNavigate('my-tasks')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                currentView === 'my-tasks'
                  ? 'bg-[#B90013] text-white shadow-xs'
                  : 'hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>My Tasks</span>
            </button>

            {/* 5. Hồ sơ */}
            <button
              onClick={() => handleNavigate('student-dashboard')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                currentView === 'student-dashboard' ||
                currentView === 'my-career' ||
                currentView === 'saved-jobs' ||
                currentView === 'saved-events' ||
                currentView === 'saved-items'
                  ? 'bg-[#B90013] text-white shadow-xs'
                  : 'hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Hồ sơ</span>
            </button>
          </div>
        )}

      {/* Universal Footer (Contains the only authorized entry to Admin Login) */}
      {!isAdminView(currentView) && currentView !== 'assessment-quiz' && (
        <Footer onNavigate={handleNavigate} />
      )}

      {/* Minimal Profile Setup Modal (New User Onboarding or Edit Profile) */}
      <MinimalProfileModal
        isOpen={showProfileSetupModal}
        userProfile={userProfile}
        initialProfile={userProfile}
        onSave={handleSaveProfile}
        onComplete={handleSaveProfile}
        onClose={() => setShowProfileSetupModal(false)}
        onSkip={() => setShowProfileSetupModal(false)}
      />

      {/* Student Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={(newAuth) => {
          setAuth(newAuth);
          setLoginModalOpen(false);
          // If profile onboarding not complete, guide new user to profile setup
          if (!userProfile.onboardingCompleted) {
            setShowProfileSetupModal(true);
          }
        }}
      />

      {/* 4-Step Orientation Onboarding Modal for PTIT Students */}
      <OrientationModal
        isOpen={orientationModalOpen}
        onClose={() => setOrientationModalOpen(false)}
        onNavigate={setCurrentView}
        onSaveProfile={(profileData) => {
          if (profileData.careerGoal) {
            setSelectedCareerTitle(profileData.careerGoal);
          }
          if (profileData.currentLevel && auth.isLoggedIn) {
            setAuth((prev) => ({
              ...prev,
              year: profileData.currentLevel || prev.year,
            }));
          }
        }}
      />
    </div>
  );
}

export default App;

