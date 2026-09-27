export type ScreenView =
  | 'home'
  | 'assessment-intro'
  | 'assessment-quiz'
  | 'assessment-result'
  | 'roadmap'
  | 'jobs'
  | 'job-detail'
  | 'events'
  | 'event-detail'
  | 'cv-builder'
  | 'my-career'
  | 'my-tasks'
  | 'student-dashboard'
  | 'saved-jobs'
  | 'saved-events'
  | 'saved-items'
  | 'login'
  | 'admin-login'
  | 'admin'
  | 'admin-dashboard'
  | 'admin-jobs'
  | 'admin-events'
  | 'admin-users'
  | 'admin-analytics';

export type SearchCategory = 'all' | 'career' | 'job' | 'skill' | 'event';

export type CareerGoalOption =
  | 'Chưa biết mình phù hợp nghề gì'
  | 'Đang tìm hiểu các hướng nghề nghiệp'
  | 'Đã có nghề mục tiêu'
  | 'Đang tìm internship'
  | 'Đang chuẩn bị đi làm';

export interface SkillGapItem {
  name: string;
  category: 'technical' | 'soft' | 'domain';
  currentLevel: number; // 0 to 100
  requiredLevel: number; // 0 to 100
  status: 'proficient' | 'in_progress' | 'missing';
  recommendation: string;
}

export interface SkillGapData {
  targetRole: string;
  matchScore: number;
  strengths: string[];
  matchedSkills: string[];
  missingSkills: string[];
  skillMatrix: SkillGapItem[];
  learningRecommendations: string[];
}

export type CareerTendencyCode = 'CR' | 'AN' | 'OP' | 'CO';

export interface CareerInterestScores {
  CR: number;
  AN: number;
  OP: number;
  CO: number;
}

export interface TopCareerTendency {
  code: CareerTendencyCode;
  name: string;
  percentage: number;
  score: number;
  description: string;
  whyFit: string;
}

export interface CareerCheckResult {
  scores: CareerInterestScores;
  percentages: CareerInterestScores;
  topTendencies: TopCareerTendency[];
  recommendedCareers: {
    title: string;
    description: string;
    startingRoles: string[];
    coreSkills: string[];
    isPrimary: boolean;
    fitReason: string;
  }[];
  skillGap: SkillGapData;
  suggestedTasks: {
    id: string;
    title: string;
    category: 'roadmap' | 'cv' | 'application' | 'learning';
    priority: 'high' | 'medium' | 'normal';
    dueDate: string;
    completed: boolean;
  }[];
  completedAt: string;
}

