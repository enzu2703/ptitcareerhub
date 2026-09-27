import { FirestoreEvent, CareerEvent } from '../../types';
import { CAREER_EVENTS } from '../../data/mockData';
import {
  fetchEventsFromFirestore,
  saveEventToFirestore,
  deleteEventFromFirestore,
  isFirestoreActive,
} from '../firebase';

const EVENTS_STORAGE_KEY = 'ptit_career_hub_admin_events_v1';

/**
 * Check if a date string is in the past
 */
export function isEventExpired(event: FirestoreEvent | CareerEvent): boolean {
  if ('status' in event && event.status === 'expired') return true;

  // Handle format DD/MM/YYYY or YYYY-MM-DD
  const rawDate = event.date;
  if (!rawDate) return false;

  try {
    let eventDate: Date;
    if (rawDate.includes('/')) {
      const parts = rawDate.split('/');
      if (parts.length === 3) {
        eventDate = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10), 23, 59, 59);
      } else {
        eventDate = new Date(rawDate);
      }
    } else {
      eventDate = new Date(rawDate);
      eventDate.setHours(23, 59, 59, 999);
    }

    if (isNaN(eventDate.getTime())) return false;
    return new Date().getTime() > eventDate.getTime();
  } catch {
    return false;
  }
}

/**
 * Convert initial CareerEvent to FirestoreEvent structure
 */
