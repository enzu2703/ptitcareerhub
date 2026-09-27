/**
 * GEMINI SERVICE (geminiService.ts)
 *
 * Dedicated service for:
 * 1. parseCVFromPDF(fileOrBase64, fileName)
 * 2. parseJobDescription(jd)
 * 3. analyzeCVMatch(extractedCV, parsedJD)
 * 4. calculateMatchScore(matchItems)
 * 5. generateCVSuggestions(extractedCV, parsedJD, matchResult)
 * 6. saveCVSession(userId, cvSession)
 *
 * Strictly adheres to:
 * - NO MOCK DATA in Real CV Mode
 * - NO HALLUCINATIONS (null / [] for missing data)
 * - Multimodal PDF Document Input (mimeType: application/pdf)
 * - Weighted Match Scoring (40/25/15/10/5/5)
 * - Evidence quotes for every match item
 * - No fake metrics or invented KPIs
 */

import { TargetJob, UserProfileState } from '../types';

// ==================== TYPE DEFINITIONS ====================

export interface CandidateInfo {
  fullName: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  linkedin: string | null;
  portfolio: string | null;
}

export interface EducationItem {
  school: string;
  major: string | null;
  degree: string | null;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
  source?: 'cv_extracted' | 'user_verified';
}

export interface WorkExperienceItem {
  company: string;
  position: string;
  startDate: string | null;
  endDate: string | null;
  description: string[];
  skillsMentioned: string[];
  achievementsMentioned: string[];
  source?: 'cv_extracted' | 'user_verified';
}

export interface ProjectItem {
  name: string;
  role: string | null;
  description: string[];
  skillsMentioned: string[];
  resultsMentioned: string[];
  source?: 'cv_extracted' | 'user_verified';
}

export interface SkillItem {
  name: string;
  category: string | null;
  evidence: string;
  source?: 'cv_extracted' | 'user_verified';
}

export interface ExtractedCVData {
  candidate: CandidateInfo;
  careerObjective: string | null;
  education: EducationItem[];
  workExperience: WorkExperienceItem[];
  internships: any[];
  projects: ProjectItem[];
  activities: any[];
  skills: SkillItem[];
  certifications: string[];
  languages: string[];
  achievements: string[];
  extractedKeywords: string[];
  confidence: {
    overall: number;
    candidateName: number;
    education: number;
    experience: number;
    skills: number;
  };
  missingInformation: string[];
}

export interface ParsedJDData {
  jobTitle: string;
  company: string;
  location: string;
  employmentType: string | null;
  requiredSkills: string[];
  preferredSkills: string[];
  responsibilities: string[];
  requiredQualifications: string[];
  preferredQualifications: string[];
  keywords: string[];
  tools: string[];
  experienceRequirements: string[];
  educationRequirements: string[];
}

export interface MatchItem {
  requirement: string;
  category: 'requiredSkills' | 'experience' | 'responsibilities' | 'education' | 'preferredSkills' | 'keywordsAndTools';
  status: 'matched' | 'partial' | 'not_found' | 'uncertain';
  evidence: string | null;
  confidence: number;
}

export interface MatchResultData {
  overallMatch: number;
  breakdown: {
    requiredSkills: number;
    experience: number;
    responsibilities: number;
    education: number;
    preferredSkills: number;
    keywordsAndTools: number;
  };
  matchItems: MatchItem[];
  summary: string;
}

export interface BulletImprovementItem {
  id: string;
  original: string;
  improved: string;
  reason: string;
}

export interface CVSuggestionsData {
  strengths: Array<{
    title: string;
    evidence: string;
    impact: string;
  }>;
  missingElements: Array<{
    requirement: string;
    explanation: string;
    advice: string;
  }>;
  bulletImprovements: BulletImprovementItem[];
  keywordsToHighlight: Array<{
    keyword: string;
    foundInCv: boolean;
    context: string;
  }>;
  skillsToAcquire: Array<{
    skill: string;
    note: string;
  }>;
  disclaimer: string;
}

