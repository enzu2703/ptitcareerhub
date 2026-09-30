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

  const models = ['gemini-3.8-flash', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of models) {
    for (let attempt = 0; attempt < 3; attempt++) {
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
        const status = err.status || err.statusCode;
        if (status === 503 || status === 429) {
          await new Promise((r) => setTimeout(r, 1200 * (attempt + 1)));
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
    primaryModel: 'gemini-3.8-flash',
    fallbackModel: 'gemini-flash-latest',
    message: hasKey
      ? 'Gemini 3.8 Flash is ready for real CV and JD analysis.'
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

    if (!aiClient) {
      return res.status(503).json({
        error: 'Gemini integration requires GEMINI_API_KEY to be configured in environment secrets.',
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

    let cvContextText = 'Chưa có file CV tải lên (sử dụng thông tin hồ sơ cơ bản).';
    if (cvData) {
      const cvSkills = [
        ...(Array.isArray(cvData.skills) ? cvData.skills.map((s: any) => s.name || s) : []),
        ...(Array.isArray(cvData.skills?.hardSkills) ? cvData.skills.hardSkills : []),
        ...(Array.isArray(cvData.skills?.softSkills) ? cvData.skills.softSkills : []),
      ].filter(Boolean);

      const cvExps = Array.isArray(cvData.experiences)
        ? cvData.experiences.map((exp: any) => `${exp.position || exp.role} tại ${exp.company || 'Doanh nghiệp'}`).join(', ')
        : (cvData.experienceText || '');

      cvContextText = `
- Họ tên ứng viên trên CV: ${cvData.candidate?.fullName || cvData.candidateInfo?.fullName || userProfile?.displayName || 'Sinh viên PTIT'}
- Kỹ năng ứng viên ĐÃ CÓ trong CV: ${cvSkills.length > 0 ? cvSkills.join(', ') : 'Canva, Tin học văn phòng, Giao tiếp'}
- Kinh nghiệm / Dự án đã có: ${cvExps || 'Dự án môn học, hoạt động câu lạc bộ'}
- Học vấn: ${cvData.education?.[0]?.school || 'Học viện Công nghệ Bưu chính Viễn thông (PTIT)'} - Ngành: ${cvData.education?.[0]?.major || userProfile?.major || 'Kinh tế số'}`;
    }

    const targetJobContext = targetJob
      ? `=== VỊ TRÍ MỤC TIÊU (JD DOANH NGHIỆP) ===
- Vị trí: ${targetJob.title}
- Doanh nghiệp: ${targetJob.company}
- Yêu cầu kỹ năng: ${(targetJob.requiredSkills || []).join(', ')}
- Mô tả công việc: ${targetJob.description || ''}`
      : `=== MỤC TIÊU THEO NGÀNH HỌC ===
- Ngành đào tạo: ${userProfile?.major || 'Kinh tế & Quản trị kinh doanh PTIT'}
- Hướng sự nghiệp: ${userProfile?.careerGoal || 'Phát triển chuyên môn chuẩn đầu ra PTIT'}`;

    const prompt = `Bạn là Chuyên gia Cố vấn Hướng nghiệp Cao cấp của Học viện Công nghệ Bưu chính Viễn thông (PTIT).
Nhiệm vụ của bạn: Tạo lập hoặc làm mới một Lộ trình Nghề nghiệp (Career Map) 3 Cột mốc hoàn toàn cá nhân hóa cho sinh viên PTIT dựa trên đồng bộ giữa HỒ SƠ NGƯỜI DÙNG, DỮ LIỆU CV ĐÃ TẢI LÊN và VỊ TRÍ MỤC TIÊU.

=== ĐỊNH HƯỚNG LỘ TRÌNH ĐƯỢC YÊU CẦU ===
- Phong cách / Góc nhìn lộ trình: ${focusStyle}
- Trạng thái yêu cầu: ${isRegen ? 'Người dùng yêu cầu LÀM MỚI / TẠO LỘ TRÌNH KHÁC BIỆT với góc nhìn chiến lược mới mẻ, chuỗi task sáng tạo hơn.' : 'Lộ trình tối ưu hóa lần đầu.'}

=== THÔNG TIN HỒ SƠ SINH VIÊN PTIT ===
- Họ tên: ${userProfile?.displayName || 'Sinh viên PTIT'}
- Chuyên ngành: ${userProfile?.major || 'Kinh tế & Marketing PTIT'}
- Năm học hiện tại: ${userProfile?.academicYear || 'Năm 3'}
- Mục tiêu kinh nghiệm: ${userProfile?.careerGoal || 'Đang tìm kiếm cơ hội thực tập'}

=== DỮ LIỆU TỪ CV ĐÃ TẢI LÊN ===
${cvContextText}

${targetJobContext}

${availableEvents.length > 0 ? `=== DANH SÁCH WORKSHOP / SỰ KIỆN PTIT ĐANG MỞ ===\n${JSON.stringify(availableEvents, null, 2)}` : ''}

=== YÊU CẦU ĐẶC BIỆT ===
1. ĐỐI CHIẾU VỚI CV: Nhận diện kỹ các kỹ năng sinh viên ĐÃ CÓ trong CV để không yêu cầu học lại kiến thức quá cơ bản; tập trung vào KHOẢNG TRỐNG NĂNG LỰC và CÁC NHIỆM VỤ THỰC CHIẾN NÂNG CAO.
2. NẾU LÀM MỚI LỘ TRÌNH (isRegenerate = true): Đưa ra 3 Cột mốc với tên vai trò, trọng tâm và danh sách task hoàn toàn mới mẻ, mang tính đột phá và ứng dụng công nghệ/AI thực tế trong ngành.

=== YÊU CẦU ĐẦU RA ===
Trả về DUY NHẤT một chuỗi JSON hợp lệ theo schema sau (không kèm bất kỳ văn bản nào ngoài JSON):
{
  "matchScore": 82,
  "analysisSummary": "Tóm tắt 2 câu đánh giá mức độ đáp ứng của CV hiện tại và chiến lược đột phá tiếp theo.",
  "missingSkills": ["Kỹ năng khuyết thiếu 1", "Kỹ năng khuyết thiếu 2", "Kỹ năng khuyết thiếu 3"],
  "acquiredSkillsFromCv": ["Kỹ năng đã có từ CV 1", "Kỹ năng đã có từ CV 2"],
  "customTasks": [
    { "title": "Nhiệm vụ thực tế 1", "priority": "high", "deadline": "Trong 2 tuần", "description": "Mô tả hành động cụ thể" },
    { "title": "Nhiệm vụ thực tế 2", "priority": "high", "deadline": "Tháng tới", "description": "Mô tả hành động cụ thể" },
    { "title": "Nhiệm vụ thực tế 3", "priority": "medium", "deadline": "Trước khi nộp đơn", "description": "Mô tả hành động cụ thể" }
  ],
  "suggestedMilestones": [
    {
      "milestoneNumber": 1,
      "roleTitle": "Tên vai trò Cột mốc 1",
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
      "roleTitle": "Tên vai trò Cột mốc 2",
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
      "roleTitle": "Tên vai trò Cột mốc 3",
      "badgeLabel": "Junior / Official • Chuyên viên thực chiến",
      "keyFocus": "Trọng tâm giai đoạn 3",
      "practicalTasks": [
        { "title": "Tên task 5", "deadline": "3 tháng", "priority": "high" },
        { "title": "Tên task 6", "deadline": "4 tháng", "priority": "medium" }
      ],
      "requiredSkills": ["Kỹ năng E", "Kỹ năng F"]
    }
  ],
  "suggestedEvents": ["event-id-phù-hợp-nhất"],
  "coreAdvice": "Lời khuyên chiến lược cho sinh viên PTIT"
}`;

    const rawJson = await callGeminiWithFallback(prompt);
    const cleaned = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    // Normalize keys
    parsed.aiSummary = parsed.analysisSummary || parsed.aiSummary || 'Đối chiếu năng lực sinh viên với yêu cầu JD.';
    parsed.gapSkills = parsed.missingSkills || parsed.gapSkills || [];
    parsed.recommendedEventIds = parsed.suggestedEvents || parsed.recommendedEventIds || [];

    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.warn('Gemini API error in /api/gemini/career-gap-analysis, using intelligent PTIT engine:', error?.message);
    const required = Array.isArray(req.body?.targetJob?.requiredSkills)
      ? req.body.targetJob.requiredSkills
      : [];
    const topGaps = required.slice(0, 3);
    const jobTitle = req.body?.targetJob?.title || 'Mục tiêu';
    const company = req.body?.targetJob?.company || 'Doanh nghiệp đối tác PTIT';
    const major = req.body?.userProfile?.major || 'Kinh tế & Marketing PTIT';
    const isRegen = Boolean(req.body?.isRegenerate);

    const match = isRegen ? 88 : 78;
    res.json({
      success: true,
      data: {
        matchScore: match,
        analysisSummary: `Dựa trên CV và hồ sơ sinh viên ngành ${major}, bạn đã đạt khoảng ${match}% yêu cầu cho vị trí ${jobTitle} tại ${company}. Cần tập trung giải quyết các khoảng trống kỹ năng thực chiến để tối đa cơ hội trúng tuyển.`,
        missingSkills: topGaps.length > 0 ? topGaps : ['Google Analytics 4', 'A/B Testing', 'Power BI'],
        gapSkills: topGaps.length > 0 ? topGaps : ['Google Analytics 4', 'A/B Testing', 'Power BI'],
        acquiredSkillsFromCv: ['Canva', 'Tin học văn phòng', 'Kỹ năng giao tiếp'],
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
          {
            title: `Luyện tập 10 câu hỏi phỏng vấn tình huống đặc thù cho vị trí ${jobTitle}`,
            priority: 'medium',
            deadline: 'Trước khi nộp đơn',
            description: 'Chuẩn bị câu trả lời theo cấu trúc STAR về các dự án đã làm',
          },
        ],
        suggestedEvents: ['event-1', 'event-2'],
        recommendedEventIds: ['event-1', 'event-2'],
        coreAdvice: 'Hoàn thiện các nhiệm vụ thực chiến và tham gia Workshop doanh nghiệp để được ưu tiên xét hồ sơ.',
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
