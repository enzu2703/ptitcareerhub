import { logInteractionToFirestore } from '../services/firebase';

// Analytics & Event Tracking for PTIT Career Hub
// Supports Google Analytics 4 (window.gtag) if installed,
// and buffers events safely in memory and developer console.

export type AnalyticsEventName =
  | 'page_view'
  | 'landing_page_view'
  | 'onboarding_start'
  | 'onboarding_complete'
  | 'career_check_view'
  | 'career_check_start'
  | 'career_check_skip'
  | 'career_check_question_answer'
  | 'career_check_complete'
  | 'career_direction_view'
  | 'career_map_view'
  | 'career_recommendation_view'
  | 'career_recommendation_click'
  | 'skill_gap_view'
  | 'job_recommendation_view'
  | 'job_list_view'
  | 'job_view'
  | 'job_click_apply'
  | 'job_external_redirect'
  | 'event_list_view'
  | 'event_recommendation_view'
  | 'event_view'
  | 'event_click_register'
  | 'cv_analysis_start'
  | 'cv_analysis_complete'
  | 'home_partner_company_click'
  | 'todo_create'
  | 'todo_update'
  | 'todo_complete';

declare global {
  interface Window {
    gtag?: (command: string, action: string, params?: Record<string, unknown>) => void;
    dataLayer?: unknown[];
  }
}

// Auto-initialize GA4 if VITE_GA_MEASUREMENT_ID is supplied
if (typeof window !== 'undefined') {
  const measurementId = (import.meta as any).env?.VITE_GA_MEASUREMENT_ID;
  if (measurementId && typeof document !== 'undefined') {
    const existingScript = document.getElementById('ga4-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'ga4-script';
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function () {
        window.dataLayer?.push(arguments);
      };
      window.gtag('js', new Date() as any);
      window.gtag('config', measurementId, { send_page_view: false });
    }
  }
}

export interface TrackedEventRecord {
  event: AnalyticsEventName;
  params?: Record<string, unknown>;
  timestamp: string;
}

const ANALYTICS_STORAGE_KEY = 'ptit_career_hub_analytics_events_v1';

// In-memory event audit log
const eventLog: TrackedEventRecord[] = [];

// Hydrate from localStorage if available
if (typeof window !== 'undefined') {
  try {
    const stored = localStorage.getItem(ANALYTICS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        eventLog.push(...parsed);
      }
    }
  } catch {
    // silent
  }
}

/**
 * Strip sensitive PII fields before transmitting to GA4
 */
function sanitizeAnalyticsParams(params?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!params) return undefined;
  const sanitized: Record<string, unknown> = {};
  const forbiddenKeys = ['email', 'phone', 'phoneNumber', 'rawCV', 'cvText', 'password', 'token', 'studentId'];

  for (const [key, val] of Object.entries(params)) {
    if (!forbiddenKeys.includes(key) && typeof val !== 'function') {
      sanitized[key] = val;
    }
  }
  return sanitized;
}

/**
 * Track an application action.
 * Dispatches to GA4 (gtag) if configured, records to local eventLog, and syncs to Firestore interactions.
 */
export function trackEvent(
  event: AnalyticsEventName,
  params?: Record<string, unknown>
): void {
  const cleanParams = sanitizeAnalyticsParams(params);

  const record: TrackedEventRecord = {
    event,
    params: cleanParams,
    timestamp: new Date().toISOString(),
  };

  eventLog.push(record);

  // Keep last 500 events in local storage
  if (typeof window !== 'undefined') {
    try {
      const slice = eventLog.slice(-500);
      localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(slice));
    } catch {
      // silent
    }
  }

  // Non-blocking log to Firestore
  logInteractionToFirestore(event, cleanParams).catch(() => {});

  // Send to GA4 if available
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    try {
      window.gtag('event', event, cleanParams);
    } catch {
      // safe fallback
    }
  }
}

/**
 * Retrieve recent events recorded in session
 */
export function getRecentEvents(): TrackedEventRecord[] {
  return [...eventLog];
}

/**
 * Compute aggregate analytics metrics from actual event logs
 */
export function getAnalyticsMetrics() {
  const events = [...eventLog];
  return {
    totalEvents: events.length,
    pageViews: events.filter((e) => e.event === 'page_view' || e.event === 'landing_page_view').length,
    careerCheckStarts: events.filter((e) => e.event === 'career_check_start').length,
    careerCheckCompletes: events.filter((e) => e.event === 'career_check_complete').length,
    jobListViews: events.filter((e) => e.event === 'job_list_view').length,
    jobViews: events.filter((e) => e.event === 'job_view').length,
    applyClicks: events.filter((e) => e.event === 'job_click_apply').length,
    eventListViews: events.filter((e) => e.event === 'event_list_view').length,
    eventViews: events.filter((e) => e.event === 'event_view').length,
    eventRegistrationClicks: events.filter((e) => e.event === 'event_click_register').length,
    cvAnalysisStarts: events.filter((e) => e.event === 'cv_analysis_start').length,
    cvAnalysisCompletes: events.filter((e) => e.event === 'cv_analysis_complete').length,
  };
}