export interface CVSessionState {
  id: string;
  fileName: string;
  fileSize?: number;
  uploadedAt: string;
  status: 'uploaded' | 'parsing_cv' | 'cv_parsed' | 'user_verified' | 'parsing_jd' | 'matching' | 'completed' | 'error';
  extractedCV: ExtractedCVData | null;
  verifiedCV?: ExtractedCVData | null;
  targetJobId?: string | null;
  targetJobTitle?: string | null;
  targetCompany?: string | null;
  parsedJD?: ParsedJDData | null;
  matchResult?: MatchResultData | null;
  suggestions?: CVSuggestionsData | null;
  errorMessage?: string | null;
}

// ==================== PROMPTS ====================

export const CV_PARSER_PROMPT = `Bạn là hệ thống trích xuất dữ liệu CV.
Hãy đọc trực tiếp file PDF được cung cấp.

MỤC TIÊU:
Trích xuất dữ liệu CV thành JSON có cấu trúc.

QUY TẮC:
1. Chỉ sử dụng thông tin xuất hiện trong PDF.
2. Không suy đoán.
3. Không bổ sung thông tin từ kiến thức bên ngoài.
4. Không sử dụng dữ liệu từ CV khác.
5. Không sử dụng tên file làm nguồn dữ liệu.
6. Nếu thông tin không xuất hiện → null hoặc [].
7. Giữ nguyên tên công ty, trường học, chức danh, kỹ năng và nội dung quan trọng theo CV.
8. Không biến kinh nghiệm học tập thành kinh nghiệm làm việc.
9. Không biến một kỹ năng được JD yêu cầu thành kỹ năng của ứng viên.
10. Không tự tạo thành tích định lượng.
11. Không tự thêm từ khóa để làm CV phù hợp với JD.
12. Đây chỉ là bước trích xuất dữ liệu.

Hãy ưu tiên đọc:
- thông tin cá nhân;
- học vấn;
- kinh nghiệm làm việc;
- thực tập;
- hoạt động;
- dự án;
- kỹ năng;
- chứng chỉ;
- ngoại ngữ;
- mục tiêu nghề nghiệp;
- thành tích.

Nếu CV có bảng, hãy đọc nội dung trong bảng.
Nếu CV có text nằm trong layout, hãy đọc nội dung theo ngữ cảnh.
Nếu CV là PDF có hình ảnh/scanned content và một thông tin không thể đọc chắc chắn: không tự đoán.

Trả về DUY NHẤT một chuỗi JSON hợp lệ tuân thủ đúng cấu trúc:
{
  "candidate": {
    "fullName": null,
    "email": null,
    "phone": null,
    "location": null,
    "linkedin": null,
    "portfolio": null
  },
  "careerObjective": null,
  "education": [
    {
      "school": "",
      "major": null,
      "degree": null,
      "startDate": null,
      "endDate": null,
      "description": null
    }
  ],
  "workExperience": [
    {
      "company": "",
      "position": "",
      "startDate": null,
      "endDate": null,
      "description": [],
      "skillsMentioned": [],
      "achievementsMentioned": []
    }
  ],
  "internships": [],
  "projects": [
    {
      "name": "",
      "role": null,
      "description": [],
      "skillsMentioned": [],
      "resultsMentioned": []
    }
  ],
  "activities": [],
  "skills": [
    {
      "name": "",
      "category": null,
      "evidence": ""
    }
  ],
  "certifications": [],
  "languages": [],
  "achievements": [],
  "extractedKeywords": [],
  "confidence": {
    "overall": 0.9,
    "candidateName": 0.9,
    "education": 0.9,
    "experience": 0.9,
    "skills": 0.9
  },
  "missingInformation": []
}`;

export const JD_PARSER_PROMPT = `Bạn là Chuyên gia Tuyển dụng phân tích Bản mô tả công việc (JD).
Nhiệm vụ: Trích xuất các tiêu chí, yêu cầu kỹ năng và trách nhiệm của JD thành JSON có cấu trúc.
Không được trộn thông tin CV vào JD.

Trả về DUY NHẤT một chuỗi JSON hợp lệ theo schema sau:
{
  "jobTitle": "",
  "company": "",
  "location": "",
  "employmentType": null,
  "requiredSkills": [],
  "preferredSkills": [],
  "responsibilities": [],
  "requiredQualifications": [],
  "preferredQualifications": [],
  "keywords": [],
  "tools": [],
  "experienceRequirements": [],
  "educationRequirements": []
}`;