export interface UserProfileState {
  userId: string;
  displayName: string;
  email: string;
  role?: 'student' | 'admin';
  major: string;
  academicYear: string;
  careerGoal: string;
  careerCheckCompleted: boolean;
  careerDirection?: string;
  careerInterestScores?: CareerInterestScores;
  topCareerTendencies?: Array<{
    code: CareerTendencyCode;
    percentage: number;
    name?: string;
  }>;
  completedAt?: string;
  skillGap?: SkillGapData | null;
  targetJobTitle?: string;
  targetJobCompany?: string;
  targetJobId?: string;
  targetJobSalary?: string;
  targetJobLocation?: string;
  targetJobRequiredSkills?: string[];
  targetJobDescription?: string;
  targetJobUrl?: string;
  cvFileName?: string;
  cvFileSize?: number;
  cvUploadedAt?: string;
  cvExtractedText?: string;
  onboardingCompleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserAuth {
  isLoggedIn: boolean;
  name: string;
  email: string;
  role?: 'student' | 'admin';
  avatarLetter: string;
  studentId?: string;
  major?: string;
  year?: string;
  provider?: 'google' | 'outlook' | 'demo';
}

export interface QuizOption {
  id: string;
  key: 'A' | 'B' | 'C' | 'D' | 'E';
  text: string;
  trait: string;
  categoryWeight: {
    digitalMarketing?: number;
    brandMarketing?: number;
    marketingAnalytics?: number;
    softwareEngineering?: number;
    dataScience?: number;
    uxDesign?: number;
    businessDevelopment?: number;
    humanResources?: number;
    financeAccounting?: number;
    operationsEcommerce?: number;
  };
}

export interface QuizQuestion {
  id: number;
  part: 1 | 2 | 3;
  partTitle: string;
  category: string;
  question: string;
  options: QuizOption[];
}

export interface CareerPathMatch {
  id: string;
  title: string;
  matchScore: number;
  isTopMatch?: boolean;
  rank?: '🥇' | '🥈' | '🥉';
  whyFit: string;
  coreSkills: string[];
  startingRoles: string[];
  description: string;
}

export interface RoadmapModule {
  id: string;
  title: string;
  status: 'completed' | 'current' | 'locked';
  tag?: string;
  description?: string;
  reason?: string;
  isCompleted?: boolean;
}

export interface RoadmapStage {
  stageNumber: number;
  stageName: string;
  levelName: string;
  subtitle: string;
  isCurrent?: boolean;
  modules: RoadmapModule[];
}

export interface FirestoreJob {
  id: string;
  title: string;
  companyName: string;
  companyLogo?: string;
  location: string;
  employmentType: 'Internship' | 'Full-time' | 'Part-time' | 'Trainee' | 'Freelance';
  salaryText: string;
  description: string;
  requirements: string[];
  benefits: string[];
  majorTags: string[];
  skillTags: string[];
  careerTendencies: CareerTendencyCode[];
  suitableAcademicYears: string[];
  careerCategory: string;
  publishedAt: string;
  expiresAt: string;
  sourceName: string;
  sourceUrl: string;
  applyUrl: string;
  verified: boolean;
  status: 'active' | 'expired' | 'hidden';
  isDemo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface JobInteraction {
  id?: string;
  userId: string;
  jobId: string;
  action: 'view' | 'click_apply';
  createdAt: string;
}

export interface TargetJob {
  id: string;
  title: string;
  company: string;
  companyName?: string;
  companyLogo?: string;
  companyIndustry: string;
  companySize?: string;
  companyWebsite?: string;
  companyAddress?: string;
  companyOverview?: string;
  jobField: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryDisplay: string;
  salaryText?: string;
  salaryType: 'Thỏa thuận' | 'Theo tháng' | 'Theo giờ';
  jobType: 'Thực tập' | 'Toàn thời gian' | 'Bán thời gian' | 'Freelance' | 'Hợp đồng';
  employmentType?: 'Internship' | 'Full-time' | 'Part-time' | 'Trainee' | 'Freelance';
  workMode: 'Tại văn phòng' | 'Hybrid' | 'Remote';
  level: 'Thực tập sinh' | 'Fresher' | 'Nhân viên' | 'Junior' | 'Middle' | 'Senior' | 'Quản lý';
  experience: 'Không yêu cầu' | 'Chưa có kinh nghiệm' | 'Dưới 1 năm' | '1–2 năm' | '2–3 năm' | '3+ năm';
  targetMajors: string[];
  majorTags?: string[];
  requiredSkills: string[];
  skillTags?: string[];
  preferredSkills: string[];
  careerTendencies?: CareerTendencyCode[];
  suitableAcademicYears?: string[];
  careerCategory?: string;
  education: string;
  deadline: string;
  publishedAt?: string;
  expiresAt?: string;
  source: string;
  sourceName?: string;
  sourceUrl?: string;
  applyUrl?: string;
  verified?: boolean;
  status?: 'active' | 'expired' | 'hidden';
  isDemo?: boolean;
  postedDate: string;
  updatedDate: string;
  description: string;
  responsibilities: string[];
  requirements?: string[];
  benefits?: string[];
  matchedSkills?: string[];
  missingSkills?: string[];
  matchPercentage: number;
  recommendationScore?: number;
  recommendationReason?: string;
  matchReasons: {
    type: 'positive' | 'warning';
    text: string;
  }[];
  isSaved?: boolean;
}

export interface EventSpeaker {
  name: string;
  role: string;
  company: string;
  avatar?: string;
  bio?: string;
}

export interface EventAgendaItem {
  time: string;
  activity: string;
  speaker?: string;
  description?: string;
}

export interface CareerEvent {
  id: string;
  title: string;
  organizer: string;
  organizerLogo?: string;
  eventType: 'Career' | 'Workshop' | 'Competition' | 'Networking' | 'Training';
  format?: 'Trực tiếp' | 'Trực tuyến' | 'Hybrid';
  date: string;
  time: string;
  month: string;
  day: string;
  location: string;
  isOnline: boolean;
  onlineLink?: string;
  description: string;
  detailedContent?: string;
  relatedSkills: string[];
  relatedCareers: string[];
  registrationUrl: string;
  registrationDeadline?: string;
  source: string;
  sourceUrl?: string;
  updatedDate: string;
  isSaved?: boolean;
  speakers?: EventSpeaker[];
  agenda?: EventAgendaItem[];
  targetAudience?: string[];
  benefits?: string[];
  trainingPoints?: number;
  hasCertificate?: boolean;
  maxSlots?: number;
  registeredCount?: number;
  fee?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface StudentProfile {
  name: string;
  email?: string;
  careerGoal: string;
  currentLevel: string;
  roadmapProgress: number;
  cvMatchScore: number;
  cvMatchStatus?: string;
  activeResumeName?: string;
  resumeCount?: number;
  maxResumes?: number;
  savedJobsCount?: number;
  upcomingEventsCount?: number;
  topStrengths?: string[];
  growthAreas?: string[];
  nextSteps?: Array<{
    id: string;
    title: string;
    type: 'project' | 'action' | 'cv';
    completed: boolean;
  }>;
}

export interface CVItem {
  id: string;
  title: string;
  company: string;
  period: string;
  location: string;
  bullets: string[];
}

export interface CVData {
  id?: string;
  title?: string;
  fullName: string;
  location: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  summary: string;
  experiences: CVItem[];
  skills: {
    languages: string;
    frameworks: string;
    tools: string;
  };
  highlightedKeywords: string[];
}

export interface MissingSkillSuggestion {
  id: string;
  skill: string;
  type: 'Bắt buộc' | 'Ưu tiên' | 'Đề xuất';
  context: string;
  suggestedText: string;
  applied?: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'job' | 'roadmap' | 'event' | 'cv';
  timeAgo: string;
  read: boolean;
  linkView?: ScreenView;
}

export interface FirestoreEvent {
  id: string;
  title: string;
  organizer: string;
  organizerLogo?: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "08:30 - 11:30"
  location: string;
  locationType: 'offline' | 'online' | 'hybrid';
  category: 'workshop' | 'career-fair' | 'talkshow' | 'competition' | 'training' | string;
  description: string;
  agenda?: string[];
  speakers?: Array<{ name: string; role: string; company: string; avatar?: string }>;
  targetAudience?: string;
  benefits?: string[];
  registrationUrl: string;
  sourceUrl?: string;
  publishedAt?: string;
  expiresAt?: string;
  status: 'active' | 'hidden' | 'expired';
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}
