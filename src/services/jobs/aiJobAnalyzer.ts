import { CareerTendencyCode } from '../../types';

export interface AIAnalysisResult {
  majorTags: string[];
  skillTags: string[];
  careerTendencies: CareerTendencyCode[];
  suitableAcademicYears: string[];
  careerCategory: string;
  suggestedSummary?: string;
  source: 'gemini' | 'rule_based';
}

const PTIT_MAJORS = [
  'Marketing & Truyền thông số',
  'Quản trị kinh doanh',
  'Thương mại điện tử',
  'Kinh tế số',
  'Công nghệ tài chính (Fintech)',
  'Kế toán',
  'Truyền thông đa phương tiện',
];

/**
 * Intelligent deterministic tokenizer & curriculum matcher
 * Used as primary or resilient fallback when Gemini API key is not present.
 */
function analyzeJdDeterministic(jdText: string): AIAnalysisResult {
  const text = jdText.toLowerCase();

  // 1. Career Category Classification
  let category = 'Marketing';
  if (text.includes('data') || text.includes('dữ liệu') || text.includes('sql') || text.includes('bi ') || text.includes('power bi') || text.includes('python')) {
    category = 'Data';
  } else if (text.includes('thương mại điện tử') || text.includes('e-commerce') || text.includes('shopee') || text.includes('tiktok shop') || text.includes('vận hành sàn')) {
    category = 'E-commerce';
  } else if (text.includes('kinh doanh') || text.includes('sales') || text.includes('b2b') || text.includes('phát triển thị trường') || text.includes('khách hàng doanh nghiệp') || text.includes('fintech')) {
    category = 'Business';
  } else if (text.includes('lập trình') || text.includes('frontend') || text.includes('backend') || text.includes('software') || text.includes('cntt') || text.includes('developer')) {
    category = 'IT / Tech';
  } else {
    category = 'Marketing';
  }

  // 2. Major Tags Matching
  const matchedMajors: string[] = [];
  if (text.includes('marketing') || text.includes('truyền thông') || text.includes('content') || text.includes('quảng cáo')) {
    matchedMajors.push('Marketing & Truyền thông số', 'Truyền thông đa phương tiện');
  }
  if (text.includes('thương mại') || text.includes('e-commerce') || text.includes('sàn')) {
    matchedMajors.push('Thương mại điện tử', 'Kinh tế số');
  }
  if (text.includes('dữ liệu') || text.includes('data') || text.includes('phân tích') || text.includes('thống kê')) {
    matchedMajors.push('Khoa học Dữ liệu & Trí tuệ nhân tạo', 'Kinh tế số');
  }
  if (text.includes('kinh doanh') || text.includes('quản trị') || text.includes('doanh nghiệp') || text.includes('sales')) {
    matchedMajors.push('Quản trị kinh doanh');
  }
  if (text.includes('cntt') || text.includes('công nghệ') || text.includes('code') || text.includes('lập trình') || text.includes('phần mềm')) {
    matchedMajors.push('Công nghệ thông tin');
  }
  if (matchedMajors.length === 0) {
    matchedMajors.push('Marketing & Truyền thông số', 'Kinh tế số', 'Quản trị kinh doanh');
  }
  // Deduplicate
  const uniqueMajors = Array.from(new Set(matchedMajors)).slice(0, 4);

  // 3. Skill Tags Extraction
  const candidateSkills = [
    { key: 'sql', label: 'SQL' },
    { key: 'python', label: 'Python' },
    { key: 'excel', label: 'Excel' },
    { key: 'power bi', label: 'Power BI' },
    { key: 'canva', label: 'Canva' },
    { key: 'photoshop', label: 'Photoshop' },
    { key: 'social media', label: 'Social Media' },
    { key: 'content', label: 'Content Strategy' },
    { key: 'copywriting', label: 'Copywriting' },
    { key: 'google analytics', label: 'Google Analytics' },
    { key: 'seo', label: 'SEO' },
    { key: 'a/b test', label: 'A/B Testing' },
    { key: 'ads', label: 'Performance Ads' },
    { key: 'b2b', label: 'B2B Sales' },
    { key: 'giao tiếp', label: 'Communication' },
    { key: 'thuyết trình', label: 'Presentation' },
    { key: 'tiếng anh', label: 'English' },
    { key: 'data analysis', label: 'Data Analysis' },
    { key: 'campaign', label: 'Campaign Management' },
    { key: 'tiktok', label: 'TikTok Marketing' },
    { key: 'crm', label: 'CRM' },
  ];

  const matchedSkills: string[] = [];
  for (const s of candidateSkills) {
    if (text.includes(s.key)) {
      matchedSkills.push(s.label);
    }
  }
  if (matchedSkills.length === 0) {
    matchedSkills.push('Communication', 'Teamwork', 'MS Office');
  }
  const uniqueSkills = Array.from(new Set(matchedSkills)).slice(0, 6);

  // 4. Career Tendencies (CR, AN, OP, CO)
  const tendencies: CareerTendencyCode[] = [];
  // CR: Creative & Innovation
  if (text.includes('sáng tạo') || text.includes('creative') || text.includes('ý tưởng') || text.includes('content') || text.includes('thiết kế') || text.includes('video') || text.includes('chiến dịch') || text.includes('mới')) {
    tendencies.push('CR');
  }
  // AN: Analytical & Optimization
  if (text.includes('phân tích') || text.includes('data') || text.includes('số liệu') || text.includes('excel') || text.includes('tối ưu') || text.includes('metrics') || text.includes('kpi') || text.includes('báo cáo') || text.includes('sql')) {
    tendencies.push('AN');
  }
  // OP: Planning & Operations
  if (text.includes('vận hành') || text.includes('kế hoạch') || text.includes('quy trình') || text.includes('tiến độ') || text.includes('hỗ trợ') || text.includes('phối hợp') || text.includes('operations') || text.includes('quản lý')) {
    tendencies.push('OP');
  }
  // CO: Communication & Business
  if (text.includes('giao tiếp') || text.includes('khách hàng') || text.includes('tư vấn') || text.includes('bán hàng') || text.includes('đàm phán') || text.includes('thuyết phục') || text.includes('sales') || text.includes('đối tác') || text.includes('bd')) {
    tendencies.push('CO');
  }

  if (tendencies.length === 0) {
    tendencies.push('CR', 'AN');
  }

  // 5. Suitable Academic Years
  const years: string[] = [];
  if (text.includes('năm 1') || text.includes('năm nhất')) years.push('Năm 1');
  if (text.includes('năm 2') || text.includes('năm hai')) years.push('Năm 2');
  if (text.includes('năm 3') || text.includes('năm ba')) years.push('Năm 3');
  if (text.includes('năm 4') || text.includes('năm cuối') || text.includes('tốt nghiệp')) {
    years.push('Năm 4', 'Đã tốt nghiệp');
  }
  if (years.length === 0) {
    // Default standard for PTIT internships
    years.push('Năm 2', 'Năm 3', 'Năm 4');
  }

  return {
    majorTags: uniqueMajors,
    skillTags: uniqueSkills,
    careerTendencies: tendencies,
    suitableAcademicYears: Array.from(new Set(years)),
    careerCategory: category,
    suggestedSummary: 'Đã phân tích nội dung JD và trích xuất ngành học, kỹ năng và xu hướng phù hợp cho sinh viên PTIT.',
    source: 'rule_based',
  };
}