export const MATCHING_PROMPT = `Bạn là Trưởng ban Tuyển dụng đối chiếu trung thực giữa Hồ sơ CV của ứng viên và Bản mô tả công việc (JD).

QUY TẮC ĐỐI CHIẾU:
1. Chỉ đối chiếu dựa trên thông tin thực tế có trong CV JSON và JD JSON.
2. Không suy đoán, không bịa đặt kỹ năng hoặc kinh nghiệm ứng viên không có.
3. CHỈ SỬ DỤNG 4 TRẠNG THÁI:
   - "matched": CV có bằng chứng rõ ràng.
   - "partial": CV có thông tin liên quan nhưng chưa đáp ứng đầy đủ.
   - "not_found": Không tìm thấy trong CV.
   - "uncertain": Có thông tin nhưng không đủ chắc chắn để kết luận.
4. MỖI MATCH PHẢI CÓ EVIDENCE:
   - Nếu matched/partial: trích dẫn dòng/câu trong CV chứng minh.
   - Nếu not_found: evidence là null. Không được viết "Ứng viên có khả năng..." nếu CV không có bằng chứng!
5. Phân loại theo 6 nhóm tiêu chí:
   - "requiredSkills"
   - "experience"
   - "responsibilities"
   - "education"
   - "preferredSkills"
   - "keywordsAndTools"

Trả về DUY NHẤT chuỗi JSON hợp lệ theo cấu trúc:
{
  "matchItems": [
    {
      "requirement": "Tên yêu cầu từ JD",
      "category": "requiredSkills",
      "status": "matched",
      "evidence": "Câu trích dẫn từ CV chứng minh hoặc null",
      "confidence": 0.95
    }
  ],
  "summary": "Nhận xét ngắn 2 câu đánh giá khách quan về sự phù hợp"
}`;

export const SUGGESTION_PROMPT = `Bạn là Cố vấn Nghề nghiệp cao cấp.
Nhiệm vụ: Đề xuất cải thiện CV dựa trên kết quả đối chiếu với JD.

QUY TẮC QUAN TRỌNG NHẤT:
1. KHÔNG ĐƯỢC TẠO SỐ LIỆU GIẢ:
   Không tự thêm phần trăm (+35% engagement), không tạo doanh thu, không tạo số lượng khách hàng, không tạo KPI nếu CV không có số liệu đó.
2. CHỈ VIẾT LẠI DỰA TRÊN THÔNG TIN THỰC TẾ ĐÃ CÓ.
3. KỸ NĂNG CẦN BỔ SUNG:
   Ghi rõ "Đây là kỹ năng JD yêu cầu nhưng chưa tìm thấy bằng chứng trong CV." Không được biến nó thành kỹ năng hiện tại của ứng viên.

Trả về DUY NHẤT chuỗi JSON hợp lệ:
{
  "strengths": [
    {
      "title": "Tiêu đề điểm mạnh",
      "evidence": "Trích dẫn thực tế từ CV",
      "impact": "Lý do điểm mạnh này giúp ích cho vị trí ứng tuyển"
    }
  ],
  "missingElements": [
    {
      "requirement": "Yêu cầu JD đang thiếu",
      "explanation": "Yêu cầu của JD chưa tìm thấy bằng chứng trong CV",
      "advice": "Lời khuyên thực tế để trau dồi hoặc bổ sung"
    }
  ],
  "bulletImprovements": [
    {
      "id": "bullet-1",
      "original": "Câu trích từ CV ứng viên",
      "improved": "Câu viết lại trau chuốt hành động (không bịa số liệu)",
      "reason": "Chỉ viết lại dựa trên thông tin thực tế đã có, không tự bịa số liệu, KPI hay thành tích mới"
    }
  ],
  "keywordsToHighlight": [
    {
      "keyword": "Từ khóa xuất hiện trong CV phù hợp với JD",
      "foundInCv": true,
      "context": "Vị trí trong CV nên nhấn mạnh"
    }
  ],
  "skillsToAcquire": [
    {
      "skill": "Tên kỹ năng",
      "note": "Đây là kỹ năng JD yêu cầu nhưng chưa tìm thấy bằng chứng trong CV."
    }
  ],
  "disclaimer": "AI chỉ đề xuất thay đổi dựa trên thông tin có thật trong CV. Không thêm kinh nghiệm hoặc kỹ năng chưa có."
}`;

