import { UserProfileState, SkillGapData } from '../types';
import { fetchUsersFromFirestore, saveUserToFirestore, isFirestoreActive } from './firebase';

const STORAGE_KEY = 'ptit_career_hub_user_profile_v2';
const ALL_USERS_KEY = 'ptit_career_hub_all_users_v1';

export const DEFAULT_USER_PROFILE: UserProfileState = {
  userId: 'student_ptit_default',
  displayName: 'Minh',
  email: 'minh.ptit@student.ptit.edu.vn',
  role: 'student',
  major: 'Marketing & Truyền thông số',
  academicYear: 'Năm 3',
  careerGoal: 'Đang tìm hiểu các hướng nghề nghiệp',
  careerCheckCompleted: false,
  careerDirection: 'Digital Marketing',
  skillGap: null,
  onboardingCompleted: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * Load user state from local storage.
 * If none exists, returns default.
 */
export function loadUserProfile(): UserProfileState {
  if (typeof window === 'undefined') return DEFAULT_USER_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_USER_PROFILE;
    const parsed = JSON.parse(raw) as UserProfileState;
    return {
      ...DEFAULT_USER_PROFILE,
      ...parsed,
    };
  } catch {
    return DEFAULT_USER_PROFILE;
  }
}

/**
 * Save user profile state locally and prepare Firestore sync.
 * Merges partial updates with current state and returns the updated UserProfileState.
 */
export function saveUserProfile(profileUpdate: Partial<UserProfileState>): UserProfileState {
  const current = loadUserProfile();
  const merged: UserProfileState = {
    ...current,
    ...profileUpdate,
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));

      // If Firebase Auth & Firestore is initialized, trigger remote sync
      syncUserToFirestore(merged.userId, merged).catch(() => {
        // Offline or Firebase not yet configured, gracefully handled
      });
    } catch {
      // silent
    }
  }

  return merged;
}

/**
 * Clear user profile state on logout or reset.
 */
export function clearUserProfile(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // silent
  }
}

/**
 * Build a realistic Skill Gap breakdown for a target career role.
 */