/**
 * Main AI JD Analyzer
 * Analyzes the admin-provided JD description & requirements.
 * STRICT SECURITY & INTEGRITY:
 * AI NEVER creates companyName, title, salaryText, sourceUrl, or applyUrl.
 */
export async function analyzeJdWithAI(jdContent: string): Promise<AIAnalysisResult> {
  if (!jdContent || !jdContent.trim()) {
    throw new Error('Vui lòng nhập nội dung mô tả hoặc yêu cầu công việc (JD) để AI phân tích.');
  }

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (apiKey) {
    try {
      // Dynamic import to keep startup lightweight
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `Bạn là trợ lý AI chuyên phân tích tuyển dụng và định hướng nghề nghiệp cho sinh viên Học viện Công nghệ Bưu chính Viễn thông (PTIT).
Dưới đây là nội dung văn bản JD tuyển dụng do Admin cung cấp:
---
${jdContent.slice(0, 3000)}
---

Nhiệm vụ:
Phân tích nội dung JD trên và trả về JSON thuần (không bọc markdown \`\`\`) với đúng các trường sau:
1. "majorTags": Mảng các ngành đào tạo PTIT phù hợp nhất (chọn từ: ${PTIT_MAJORS.join(', ')})
2. "skillTags": Mảng 3-6 kỹ năng quan trọng nhất được yêu cầu trong JD
3. "careerTendencies": Mảng 1-3 mã xu hướng Career Check phù hợp:
   - "CR": Sáng tạo, content, ý tưởng, thiết kế, marketing đột phá
   - "AN": Phân tích, tư duy số liệu, tối ưu hóa, data, metrics
   - "OP": Vận hành, kế hoạch, kỷ luật tiến độ, quy trình, tổ chức
   - "CO": Giao tiếp, kinh doanh, đàm phán, thuyết phục, quan hệ đối tác
4. "suitableAcademicYears": Mảng các năm học phù hợp (VD: ["Năm 2", "Năm 3", "Năm 4", "Đã tốt nghiệp"])
5. "careerCategory": Chọn 1 trong các nhóm: "Marketing", "E-commerce", "Data", "Business", "IT / Tech"
6. "suggestedSummary": Một câu nhận xét ngắn gọn về vị trí này cho sinh viên PTIT.

LƯU Ý CỰC KỲ QUAN TRỌNG:
- TUYỆT ĐỐI KHÔNG tự tạo title, companyName, salary, sourceUrl hay applyUrl.
- Chỉ trả về đúng định dạng JSON.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const rawText = response.text || '';
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      return {
        majorTags: Array.isArray(parsed.majorTags) && parsed.majorTags.length > 0
          ? parsed.majorTags
          : ['Marketing & Truyền thông số', 'Kinh tế số'],
        skillTags: Array.isArray(parsed.skillTags) && parsed.skillTags.length > 0
          ? parsed.skillTags
          : ['Communication', 'Teamwork'],
        careerTendencies: Array.isArray(parsed.careerTendencies) && parsed.careerTendencies.length > 0
          ? parsed.careerTendencies
          : ['CR', 'AN'],
        suitableAcademicYears: Array.isArray(parsed.suitableAcademicYears) && parsed.suitableAcademicYears.length > 0
          ? parsed.suitableAcademicYears
          : ['Năm 3', 'Năm 4'],
        careerCategory: parsed.careerCategory || 'Marketing',
        suggestedSummary: parsed.suggestedSummary || 'Đã phân tích JD bằng Gemini AI.',
        source: 'gemini',
      };
    } catch (geminiError) {
      console.warn('Gemini AI analysis failed or returned unexpected format, using intelligent PTIT engine:', geminiError);
    }
  }

  // Resilient fallback with PTIT curriculum analyzer
  return analyzeJdDeterministic(jdContent);
}