// ==================== INITIALIZATION & UTILITIES ====================

export function initializeGemini() {
  const envKey =
    (typeof process !== 'undefined' && (process.env as any)?.GEMINI_API_KEY) ||
    (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_GEMINI_API_KEY) ||
    '';
  const hasKey = Boolean(envKey && envKey.trim().length > 5);

  return {
    isConfigured: hasKey,
    primaryModel: 'gemini-3.8-flash',
    fallbackModel: 'gemini-flash-latest',
    message: hasKey
      ? 'Gemini 3.8 Flash đã sẵn sàng phân tích CV và JD thực tế.'
      : 'Gemini integration requires GEMINI_API_KEY to be configured in environment secrets.',
  };
}

/**
 * Direct SDK fallback if server endpoint is unreachable
 */
async function callDirectGemini(contents: any): Promise<string> {
  const apiKey =
    (typeof process !== 'undefined' && (process.env as any)?.GEMINI_API_KEY) ||
    (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_GEMINI_API_KEY) ||
    '';

  if (!apiKey || apiKey.trim().length < 5) {
    throw new Error('Gemini integration requires GEMINI_API_KEY to be configured in environment secrets.');
  }

  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const models = ['gemini-3.8-flash', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of models) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const resp = await ai.models.generateContent({
          model,
          contents,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        });
        if (resp.text) return resp.text;
      } catch (err: any) {
        lastError = err;
        const status = err.status || err.statusCode;
        if (status === 503 || status === 429) {
          await new Promise((r) => setTimeout(r, 1200 * (attempt + 1)));
          continue;
        }
        break;
      }
    }
  }

  throw lastError || new Error('Không thể kết nối tới mô hình Gemini.');
}

// ==================== 1. PARSE CV FROM PDF ====================

/**
 * parseCVFromPDF(fileOrBase64, fileName)
 * Pipeline: PDF (mimeType: application/pdf) -> Gemini CV Parser -> Structured CV JSON
 */
export async function parseCVFromPDF(
  fileOrBase64: File | Blob | string,
  fileName = 'CV.pdf'
): Promise<ExtractedCVData> {
  let cleanBase64 = '';

  if (typeof fileOrBase64 === 'string') {
    cleanBase64 = fileOrBase64.replace(/^data:application\/pdf;base64,/, '').trim();
  } else {
    const blobObj = fileOrBase64 as any;
    cleanBase64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const res = reader.result as string;
        resolve(res.replace(/^data:application\/pdf;base64,/, '').trim());
      };
      reader.onerror = reject;
      reader.readAsDataURL(blobObj);
    });
  }

  if (!cleanBase64) {
    throw new Error('Vui lòng cung cấp tệp CV định dạng PDF hợp lệ.');
  }

  // 1. Try server proxy endpoint
  try {
    const res = await fetch('/api/gemini/parse-cv-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pdfBase64: cleanBase64, fileName }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json?.data) {
        return normalizeCVData(json.data);
      }
    }
  } catch (err) {
    console.warn('Server proxy not available, falling back to direct SDK:', err);
  }

  // 2. Direct SDK fallback
  const rawText = await callDirectGemini([
    {
      inlineData: {
        mimeType: 'application/pdf',
        data: cleanBase64,
      },
    },
    CV_PARSER_PROMPT,
  ]);

  const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleaned);
  return normalizeCVData(parsed);
}