function convertToFirestoreEvent(event: CareerEvent): FirestoreEvent {
  // Convert DD/MM/YYYY to YYYY-MM-DD for form standardization if possible
  let dateFormatted = event.date;
  if (event.date && event.date.includes('/')) {
    const p = event.date.split('/');
    if (p.length === 3) {
      dateFormatted = `${p[2]}-${p[1].padStart(2, '0')}-${p[0].padStart(2, '0')}`;
    }
  }

  return {
    id: event.id,
    title: event.title,
    organizer: event.organizer,
    organizerLogo: event.organizerLogo,
    date: dateFormatted,
    time: event.time || '09:00 - 11:30',
    location: event.location || 'Hà Nội',
    locationType: event.isOnline ? 'online' : (event.format === 'Hybrid' ? 'hybrid' : 'offline'),
    category: event.eventType.toLowerCase(),
    description: event.description || '',
    agenda: event.agenda ? event.agenda.map((a) => `${a.time}: ${a.activity}`) : [],
    speakers: event.speakers ? event.speakers.map((s) => ({ name: s.name, role: s.role, company: s.company, avatar: s.avatar })) : [],
    targetAudience: event.targetAudience ? event.targetAudience.join(', ') : 'Sinh viên PTIT',
    benefits: event.benefits || [],
    registrationUrl: event.registrationUrl || 'https://ptit.edu.vn/events',
    sourceUrl: event.sourceUrl || 'https://ptit.edu.vn',
    publishedAt: '2026-03-01',
    expiresAt: dateFormatted,
    status: 'active',
    verified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Convert FirestoreEvent back to UI CareerEvent
 */
export function convertToCareerEvent(fEvent: FirestoreEvent): CareerEvent {
  const parts = fEvent.date.split('-');
  const formattedDate = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : fEvent.date;
  const month = parts.length === 3 ? `THG ${parts[1]}` : 'THG 03';
  const day = parts.length === 3 ? parts[2] : '15';

  return {
    id: fEvent.id,
    title: fEvent.title,
    organizer: fEvent.organizer,
    organizerLogo: fEvent.organizerLogo || '🏢',
    eventType: (fEvent.category.charAt(0).toUpperCase() + fEvent.category.slice(1)) as any,
    format: fEvent.locationType === 'online' ? 'Trực tuyến' : fEvent.locationType === 'hybrid' ? 'Hybrid' : 'Trực tiếp',
    date: formattedDate,
    time: fEvent.time,
    month,
    day,
    location: fEvent.location,
    isOnline: fEvent.locationType === 'online',
    description: fEvent.description,
    detailedContent: fEvent.description,
    relatedSkills: ['Networking', 'Kỹ năng mềm'],
    relatedCareers: ['Marketing', 'Công nghệ', 'Kinh doanh'],
    registrationUrl: fEvent.registrationUrl,
    registrationDeadline: fEvent.expiresAt ? `${fEvent.expiresAt} (23:59)` : undefined,
    source: fEvent.organizer,
    sourceUrl: fEvent.sourceUrl,
    updatedDate: fEvent.updatedAt ? fEvent.updatedAt.split('T')[0] : '2026-03-15',
    isSaved: false,
    trainingPoints: 3,
    hasCertificate: true,
    speakers: fEvent.speakers,
    benefits: fEvent.benefits,
    targetAudience: fEvent.targetAudience ? [fEvent.targetAudience] : undefined,
  };
}

/**
 * Validate URL
 */
function isValidUrl(urlStr: string): boolean {
  if (!urlStr || typeof urlStr !== 'string') return false;
  try {
    const parsed = new URL(urlStr.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validate event before publishing
 */
export function validateEventForPublish(event: Partial<FirestoreEvent>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!event.title || !event.title.trim()) {
    errors.push('Tên sự kiện không được để trống.');
  }
  if (!event.organizer || !event.organizer.trim()) {
    errors.push('Đơn vị tổ chức không được để trống.');
  }
  if (!event.location || !event.location.trim()) {
    errors.push('Địa điểm tổ chức không được để trống.');
  }
  if (!event.description || !event.description.trim()) {
    errors.push('Mô tả sự kiện không được để trống.');
  }
  if (!event.date || !event.date.trim()) {
    errors.push('Ngày diễn ra sự kiện không được để trống.');
  }
  if (!event.registrationUrl || !isValidUrl(event.registrationUrl)) {
    errors.push('Link đăng ký tham gia (registrationUrl) phải là URL hợp lệ (bắt đầu bằng http:// hoặc https://).');
  }
  if (event.sourceUrl && !isValidUrl(event.sourceUrl)) {
    errors.push('Link nguồn thông tin (sourceUrl) phải là URL hợp lệ.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Load all events for Admin management (Firestore + Local fallback)
 */
export async function loadAllEventsFromStorage(): Promise<FirestoreEvent[]> {
  // 1. Live Firestore check
  if (isFirestoreActive()) {
    const remote = await fetchEventsFromFirestore();
    if (remote && remote.length > 0) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(remote));
      }
      return remote;
    }
  }

  // 2. Local Storage check
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(EVENTS_STORAGE_KEY);
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

  // 3. Initial Seed from CAREER_EVENTS
  const initial = CAREER_EVENTS.map(convertToFirestoreEvent);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(initial));
    } catch {
      // silent
    }
  }
  return initial;
}

/**
 * Get active, verified and unexpired events for public student view
 */
export async function getActiveEvents(useCache = true): Promise<CareerEvent[]> {
  const all = await loadAllEventsFromStorage();
  const activeFirestore = all.filter((e) => {
    if (e.status !== 'active') return false;
    if (!e.verified) return false;
    if (isEventExpired(e)) return false;
    return true;
  });

  return activeFirestore.map(convertToCareerEvent);
}

/**
 * Save / Update Event (Admin)
 */
export async function adminSaveEvent(
  eventData: Omit<FirestoreEvent, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<{ success: boolean; event?: FirestoreEvent; error?: string }> {
  const validation = validateEventForPublish(eventData);
  if (!validation.valid) {
    return { success: false, error: validation.errors.join(' ') };
  }

  const existingList = await loadAllEventsFromStorage();
  const isEditing = !!eventData.id;
  const eventId = isEditing ? eventData.id! : `event_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const finalEvent: FirestoreEvent = {
    ...eventData,
    id: eventId,
    createdAt: isEditing
      ? existingList.find((e) => e.id === eventId)?.createdAt || new Date().toISOString()
      : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updatedList = isEditing
    ? existingList.map((e) => (e.id === eventId ? finalEvent : e))
    : [finalEvent, ...existingList];

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(updatedList));
    } catch (err) {
      console.warn('Failed to save to local storage:', err);
    }
  }

  // Firestore sync
  if (isFirestoreActive()) {
    await saveEventToFirestore(finalEvent).catch(() => {});
  }

  return { success: true, event: finalEvent };
}

/**
 * Toggle Event Status (Admin)
 */
export async function adminToggleEventStatus(
  eventId: string,
  newStatus: 'active' | 'hidden' | 'expired'
): Promise<boolean> {
  const events = await loadAllEventsFromStorage();
  const target = events.find((e) => e.id === eventId);
  if (!target) return false;

  target.status = newStatus;
  target.updatedAt = new Date().toISOString();

  if (typeof window !== 'undefined') {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
  }

  if (isFirestoreActive()) {
    await saveEventToFirestore(target).catch(() => {});
  }
  return true;
}

/**
 * Verify Event (Admin)
 */
export async function adminVerifyEvent(eventId: string, verified: boolean): Promise<boolean> {
  const events = await loadAllEventsFromStorage();
  const target = events.find((e) => e.id === eventId);
  if (!target) return false;

  target.verified = verified;
  target.updatedAt = new Date().toISOString();

  if (typeof window !== 'undefined') {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
  }

  if (isFirestoreActive()) {
    await saveEventToFirestore(target).catch(() => {});
  }
  return true;
}

/**
 * Delete Event (Admin)
 */
export async function adminDeleteEvent(eventId: string): Promise<boolean> {
  const events = await loadAllEventsFromStorage();
  const updated = events.filter((e) => e.id !== eventId);

  if (typeof window !== 'undefined') {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(updated));
  }

  if (isFirestoreActive()) {
    await deleteEventFromFirestore(eventId).catch(() => {});
  }
  return true;
}