export function computeSkillGap(targetRole: string = 'Digital Marketing', userMajor: string = 'Marketing'): SkillGapData {
  if (targetRole.toLowerCase().includes('brand')) {
    return {
      targetRole: 'Brand Marketing Executive',
      matchScore: 84,
      strengths: [
        'Kể chuyện thương hiệu (Storytelling)',
        'Cảm quan thẩm mỹ & thông điệp sáng tạo',
        'Tư duy chiến dịch truyền thông tích hợp',
      ],
      matchedSkills: [
        'Content Strategy',
        'Social Media Management',
        'Consumer Insight Research',
      ],
      missingSkills: [
        'Quản trị ngân sách chiến dịch (P&L)',
        'Đo lường Brand Equity & SOV',
        'Đàm phán Agency & Talent',
      ],
      skillMatrix: [
        { name: 'Chiến lược nội dung & Định vị', category: 'domain', currentLevel: 85, requiredLevel: 90, status: 'proficient', recommendation: 'Duy trì thế mạnh và làm case study thực tế' },
        { name: 'Nghiên cứu Insight người dùng', category: 'domain', currentLevel: 75, requiredLevel: 85, status: 'in_progress', recommendation: 'Thực hành phỏng vấn sâu và khảo sát khách hàng mục tiêu' },
        { name: 'Quản trị ngân sách & ROI chiến dịch', category: 'technical', currentLevel: 45, requiredLevel: 75, status: 'missing', recommendation: 'Tham gia học phần Brand Finance & Quản lý dự án' },
        { name: 'Kỹ năng đàm phán & Làm việc với Agency', category: 'soft', currentLevel: 60, requiredLevel: 80, status: 'in_progress', recommendation: 'Tham gia các buổi Workshop mô phỏng Pitching' },
      ],
      learningRecommendations: [
        'Hoàn thành module "Brand Equity & Measurement" trên Lộ trình phát triển',
        'Tham gia Workshop Marketing Brand Challenge tại PTIT',
        'Tối ưu CV với từ khóa "Brand Positioning" và "Integrated Campaign"',
      ],
    };
  }

  if (targetRole.toLowerCase().includes('analytics') || targetRole.toLowerCase().includes('data')) {
    return {
      targetRole: 'Marketing Data Analyst',
      matchScore: 78,
      strengths: [
        'Tư duy số liệu & đọc hiểu báo cáo',
        'Kỹ năng Excel nâng cao & Thống kê cơ bản',
        'Hiểu logic chuyển đổi phễu người dùng',
      ],
      matchedSkills: [
        'Excel / Google Sheets Advanced',
        'Google Analytics 4 Overview',
        'Funnel Analysis',
      ],
      missingSkills: [
        'SQL Truy vấn dữ liệu khách hàng',
        'A/B Testing & Thử nghiệm thống kê',
        'Trực quan hóa dữ liệu (Power BI / Looker Studio)',
      ],
      skillMatrix: [
        { name: 'Phân tích phễu & Chuyển đổi', category: 'technical', currentLevel: 80, requiredLevel: 85, status: 'proficient', recommendation: 'Thực hành phân tích số liệu website thực tế' },
        { name: 'SQL & Database Queries', category: 'technical', currentLevel: 40, requiredLevel: 80, status: 'missing', recommendation: 'Học ngay khóa SQL cho Marketers trong 2 tuần' },
        { name: 'Power BI / Looker Studio Dashboard', category: 'technical', currentLevel: 50, requiredLevel: 80, status: 'in_progress', recommendation: 'Xây dựng 1 Dashboard phân tích chiến dịch mẫu' },
        { name: 'A/B Testing Methodology', category: 'domain', currentLevel: 55, requiredLevel: 75, status: 'in_progress', recommendation: 'Tìm hiểu cách tính kích thước mẫu và độ tin cậy P-value' },
      ],
      learningRecommendations: [
        'Bổ sung chứng chỉ Google Analytics 4 Certification vào CV',
        'Thực hành làm dự án phân tích dữ liệu eCommerce trong mục My Tasks',
        'Theo dõi cơ hội tuyển dụng vị trí Data Intern',
      ],
    };
  }

  // Default: Digital Marketing
  return {
    targetRole: 'Digital Marketing Specialist',
    matchScore: 92,
    strengths: [
      'Viết Content & Sáng tạo thông điệp',
      'Nắm bắt xu hướng truyền thông mạng xã hội',
      'Tư duy tối ưu chiến dịch quảng cáo đa kênh',
    ],
    matchedSkills: [
      'Content Marketing',
      'Social Media Management (Facebook/TikTok)',
      'Canva / Thiết kế cơ bản',
      'SEO Content',
    ],
    missingSkills: [
      'Performance Marketing (Meta Ads / Google Ads chuyên sâu)',
      'Đọc hiểu báo cáo Google Analytics 4 chuyên sâu',
      'Tối ưu hóa tỷ lệ chuyển đổi (CRO & Landing Page)',
    ],
    skillMatrix: [
      { name: 'Sáng tạo nội dung (Content Marketing)', category: 'domain', currentLevel: 90, requiredLevel: 85, status: 'proficient', recommendation: 'Đạt chuẩn sẵn sàng làm việc thực tế' },
      { name: 'Social Media Strategy', category: 'domain', currentLevel: 85, requiredLevel: 85, status: 'proficient', recommendation: 'Tiếp tục cập nhật thuật toán mới của TikTok & Meta' },
      { name: 'Meta Ads & Google Ads Chuyên sâu', category: 'technical', currentLevel: 50, requiredLevel: 80, status: 'missing', recommendation: 'Tập trung học Cấp độ 3 trong Lộ trình học tập' },
      { name: 'Google Analytics 4 & Báo cáo CRO', category: 'technical', currentLevel: 55, requiredLevel: 80, status: 'in_progress', recommendation: 'Đăng ký workshop GA4 cuối tuần này tại PTIT' },
    ],
    learningRecommendations: [
      'Mở khóa Cấp độ 2 & Cấp độ 3 trong Lộ trình để hoàn thành kỹ năng Meta Ads',
      'Ứng tuyển các vị trí Marketing Intern được ưu tiên trong mục Việc làm',
      'Dùng công cụ AI CV để quét từ khóa tối ưu cho hồ sơ thực tập',
    ],
  };
}

// =========================================================================
// FIRESTORE CONNECTION INTERFACE
// When Firebase is provisioned via the environment or client credentials,
// replace the stub below with actual Firestore calls:
// import { doc, setDoc, getDoc } from 'firebase/firestore';
// import { db } from './firebaseConfig';
// =========================================================================