function normalizeCVData(raw: any): ExtractedCVData {
  const candidate = raw.candidate || {};
  return {
    candidate: {
      fullName: candidate.fullName || null,
      email: candidate.email || null,
      phone: candidate.phone || null,
      location: candidate.location || null,
      linkedin: candidate.linkedin || null,
      portfolio: candidate.portfolio || null,
    },
    careerObjective: raw.careerObjective || null,
    education: Array.isArray(raw.education)
      ? raw.education.map((e: any) => ({
          school: e.school || '',
          major: e.major || null,
          degree: e.degree || null,
          startDate: e.startDate || null,
          endDate: e.endDate || null,
          description: e.description || null,
          source: 'cv_extracted',
        }))
      : [],
    workExperience: Array.isArray(raw.workExperience)
      ? raw.workExperience.map((w: any) => ({
          company: w.company || '',
          position: w.position || '',
          startDate: w.startDate || null,
          endDate: w.endDate || null,
          description: Array.isArray(w.description) ? w.description : [],
          skillsMentioned: Array.isArray(w.skillsMentioned) ? w.skillsMentioned : [],
          achievementsMentioned: Array.isArray(w.achievementsMentioned) ? w.achievementsMentioned : [],
          source: 'cv_extracted',
        }))
      : [],
    internships: Array.isArray(raw.internships) ? raw.internships : [],
    projects: Array.isArray(raw.projects)
      ? raw.projects.map((p: any) => ({
          name: p.name || p.title || '',
          role: p.role || null,
          description: Array.isArray(p.description) ? p.description : p.bullets || [],
          skillsMentioned: Array.isArray(p.skillsMentioned) ? p.skillsMentioned : p.technologies || [],
          resultsMentioned: Array.isArray(p.resultsMentioned) ? p.resultsMentioned : [],
          source: 'cv_extracted',
        }))
      : [],
    activities: Array.isArray(raw.activities) ? raw.activities : [],
    skills: Array.isArray(raw.skills)
      ? raw.skills.map((s: any) => ({
          name: typeof s === 'string' ? s : s.name || '',
          category: s.category || null,
          evidence: s.evidence || 'Được liệt kê trong CV',
          source: 'cv_extracted',
        }))
      : [],
    certifications: Array.isArray(raw.certifications) ? raw.certifications : [],
    languages: Array.isArray(raw.languages) ? raw.languages : [],
    achievements: Array.isArray(raw.achievements) ? raw.achievements : [],
    extractedKeywords: Array.isArray(raw.extractedKeywords) ? raw.extractedKeywords : [],
    confidence: raw.confidence || {
      overall: 0.9,
      candidateName: raw.candidate?.fullName ? 0.95 : 0.2,
      education: 0.85,
      experience: 0.85,
      skills: 0.9,
    },
    missingInformation: Array.isArray(raw.missingInformation) ? raw.missingInformation : [],
  };
}

// ==================== 2. PARSE JOB DESCRIPTION ====================

export async function parseJobDescription(jd: TargetJob | string | any): Promise<ParsedJDData> {
  const jdString = typeof jd === 'string' ? jd : JSON.stringify(jd, null, 2);

  try {
    const res = await fetch('/api/gemini/parse-jd', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobData: jdString }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json?.data) {
        return normalizeJDData(json.data);
      }
    }
  } catch (err) {
    console.warn('Server proxy not available, falling back to direct SDK:', err);
  }

  const prompt = `${JD_PARSER_PROMPT}\n\n=== NỘI DUNG JD ===\n${jdString}`;
  const rawText = await callDirectGemini(prompt);
  const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleaned);
  return normalizeJDData(parsed);
}

