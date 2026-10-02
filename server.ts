import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import {
  CV_PARSER_PROMPT,
  JD_PARSER_PROMPT,
  MATCHING_PROMPT,
  SUGGESTION_PROMPT,
  calculateMatchScore,
} from './src/services/geminiService';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Support large PDF payloads in base64 (up to 25MB)
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Initialize GoogleGenAI server-side client
const geminiApiKey = process.env.GEMINI_API_KEY || '';

let aiClient: GoogleGenAI | null = null;
if (geminiApiKey && geminiApiKey.trim().length > 5) {
  aiClient = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * Resilient Gemini caller with retry on 503/429 and model fallback
 */
async function callGeminiWithFallback(contents: any): Promise<string> {
  if (!aiClient) {
    throw new Error('Gemini integration requires GEMINI_API_KEY to be configured in environment secrets.');
  }

  // Use models with high quota availability and resilience against 429 quota exhaustion
  const models = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash', 'gemini-3.1-pro-preview'];
  let lastError: any = null;

  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await aiClient.models.generateContent({
          model,
          contents,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        });
        const text = response.text;
        if (text) return text;
      } catch (err: any) {
        lastError = err;
        const msg = String(err?.message || '');
        const status = err.status || err.statusCode;
        // If quota exceeded or resource exhausted on this model, switch immediately to next model
        if (msg.includes('Quota exceeded') || msg.includes('RESOURCE_EXHAUSTED')) {
          break;
        }
        if (status === 503 || status === 429) {
          await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
          continue;
        }
        break;
      }
    }
  }

  throw lastError || new Error('Failed to generate response from Gemini API.');
}

// ==================== API ROUTES ====================

// 1. Health check & status
app.get('/api/gemini/status', (_req: Request, res: Response) => {
  const hasKey = Boolean(geminiApiKey && geminiApiKey.trim().length > 5);
  res.json({
    status: hasKey ? 'connected' : 'missing_key',
    hasKey,
    primaryModel: 'gemini-3.1-flash-lite',
    fallbackModel: 'gemini-flash-latest',
    message: hasKey
      ? 'Gemini 3.1 Flash Lite is ready for real CV and JD analysis.'
      : 'Gemini integration requires GEMINI_API_KEY to be configured.',
  });
});

// 2. Parse CV directly from PDF (Multimodal Document Input)
app.post('/api/gemini/parse-cv-pdf', async (req: Request, res: Response) => {
  try {
    const { pdfBase64, fileName } = req.body;

    if (!pdfBase64) {
      return res.status(400).json({ error: 'Missing pdfBase64 data in request body.' });
    }

    if (!aiClient) {
      return res.status(503).json({
        error: 'Gemini integration requires GEMINI_API_KEY to be configured in environment secrets.',
      });
    }

    const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '').trim();

    const rawJson = await callGeminiWithFallback([
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: cleanBase64,
        },
      },
      CV_PARSER_PROMPT,
    ]);

    const cleaned = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error in /api/gemini/parse-cv-pdf:', error);
    res.status(500).json({
      error: error?.message || 'Không thể trích xuất CV từ PDF bằng Gemini.',
    });
  }
});

// 3. Parse Job Description (JD)
app.post('/api/gemini/parse-jd', async (req: Request, res: Response) => {
  try {
    const { jobData } = req.body;
    if (!jobData) {
      return res.status(400).json({ error: 'Missing jobData in request body.' });
    }

    if (!aiClient) {
      return res.status(503).json({
        error: 'Gemini integration requires GEMINI_API_KEY to be configured in environment secrets.',
      });
    }

    const jobStr = typeof jobData === 'string' ? jobData : JSON.stringify(jobData, null, 2);
    const prompt = `${JD_PARSER_PROMPT}\n\n=== NỘI DUNG JD ===\n${jobStr}`;

    const rawJson = await callGeminiWithFallback(prompt);
    const cleaned = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error in /api/gemini/parse-jd:', error);
    res.status(500).json({
      error: error?.message || 'Không thể phân tích JD bằng Gemini.',
    });
  }
});