/**
 * Save / sync user profile to Firestore at collection `users/{uid}`
 * and locally keep user in registered users registry.
 */
export async function syncUserToFirestore(uid: string, profile: UserProfileState): Promise<boolean> {
  // Update local registry of users
  if (typeof window !== 'undefined') {
    try {
      const rawAll = localStorage.getItem(ALL_USERS_KEY);
      let list: UserProfileState[] = rawAll ? JSON.parse(rawAll) : [];
      if (!Array.isArray(list)) list = [];
      const existingIdx = list.findIndex((u) => u.userId === uid || u.email === profile.email);
      if (existingIdx >= 0) {
        list[existingIdx] = { ...list[existingIdx], ...profile };
      } else {
        list.push(profile);
      }
      localStorage.setItem(ALL_USERS_KEY, JSON.stringify(list));
    } catch {
      // silent
    }
  }

  // Sync to remote Firestore
  if (isFirestoreActive()) {
    try {
      await saveUserToFirestore(profile);
      return true;
    } catch (err) {
      console.warn('Failed to sync user to Firestore:', err);
      return false;
    }
  }
  return true;
}

/**
 * Load user profile from Firestore at `users/{uid}`.
 */
export async function loadUserFromFirestore(uid: string): Promise<UserProfileState | null> {
  if (isFirestoreActive()) {
    const all = await fetchUsersFromFirestore();
    if (all && all.length > 0) {
      return all.find((u) => u.userId === uid) || null;
    }
  }
  return null;
}

export interface UserAggregateReport {
  hasData: boolean;
  totalUsers: number;
  careerCheckCompletedCount: number;
  careerCheckCompletionRate: number; // percentage 0-100
  majorDistribution: Array<{ major: string; count: number; percentage: number }>;
  academicYearDistribution: Array<{ year: string; count: number; percentage: number }>;
  careerGoalDistribution: Array<{ goal: string; count: number; percentage: number }>;
  // Career Check specific metrics
  careerCheckAnalytics: {
    hasData: boolean;
    totalCompleted: number;
    averageTendencies: {
      CR: number;
      AN: number;
      OP: number;
      CO: number;
    };
    topTendency: { code: string; name: string; percentage: number } | null;
    topCombinations: Array<{ combo: string; count: number; percentage: number }>;
    directionByMajor: Record<string, Record<string, number>>;
    directionByYear: Record<string, Record<string, number>>;
  };
}

/**
 * Load all users for Admin User Management & Career Check Analytics
 */
export async function loadAllUsersForAdmin(): Promise<UserProfileState[]> {
  // 1. Check Firestore
  if (isFirestoreActive()) {
    const remote = await fetchUsersFromFirestore();
    if (remote && remote.length > 0) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(ALL_USERS_KEY, JSON.stringify(remote));
      }
      return remote;
    }
  }

  // 2. Check local users registry
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(ALL_USERS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
  }

  // 3. Fallback to current user profile if exists
  const current = loadUserProfile();
  if (current) {
    return [current];
  }

  return [];
}

/**
 * Calculate aggregate report without fake numbers
 */