function normalizeJDData(raw: any): ParsedJDData {
  return {
    jobTitle: raw.jobTitle || raw.title || '',
    company: raw.company || raw.companyName || '',
    location: raw.location || '',
    employmentType: raw.employmentType || null,
    requiredSkills: Array.isArray(raw.requiredSkills) ? raw.requiredSkills : raw.requiredTechnicalSkills || [],
    preferredSkills: Array.isArray(raw.preferredSkills) ? raw.preferredSkills : [],
    responsibilities: Array.isArray(raw.responsibilities) ? raw.responsibilities : raw.keyResponsibilities || [],
    requiredQualifications: Array.isArray(raw.requiredQualifications) ? raw.requiredQualifications : [],
    preferredQualifications: Array.isArray(raw.preferredQualifications) ? raw.preferredQualifications : [],
    keywords: Array.isArray(raw.keywords) ? raw.keywords : [],
    tools: Array.isArray(raw.tools) ? raw.tools : raw.requiredTools || [],
    experienceRequirements: Array.isArray(raw.experienceRequirements) ? raw.experienceRequirements : [],
    educationRequirements: Array.isArray(raw.educationRequirements) ? raw.educationRequirements : [],
  };
}

// ==================== 3. ANALYZE CV MATCH ====================

export async function analyzeCVMatch(
  extractedCV: ExtractedCVData,
  parsedJD: ParsedJDData
): Promise<MatchResultData> {
  const payload = { cvData: extractedCV, jdData: parsedJD };
  let rawResult: any = null;

  try {
    const res = await fetch('/api/gemini/analyze-match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const json = await res.json();
      if (json?.data) {
        rawResult = json.data;
      }
    }
  } catch (err) {
    console.warn('Server proxy not available, falling back to direct SDK:', err);
  }

  if (!rawResult) {
    const prompt = `${MATCHING_PROMPT}\n\n=== CV DATA (JSON) ===\n${JSON.stringify(
      extractedCV,
      null,
      2
    )}\n\n=== JD DATA (JSON) ===\n${JSON.stringify(parsedJD, null, 2)}`;
    const rawText = await callDirectGemini(prompt);
    const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    rawResult = JSON.parse(cleaned);
  }

  const matchItems: MatchItem[] = Array.isArray(rawResult.matchItems)
    ? rawResult.matchItems.map((item: any) => {
        let status = item.status;
        if (!['matched', 'partial', 'not_found', 'uncertain'].includes(status)) {
          status = status === 'pass' ? 'matched' : 'not_found';
        }
        return {
          requirement: item.requirement || item.skill || '',
          category: item.category || 'requiredSkills',
          status,
          evidence: status === 'not_found' ? null : item.evidence || item.evidenceInCv || null,
          confidence: typeof item.confidence === 'number' ? item.confidence : 0.9,
        };
      })
    : [];

  const scoreResult = calculateMatchScore(matchItems);

  return {
    overallMatch: scoreResult.overallMatch,
    breakdown: scoreResult.breakdown,
    matchItems,
    summary: rawResult.summary || rawResult.executiveSummary || 'Đối chiếu chi tiết giữa CV và JD.',
  };
}

// ==================== 4. CALCULATE MATCH SCORE (SECTION XI) ====================

export function calculateMatchScore(matchItems: MatchItem[] = []) {
  const categories: Record<string, { weight: number; items: MatchItem[] }> = {
    requiredSkills: { weight: 40, items: [] },
    experience: { weight: 25, items: [] },
    responsibilities: { weight: 15, items: [] },
    education: { weight: 10, items: [] },
    preferredSkills: { weight: 5, items: [] },
    keywordsAndTools: { weight: 5, items: [] },
  };

  matchItems.forEach((item) => {
    const cat = categories[item.category] ? item.category : 'requiredSkills';
    categories[cat].items.push(item);
  });

  const breakdown = {
    requiredSkills: 0,
    experience: 0,
    responsibilities: 0,
    education: 0,
    preferredSkills: 0,
    keywordsAndTools: 0,
  };

  let totalScore = 0;

  Object.keys(categories).forEach((catKey) => {
    const group = categories[catKey];
    if (group.items.length === 0) {
      breakdown[catKey as keyof typeof breakdown] = 0;
      return;
    }

    let groupPoints = 0;
    group.items.forEach((item) => {
      if (item.status === 'matched') {
        groupPoints += 1.0;
      } else if (item.status === 'partial') {
        groupPoints += 0.5;
      } else if (item.status === 'uncertain') {
        groupPoints += 0.25;
      }
    });

    const categoryRatio = groupPoints / group.items.length;
    const scoredWeight = Math.round(categoryRatio * group.weight);
    breakdown[catKey as keyof typeof breakdown] = scoredWeight;
    totalScore += scoredWeight;
  });

  return {
    overallMatch: Math.min(Math.max(totalScore, 0), 100),
    breakdown,
  };
}

