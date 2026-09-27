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