export function computeUserAggregates(users: UserProfileState[]): UserAggregateReport {
  if (!users || users.length === 0) {
    return {
      hasData: false,
      totalUsers: 0,
      careerCheckCompletedCount: 0,
      careerCheckCompletionRate: 0,
      majorDistribution: [],
      academicYearDistribution: [],
      careerGoalDistribution: [],
      careerCheckAnalytics: {
        hasData: false,
        totalCompleted: 0,
        averageTendencies: { CR: 0, AN: 0, OP: 0, CO: 0 },
        topTendency: null,
        topCombinations: [],
        directionByMajor: {},
        directionByYear: {},
      },
    };
  }

  const totalUsers = users.length;
  const completedUsers = users.filter((u) => u.careerCheckCompleted);
  const careerCheckCompletedCount = completedUsers.length;
  const careerCheckCompletionRate = Math.round((careerCheckCompletedCount / totalUsers) * 100);

  // Major distribution
  const majorCounts: Record<string, number> = {};
  users.forEach((u) => {
    const m = u.major || 'Chưa cập nhật';
    majorCounts[m] = (majorCounts[m] || 0) + 1;
  });
  const majorDistribution = Object.entries(majorCounts).map(([major, count]) => ({
    major,
    count,
    percentage: Math.round((count / totalUsers) * 100),
  })).sort((a, b) => b.count - a.count);

  // Academic year distribution
  const yearCounts: Record<string, number> = {};
  users.forEach((u) => {
    const y = u.academicYear || 'Chưa cập nhật';
    yearCounts[y] = (yearCounts[y] || 0) + 1;
  });
  const academicYearDistribution = Object.entries(yearCounts).map(([year, count]) => ({
    year,
    count,
    percentage: Math.round((count / totalUsers) * 100),
  })).sort((a, b) => b.count - a.count);

  // Career Goal distribution
  const goalCounts: Record<string, number> = {};
  users.forEach((u) => {
    const g = u.careerGoal || 'Chưa xác định';
    goalCounts[g] = (goalCounts[g] || 0) + 1;
  });
  const careerGoalDistribution = Object.entries(goalCounts).map(([goal, count]) => ({
    goal,
    count,
    percentage: Math.round((count / totalUsers) * 100),
  })).sort((a, b) => b.count - a.count);

  // Career Check specific calculations
  let crSum = 0, anSum = 0, opSum = 0, coSum = 0;
  let countWithScores = 0;
  const comboCounts: Record<string, number> = {};
  const directionByMajor: Record<string, Record<string, number>> = {};
  const directionByYear: Record<string, Record<string, number>> = {};

  completedUsers.forEach((u) => {
    if (u.careerInterestScores) {
      crSum += u.careerInterestScores.CR || 0;
      anSum += u.careerInterestScores.AN || 0;
      opSum += u.careerInterestScores.OP || 0;
      coSum += u.careerInterestScores.CO || 0;
      countWithScores += 1;
    }

    if (u.topCareerTendencies && u.topCareerTendencies.length >= 2) {
      const c = `${u.topCareerTendencies[0].code}-${u.topCareerTendencies[1].code}`;
      comboCounts[c] = (comboCounts[c] || 0) + 1;
    }

    if (u.careerDirection) {
      const m = u.major || 'Chưa rõ';
      if (!directionByMajor[m]) directionByMajor[m] = {};
      directionByMajor[m][u.careerDirection] = (directionByMajor[m][u.careerDirection] || 0) + 1;

      const y = u.academicYear || 'Chưa rõ';
      if (!directionByYear[y]) directionByYear[y] = {};
      directionByYear[y][u.careerDirection] = (directionByYear[y][u.careerDirection] || 0) + 1;
    }
  });

  const averageTendencies = {
    CR: countWithScores > 0 ? Math.round(crSum / countWithScores) : 0,
    AN: countWithScores > 0 ? Math.round(anSum / countWithScores) : 0,
    OP: countWithScores > 0 ? Math.round(opSum / countWithScores) : 0,
    CO: countWithScores > 0 ? Math.round(coSum / countWithScores) : 0,
  };

  const tendencyEntries = [
    { code: 'CR', name: 'Sáng tạo (Creative)', percentage: averageTendencies.CR },
    { code: 'AN', name: 'Phân tích (Analytical)', percentage: averageTendencies.AN },
    { code: 'OP', name: 'Vận hành (Operational)', percentage: averageTendencies.OP },
    { code: 'CO', name: 'Thương mại (Commercial)', percentage: averageTendencies.CO },
  ].sort((a, b) => b.percentage - a.percentage);

  const topTendency = countWithScores > 0 ? tendencyEntries[0] : null;

  const topCombinations = Object.entries(comboCounts).map(([combo, count]) => ({
    combo,
    count,
    percentage: Math.round((count / (completedUsers.length || 1)) * 100),
  })).sort((a, b) => b.count - a.count).slice(0, 3);

  return {
    hasData: totalUsers > 0,
    totalUsers,
    careerCheckCompletedCount,
    careerCheckCompletionRate,
    majorDistribution,
    academicYearDistribution,
    careerGoalDistribution,
    careerCheckAnalytics: {
      hasData: completedUsers.length > 0,
      totalCompleted: completedUsers.length,
      averageTendencies,
      topTendency,
      topCombinations,
      directionByMajor,
      directionByYear,
    },
  };
}