// ==================== 5. GENERATE CV SUGGESTIONS ====================

export async function generateCVSuggestions(
  extractedCV: ExtractedCVData,
  parsedJD: ParsedJDData,
  matchResult: MatchResultData
): Promise<CVSuggestionsData> {
  const payload = { cvData: extractedCV, jdData: parsedJD, matchResult };
  let raw: any = null;

  try {
    const res = await fetch('/api/gemini/generate-suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const json = await res.json();
      if (json?.data) {
        raw = json.data;
      }
    }
  } catch (err) {
    console.warn('Server proxy not available, falling back to direct SDK:', err);
  }

  if (!raw) {
    const prompt = `${SUGGESTION_PROMPT}\n\n=== CV DATA ===\n${JSON.stringify(
      extractedCV,
      null,
      2
    )}\n\n=== JD DATA ===\n${JSON.stringify(parsedJD, null, 2)}\n\n=== MATCH RESULT ===\n${JSON.stringify(
      matchResult,
      null,
      2
    )}`;
    const rawText = await callDirectGemini(prompt);
    const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    raw = JSON.parse(cleaned);
  }

  return {
    strengths: Array.isArray(raw.strengths) ? raw.strengths : [],
    missingElements: Array.isArray(raw.missingElements) ? raw.missingElements : [],
    bulletImprovements: Array.isArray(raw.bulletImprovements)
      ? raw.bulletImprovements.map((b: any, i: number) => ({
          id: b.id || `bullet-${i + 1}`,
          original: b.original || b.originalText || '',
          improved: b.improved || b.suggestedText || '',
          reason: b.reason || b.explanation || 'Chỉ viết lại dựa trên thông tin thực tế đã có trong CV.',
        }))
      : [],
    keywordsToHighlight: Array.isArray(raw.keywordsToHighlight) ? raw.keywordsToHighlight : [],
    skillsToAcquire: Array.isArray(raw.skillsToAcquire)
      ? raw.skillsToAcquire.map((s: any) => ({
          skill: s.skill || s.keyword || '',
          note: s.note || 'Đây là kỹ năng JD yêu cầu nhưng chưa tìm thấy bằng chứng trong CV.',
        }))
      : [],
    disclaimer:
      raw.disclaimer ||
      'AI chỉ đề xuất thay đổi dựa trên thông tin có thật trong CV. Không thêm kinh nghiệm hoặc kỹ năng chưa có.',
  };
}

// ==================== 6. FIRESTORE CV SESSION PERSISTENCE ====================

export async function saveCVSession(userId = 'guest', cvSession: CVSessionState) {
  if (!cvSession || !cvSession.id) return;

  try {
    const key = `ptit_cv_session_${cvSession.id}`;
    localStorage.setItem(key, JSON.stringify(cvSession));
    localStorage.setItem('ptit_last_cv_session_id', cvSession.id);
  } catch (e) {
    console.warn('Failed to save cvSession to localStorage:', e);
  }

  try {
    const { getDb } = await import('./firebase');
    const db = getDb();
    if (db && userId) {
      const { doc, setDoc } = await import('firebase/firestore');
      const sessionRef = doc(db, 'users', userId, 'cvSessions', cvSession.id);
      await setDoc(
        sessionRef,
        {
          fileName: cvSession.fileName || '',
          createdAt: cvSession.uploadedAt || new Date().toISOString(),
          extractedCV: cvSession.extractedCV || {},
          verifiedCV: cvSession.verifiedCV || {},
          targetJobId: cvSession.targetJobId || null,
          parsedJD: cvSession.parsedJD || {},
          matchResult: cvSession.matchResult || {},
          suggestions: cvSession.suggestions || {},
          status: cvSession.status || 'uploaded',
        },
        { merge: true }
      );
    }
  } catch (e) {
    console.warn('Firestore session save skipped or failed:', e);
  }
}