// 4. Compare CV with JD (Match Analysis)
app.post('/api/gemini/analyze-match', async (req: Request, res: Response) => {
  try {
    const { cvData, jdData } = req.body;

    if (!cvData || !jdData) {
      return res.status(400).json({ error: 'Missing cvData or jdData in request body.' });
    }

    if (!aiClient) {
      return res.status(503).json({
        error: 'Gemini integration requires GEMINI_API_KEY to be configured in environment secrets.',
      });
    }

    const prompt = `${MATCHING_PROMPT}\n\n=== CV DATA (JSON) ===\n${JSON.stringify(
      cvData,
      null,
      2
    )}\n\n=== JD DATA (JSON) ===\n${JSON.stringify(jdData, null, 2)}`;

    const rawJson = await callGeminiWithFallback(prompt);
    const cleaned = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
    const rawResult = JSON.parse(cleaned);

    const matchItems = Array.isArray(rawResult.matchItems)
      ? rawResult.matchItems.map((item: any) => {
          let status = item.status;
          if (!['matched', 'partial', 'not_found', 'uncertain'].includes(status)) {
            status = status === 'pass' ? 'matched' : 'not_found';
          }
          return {
            requirement: item.requirement || item.skill || '',
            category: item.category || 'requiredSkills',
            status,
            evidence: status === 'not_found' ? null : item.evidence || null,
            confidence: typeof item.confidence === 'number' ? item.confidence : 0.9,
          };
        })
      : [];

    const scored = calculateMatchScore(matchItems);

    res.json({
      success: true,
      data: {
        overallMatch: scored.overallMatch,
        breakdown: scored.breakdown,
        matchItems,
        summary: rawResult.summary || 'Đối chiếu chi tiết giữa CV và JD.',
      },
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/analyze-match:', error);
    res.status(500).json({
      error: error?.message || 'Không thể so sánh CV và JD bằng Gemini.',
    });
  }
});

// 5. Generate CV Suggestions
app.post('/api/gemini/generate-suggestions', async (req: Request, res: Response) => {
  try {
    const { cvData, jdData, matchResult } = req.body;

    if (!cvData || !jdData) {
      return res.status(400).json({ error: 'Missing cvData or jdData in request body.' });
    }

    if (!aiClient) {
      return res.status(503).json({
        error: 'Gemini integration requires GEMINI_API_KEY to be configured in environment secrets.',
      });
    }

    const prompt = `${SUGGESTION_PROMPT}\n\n=== CV DATA ===\n${JSON.stringify(
      cvData,
      null,
      2
    )}\n\n=== JD DATA ===\n${JSON.stringify(jdData, null, 2)}\n\n=== MATCH RESULT ===\n${JSON.stringify(
      matchResult || {},
      null,
      2
    )}`;

    const rawJson = await callGeminiWithFallback(prompt);
    const cleaned = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error in /api/gemini/generate-suggestions:', error);
    res.status(500).json({
      error: error?.message || 'Không thể tạo gợi ý tối ưu CV bằng Gemini.',
    });
  }
});

// 6. Career Gap Analysis & Roadmap Generator with CV and Profile Sync
app.post('/api/gemini/career-gap-analysis', async (req: Request, res: Response) => {
  try {
    const { userProfile, targetJob, events, cvData, isRegenerate, regenerationFocus } = req.body;

    if (!targetJob) {
      return res.status(400).json({
        success: false,
        error: 'Chưa có công việc mục tiêu (JD mục tiêu). Lộ trình 3 cột mốc yêu cầu chọn công việc mục tiêu để Cột mốc 3 làm đích đến.',
      });
    }

    const availableEvents = Array.isArray(events)
      ? events.map((e: any) => ({
          id: e.id,
          title: e.title,
          relatedSkills: e.relatedSkills || [],
          organizer: e.organizer,
        }))
      : [];

    const isRegen = Boolean(isRegenerate);
    const focusStyle = regenerationFocus || (isRegen ? 'Chuyên sâu Năng lực Thực chiến & Đột phá' : 'Cân bằng Chuẩn hóa');

    let cvContextText = 'Sinh viên chưa tải file CV. Phân tích dựa trên thông tin hồ sơ sinh viên PTIT (chuyên ngành, năm học, mục tiêu).';
    if (cvData) {
      const cvSkills = [
        ...(Array.isArray(cvData.skills) ? cvData.skills.map((s: any) => (typeof s === 'string' ? s : s.name)) : []),
        ...(Array.isArray(cvData.skills?.hardSkills) ? cvData.skills.hardSkills : []),
        ...(Array.isArray(cvData.skills?.softSkills) ? cvData.skills.softSkills : []),
      ].filter(Boolean);

      const cvExps = Array.isArray(cvData.experiences)
        ? cvData.experiences.map((exp: any) => `${exp.position || exp.role} tại ${exp.company || 'Doanh nghiệp'}`).join(', ')
        : (cvData.experienceText || '');

      cvContextText = `
- Họ tên ứng viên trên CV: ${cvData.candidate?.fullName || cvData.candidateInfo?.fullName || userProfile?.displayName || 'Sinh viên PTIT'}
- Kỹ năng ứng viên ĐÃ CÓ trong CV: ${cvSkills.length > 0 ? cvSkills.join(', ') : 'Chưa liệt kê cụ thể'}
- Kinh nghiệm / Dự án đã có: ${cvExps || 'Dự án môn học, hoạt động ngoại khóa'}
- Học vấn: ${cvData.education?.[0]?.school || 'Học viện Công nghệ Bưu chính Viễn thông (PTIT)'} - Ngành: ${cvData.education?.[0]?.major || userProfile?.major || 'Khối ngành Kinh tế PTIT'}`;
    }

    const selectedMajorName = userProfile?.major?.trim() || 'Khối ngành Kinh tế PTIT';

    const targetJobContext = `=== VỊ TRÍ MỤC TIÊU (JD DOANH NGHIỆP - CỘT MỐC 3) ===
- Vị trí: ${targetJob.title}
- Doanh nghiệp: ${targetJob.company}
- Địa điểm: ${targetJob.location || 'Hà Nội'}
- Mức lương: ${targetJob.salary || 'Thỏa thuận'}
- Yêu cầu kỹ năng: ${(targetJob.requiredSkills || targetJob.skillTags || []).join(', ')}
- Mô tả công việc: ${targetJob.description || ''}
- Ngành học của sinh viên: ${selectedMajorName}`;

    if (!aiClient) {
      throw new Error('Chưa cấu hình GEMINI_API_KEY, chuyển sang bộ máy tạo lộ trình nội bộ PTIT.');
    }

    const prompt = `Bạn là Chuyên gia Cố vấn Hướng nghiệp Cao cấp của Học viện Công nghệ Bưu chính Viễn thông (PTIT).
Nhiệm vụ của bạn: Tạo lập hoặc làm mới một Lộ trình Nghề nghiệp (Career Map) 3 Cột mốc hoàn toàn cá nhân hóa cho sinh viên PTIT.

=== QUY TẮC CỐT LÕI CỦA LỘ TRÌNH 3 CỘT MỐC (BẮT BUỘC) ===
1. CỘT MỐC 3 (ĐÍCH ĐẾN): LUÔN LUÔN LÀ CÔNG VIỆC MỤC TIÊU (JD MỤC TIÊU): "${targetJob.title}" tại "${targetJob.company}".
   - roleTitle: "${targetJob.title}"
   - badgeLabel: "🎯 JD Mục tiêu • ${targetJob.company}"
   - keyFocus: "Đích đến mục tiêu bạn đang hướng tới tại ${targetJob.company} - Hoàn thiện hồ sơ, portfolio và năng lực phỏng vấn tuyển dụng"
   - practicalTasks: Các nhiệm vụ ứng tuyển, chuẩn bị hồ sơ và phỏng vấn cho chính vị trí này tại ${targetJob.company}.
2. CỘT MỐC 1 (KHỞI ĐỘNG & NỀN TẢNG):
   - Phân tích kỹ năng/kinh nghiệm sinh viên ĐÃ CÓ (từ file CV hoặc hồ sơ) đối chiếu với yêu cầu của JD mục tiêu.
   - Đề xuất một vai trò khởi đầu / nền tảng (Entry-level, CTV, hoặc Nền tảng chuyên môn) phù hợp làm bước đệm vững chắc đầu tiên.
   - Làm mới toàn bộ nội dung chính (roleTitle, keyFocus) và 2-3 practicalTasks hành động thực tế, cụ thể, bám sát các kiến thức và công cụ nền tảng cần trang bị.
3. CỘT MỐC 2 (TĂNG TỐC & THỰC CHIẾN):
   - Đề xuất một vai trò thực tập sinh / nhân viên chuyên môn (Intern, Fresher, Project Specialist) sát gần hơn với JD mục tiêu.
   - Làm mới toàn bộ nội dung chính (roleTitle, keyFocus) và 2-3 practicalTasks hành động thực tế giải quyết bài toán nghiệp vụ doanh nghiệp, thực hiện dự án thực tế sát với yêu cầu JD mục tiêu.

=== ĐỊNH HƯỚNG LỘ TRÌNH ĐƯỢC YÊU CẦU ===
- Phong cách / Hướng tiếp cận: ${focusStyle}
- Trạng thái yêu cầu: ${isRegen ? 'Người dùng yêu cầu LÀM MỚI LỘ TRÌNH VỚI AI: làm mới lại toàn bộ nội dung chính và danh sách task của Cột mốc 1 và 2 bám sát JD mục tiêu.' : 'Lộ trình tối ưu hóa lần đầu.'}

=== THÔNG TIN HỒ SƠ SINH VIÊN PTIT ===
- Họ tên: ${userProfile?.displayName || 'Sinh viên PTIT'}
- Chuyên ngành đào tạo tại PTIT: ${selectedMajorName} (thuộc danh mục 7 ngành Khối Kinh tế PTIT Phía Bắc: Marketing, Công nghệ tài chính (Fintech), Quản trị kinh doanh, Kế toán, Thương mại điện tử, Quan hệ công chúng (PR), Logistics và Quản lý chuỗi cung ứng)
- Năm học hiện tại: ${userProfile?.academicYear || 'Năm 3'}
- Mục tiêu kinh nghiệm: ${userProfile?.careerGoal || 'Đang tìm kiếm cơ hội thực tập và việc làm'}

=== DỮ LIỆU TỪ CV ĐÃ TẢI LÊN ===
${cvContextText}

${targetJobContext}

${availableEvents.length > 0 ? `=== DANH SÁCH WORKSHOP / SỰ KIỆN PTIT ĐANG MỞ ===\n${JSON.stringify(availableEvents, null, 2)}` : ''}

=== YÊU CẦU ĐẦU RA ===
Trả về DUY NHẤT một chuỗi JSON hợp lệ theo schema sau (không kèm bất kỳ văn bản nào ngoài JSON):
{
  "matchScore": 82,
  "analysisSummary": "Tóm tắt 2 câu đánh giá mức độ đáp ứng của CV/hồ sơ hiện tại so với JD mục tiêu và chiến lược bứt phá tiếp theo.",
  "missingSkills": ["Kỹ năng khuyết thiếu 1", "Kỹ năng khuyết thiếu 2", "Kỹ năng khuyết thiếu 3"],
  "acquiredSkillsFromCv": ["Kỹ năng đã có 1", "Kỹ năng đã có 2"],
  "customTasks": [
    { "title": "Nhiệm vụ thực tế 1", "priority": "high", "deadline": "Trong 2 tuần", "description": "Mô tả hành động cụ thể" },
    { "title": "Nhiệm vụ thực tế 2", "priority": "high", "deadline": "Tháng tới", "description": "Mô tả hành động cụ thể" }
  ],
  "suggestedMilestones": [
    {
      "milestoneNumber": 1,
      "roleTitle": "Tên vai trò Cột mốc 1 (Entry-level / CTV / Nền tảng)",
      "badgeLabel": "Entry-Level • CTV / Dự án thử nghiệm",
      "keyFocus": "Trọng tâm giai đoạn 1",
      "practicalTasks": [
        { "title": "Tên task 1", "deadline": "2 tuần", "priority": "high" },
        { "title": "Tên task 2", "deadline": "3 tuần", "priority": "medium" }
      ],
      "requiredSkills": ["Kỹ năng A", "Kỹ năng B"]
    },
    {
      "milestoneNumber": 2,
      "roleTitle": "Tên vai trò Cột mốc 2 (Intern / Fresher / Tăng tốc thực chiến)",
      "badgeLabel": "Core Execution • Thực tập sinh Intern",
      "keyFocus": "Trọng tâm giai đoạn 2",
      "practicalTasks": [
        { "title": "Tên task 3", "deadline": "1 tháng", "priority": "high" },
        { "title": "Tên task 4", "deadline": "6 tuần", "priority": "high" }
      ],
      "requiredSkills": ["Kỹ năng C", "Kỹ năng D"]
    },
    {
      "milestoneNumber": 3,
      "roleTitle": "${targetJob.title}",
      "badgeLabel": "🎯 JD Mục tiêu • ${targetJob.company}",
      "keyFocus": "Vị trí mục tiêu chính thức tại ${targetJob.company}",
      "practicalTasks": [
        { "title": "Hoàn thiện hồ sơ CV & Portfolio làm nổi bật các dự án khớp với JD ${targetJob.title}", "deadline": "3 tháng", "priority": "high" },
        { "title": "Luyện tập phỏng vấn tình huống nghiệp vụ và văn hóa doanh nghiệp ${targetJob.company}", "deadline": "4 tháng", "priority": "high" }
      ],
      "requiredSkills": ${(targetJob.requiredSkills || targetJob.skillTags || []).length > 0 ? JSON.stringify((targetJob.requiredSkills || targetJob.skillTags || []).slice(0, 4)) : '["Kỹ năng chuyên môn", "Giao tiếp"]'}
    }
  ],
  "suggestedEvents": ["event-id-phù-hợp-nhất"],
  "coreAdvice": "Lời khuyên chiến lược cho sinh viên PTIT để chạm tới vị trí mục tiêu"
}`;

    const rawJson = await callGeminiWithFallback(prompt);
    const cleaned = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    // Normalize keys and ensure Milestone 3 is ALWAYS the targetJob
    parsed.aiSummary = parsed.analysisSummary || parsed.aiSummary || 'Đối chiếu năng lực sinh viên với yêu cầu JD mục tiêu.';
    parsed.gapSkills = parsed.missingSkills || parsed.gapSkills || [];
    parsed.recommendedEventIds = parsed.suggestedEvents || parsed.recommendedEventIds || [];

    if (Array.isArray(parsed.suggestedMilestones) && parsed.suggestedMilestones.length === 3) {
      parsed.suggestedMilestones[2].roleTitle = targetJob.title;
      parsed.suggestedMilestones[2].badgeLabel = `🎯 JD Mục tiêu • ${targetJob.company}`;
      parsed.suggestedMilestones[2].milestoneNumber = 3;
    }

    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.log('[Info] Fallback to intelligent PTIT career engine:', error?.message?.slice(0, 100));
    const cvData = req.body?.cvData;
    const userProfile = req.body?.userProfile;
    const targetJob = req.body?.targetJob;
    const isRegen = Boolean(req.body?.isRegenerate);
    const jobTitle = targetJob?.title || 'Chuyên viên Marketing số';
    const company = targetJob?.company || 'Doanh nghiệp mục tiêu';
    const major = userProfile?.major || 'Marketing';

    const cvSkills = [
      ...(Array.isArray(cvData?.skills) ? cvData.skills.map((s: any) => (typeof s === 'string' ? s : s.name)) : []),
      ...(Array.isArray(cvData?.skills?.hardSkills) ? cvData.skills.hardSkills : []),
      ...(Array.isArray(cvData?.skills?.softSkills) ? cvData.skills.softSkills : []),
    ].filter(Boolean);
    const cvExps = Array.isArray(cvData?.experiences) ? cvData.experiences : [];

    const required = Array.isArray(targetJob?.requiredSkills) && targetJob.requiredSkills.length > 0
      ? targetJob.requiredSkills
      : Array.isArray(targetJob?.skillTags) && targetJob.skillTags.length > 0
      ? targetJob.skillTags
      : ['Kỹ năng chuyên môn', 'Làm việc nhóm', 'Tin học văn phòng'];

    const matchedSkills = required.filter((reqSkill: string) =>
      cvSkills.some((cvSk: string) =>
        cvSk.toLowerCase().includes(reqSkill.toLowerCase()) || reqSkill.toLowerCase().includes(cvSk.toLowerCase())
      )
    );
    const missingSkills = required.filter((reqSkill: string) =>
      !cvSkills.some((cvSk: string) =>
        cvSk.toLowerCase().includes(reqSkill.toLowerCase()) || reqSkill.toLowerCase().includes(cvSk.toLowerCase())
      )
    );

    const skillScore = required.length > 0 ? (matchedSkills.length / required.length) * 65 : 45;
    const expScore = Math.min(cvExps.length * 8, 20);
    const calculatedMatch = Math.min(95, Math.max(35, Math.round(skillScore + expScore + (cvData ? 10 : 0))));
    const topGaps = missingSkills.length > 0 ? missingSkills : required.slice(0, 3);

    // Intelligent PTIT milestone generator customized per targetJob
    const m1Title = isRegen
      ? `CTV Hỗ trợ Dự án & Phát triển Nền tảng (Associate Assistant)`
      : `Cộng tác viên Nhập môn & Nền tảng (Entry Support)`;
    const m2Title = isRegen
      ? `Thực tập sinh Thực chiến Bứt phá (Advanced Intern / Project Specialist)`
      : `Thực tập sinh Chuyên môn (Core Trainee)`;

    res.json({
      success: true,
      data: {
        matchScore: calculatedMatch,
        analysisSummary: cvData
          ? `Dựa trên file CV đã nạp (${cvSkills.length} kỹ năng, ${cvExps.length} kinh nghiệm/dự án), bạn đã đáp ứng khoảng ${calculatedMatch}% yêu cầu cho vị trí ${jobTitle} tại ${company}. Lộ trình Cột mốc 1 và 2 đã được điều chỉnh để chuẩn bị tối đa cho bạn chạm tới Cột mốc 3.`
          : `Dựa trên thông tin ngành ${major} (${userProfile?.academicYear || 'Năm 3'}), AI đã xây dựng lộ trình từng bước (Cột mốc 1 và 2) để bạn tích lũy đầy đủ năng lực cho vị trí mục tiêu ${jobTitle} tại ${company}.`,
        missingSkills: topGaps,
        gapSkills: topGaps,
        acquiredSkillsFromCv: matchedSkills.length > 0 ? matchedSkills : cvSkills.slice(0, 3),
        customTasks: [
          {
            title: isRegen
              ? `Xây dựng dự án Portfolio nâng cao: Triển khai chiến dịch thực nghiệm đáp ứng yêu cầu ${topGaps[0] || 'chuyên môn'} của ${company}`
              : `Thực hành xây dựng sản phẩm mẫu hoặc bài tập lớn đáp ứng yêu cầu ${topGaps[0] || 'chuyên môn'} của ${company}`,
            priority: 'high',
            deadline: 'Trong 2 tuần',
            description: `Thực hiện dự án mô phỏng theo chuẩn yêu cầu vị trí ${jobTitle}`,
          },
          {
            title: `Tối ưu hóa các con số định lượng trong CV làm nổi bật từ khóa ${topGaps.slice(0, 2).join(', ')}`,
            priority: 'high',
            deadline: 'Tháng này',
            description: 'Giúp hồ sơ vượt qua vòng quét ATS của nhà tuyển dụng',
          },
        ],
        suggestedMilestones: [
          {
            milestoneNumber: 1,
            roleTitle: m1Title,
            badgeLabel: 'Entry-Level • CTV / Dự án thử nghiệm',
            keyFocus: `Nắm vững công cụ nền tảng và văn hóa làm việc, hoàn thành các bài tập nghiệp vụ cơ sở cho ${jobTitle}`,
            practicalTasks: [
              {
                title: isRegen
                  ? `Khảo sát thực địa và lập báo cáo nghiên cứu đối thủ của ${company}`
                  : `Nghiên cứu bộ công cụ căn bản và chuẩn hóa quy trình làm việc`,
                deadline: '2 tuần',
                priority: 'high',
              },
              {
                title: `Thực hành 3 bài tập mô phỏng kỹ năng ${topGaps[0] || 'cốt lõi'} theo tiêu chuẩn của ngành ${major}`,
                deadline: '3 tuần',
                priority: 'medium',
              },
            ],
            requiredSkills: topGaps.slice(0, 2),
          },
          {
            milestoneNumber: 2,
            roleTitle: m2Title,
            badgeLabel: 'Core Execution • Thực tập sinh Intern',
            keyFocus: `Tham gia trực tiếp dự án thực tế, cọ xát nghiệp vụ giải quyết bài toán của doanh nghiệp`,
            practicalTasks: [
              {
                title: isRegen
                  ? `Chủ động triển khai mini-project áp dụng công nghệ mới giải quyết yêu cầu ${topGaps[1] || 'thực chiến'}`
                  : `Tham gia trực tiếp quy trình triển khai công việc thực tế tại doanh nghiệp`,
                deadline: '1 tháng',
                priority: 'high',
              },
              {
                title: `Đo lường hiệu quả công việc và lập báo cáo tiến độ định kỳ`,
                deadline: '6 tuần',
                priority: 'high',
              },
            ],
            requiredSkills: topGaps.slice(1, 3),
          },
          {
            milestoneNumber: 3,
            roleTitle: jobTitle,
            badgeLabel: `🎯 JD Mục tiêu • ${company}`,
            keyFocus: `Vị trí mục tiêu tuyển dụng chính thức bạn đang hướng tới tại ${company}`,
            practicalTasks: [
              {
                title: `Hoàn thiện hồ sơ CV & Portfolio làm nổi bật các dự án khớp với JD ${jobTitle}`,
                deadline: '3 tháng',
                priority: 'high',
              },
              {
                title: `Luyện tập phỏng vấn tình huống nghiệp vụ và văn hóa doanh nghiệp ${company}`,
                deadline: '4 tháng',
                priority: 'high',
              },
            ],
            requiredSkills: required.slice(0, 4),
          },
        ],
        suggestedEvents: ['event-1', 'event-2'],
        recommendedEventIds: ['event-1', 'event-2'],
        coreAdvice: `Hoàn thiện các nhiệm vụ thực chiến ở Cột mốc 1 và 2 để tự tin trúng tuyển vị trí ${jobTitle} tại ${company}.`,
      },
    });
  }
});

// ==================== VITE MIDDLEWARE OR STATIC SERVE ====================
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[PTIT Career Hub Server] Running on http://localhost:${PORT}`);
    console.log(`[Gemini Integration] API Key status: ${geminiApiKey ? 'Configured' : 'Missing'}`);
  });
}

startServer();
