import {
  CareerTendencyCode,
  CareerInterestScores,
  TopCareerTendency,
  CareerCheckResult,
  SkillGapData,
  UserProfileState,
} from '../types';

/**
 * 10 Exact Questions for PTIT Career Hub Career Check
 * Categorized strictly:
 * A -> CR (Creative & Innovation)
 * B -> AN (Analytical & Optimization)
 * C -> OP (Planning & Operations)
 * D -> CO (Communication & Business)
 */
export interface CareerCheckQuestionData {
  id: number;
  question: string;
  options: {
    key: 'A' | 'B' | 'C' | 'D';
    code: CareerTendencyCode;
    text: string;
  }[];
}

export const CAREER_CHECK_QUESTIONS: CareerCheckQuestionData[] = [
  {
    id: 1,
    question: 'Nếu được giao một dự án mới, phần việc nào bạn muốn nhận nhất?',
    options: [
      { key: 'A', code: 'CR', text: 'Nghĩ ý tưởng và hướng tiếp cận mới' },
      { key: 'B', code: 'AN', text: 'Tìm hiểu thông tin, dữ liệu và vấn đề' },
      { key: 'C', code: 'OP', text: 'Lập kế hoạch và phân chia công việc' },
      { key: 'D', code: 'CO', text: 'Làm việc với khách hàng, đối tác hoặc thành viên nhóm' },
    ],
  },
  {
    id: 2,
    question: 'Hoạt động nào khiến bạn dễ duy trì sự tập trung trong thời gian dài nhất?',
    options: [
      { key: 'A', code: 'CR', text: 'Sáng tạo nội dung, ý tưởng hoặc sản phẩm' },
      { key: 'B', code: 'AN', text: 'Phân tích số liệu, báo cáo hoặc thông tin' },
      { key: 'C', code: 'OP', text: 'Theo dõi tiến độ và xử lý các đầu việc' },
      { key: 'D', code: 'CO', text: 'Trao đổi, thuyết phục hoặc xây dựng quan hệ' },
    ],
  },
  {
    id: 3,
    question: 'Khi gặp một vấn đề chưa có cách giải quyết rõ ràng, bạn thường làm gì trước?',
    options: [
      { key: 'A', code: 'CR', text: 'Thử nghĩ ra một cách tiếp cận khác' },
      { key: 'B', code: 'AN', text: 'Tìm dữ liệu và phân tích nguyên nhân' },
      { key: 'C', code: 'OP', text: 'Xác định các bước cần làm và sắp xếp thứ tự' },
      { key: 'D', code: 'CO', text: 'Hỏi ý kiến những người liên quan để hiểu vấn đề' },
    ],
  },
  {
    id: 4,
    question: 'Nếu phải chọn một loại kết quả để tạo ra, bạn thấy mình hứng thú nhất với kết quả nào?',
    options: [
      { key: 'A', code: 'CR', text: 'Một ý tưởng/sản phẩm mới và khác biệt' },
      { key: 'B', code: 'AN', text: 'Một kết luận dựa trên dữ liệu và bằng chứng' },
      { key: 'C', code: 'OP', text: 'Một kế hoạch được triển khai đúng mục tiêu' },
      { key: 'D', code: 'CO', text: 'Một thỏa thuận hoặc mối quan hệ mang lại kết quả' },
    ],
  },
  {
    id: 5,
    question: 'Trong một nhóm làm việc, bạn thường tự nhiên đảm nhận vai trò nào?',
    options: [
      { key: 'A', code: 'CR', text: 'Người đưa ra ý tưởng và hướng mới' },
      { key: 'B', code: 'AN', text: 'Người kiểm tra thông tin và đánh giá phương án' },
      { key: 'C', code: 'OP', text: 'Người phân công, theo dõi và thúc đẩy tiến độ' },
      { key: 'D', code: 'CO', text: 'Người kết nối, trình bày và làm việc với các bên' },
    ],
  },
  {
    id: 6,
    question: 'Điều gì khiến bạn cảm thấy công việc của mình ‘làm tốt’?',
    options: [
      { key: 'A', code: 'CR', text: 'Tạo ra điều mới mẻ và có giá trị' },
      { key: 'B', code: 'AN', text: 'Đưa ra quyết định chính xác, có cơ sở' },
      { key: 'C', code: 'OP', text: 'Hoàn thành mục tiêu đúng kế hoạch' },
      { key: 'D', code: 'CO', text: 'Đạt được sự đồng thuận hoặc phản hồi tích cực từ người khác' },
    ],
  },
  {
    id: 7,
    question: 'Nếu tham gia một cuộc thi kinh doanh, bạn muốn phụ trách phần nào nhất?',
    options: [
      { key: 'A', code: 'CR', text: 'Xây dựng concept và ý tưởng sản phẩm/chiến dịch' },
      { key: 'B', code: 'AN', text: 'Nghiên cứu thị trường và phân tích dữ liệu' },
      { key: 'C', code: 'OP', text: 'Lập kế hoạch triển khai và quản lý ngân sách/tiến độ' },
      { key: 'D', code: 'CO', text: 'Pitching, thuyết phục giám khảo/đối tác và phát triển quan hệ' },
    ],
  },
  {
    id: 8,
    question: 'Bạn thích môi trường làm việc nào nhất?',
    options: [
      { key: 'A', code: 'CR', text: 'Nơi khuyến khích thử nghiệm và đưa ra ý tưởng mới' },
      { key: 'B', code: 'AN', text: 'Nơi coi trọng dữ liệu, logic và bằng chứng' },
      { key: 'C', code: 'OP', text: 'Nơi có mục tiêu, quy trình và trách nhiệm rõ ràng' },
      { key: 'D', code: 'CO', text: 'Nơi có nhiều tương tác, khách hàng và cơ hội thương lượng' },
    ],
  },
  {
    id: 9,
    question: 'Khi phải học một kỹ năng mới phục vụ công việc, cách nào khiến bạn thấy hứng thú nhất?',
    options: [
      { key: 'A', code: 'CR', text: 'Tự thử nghiệm và biến nó thành cách làm của riêng mình' },
      { key: 'B', code: 'AN', text: 'Tìm hiểu nguyên lý, số liệu và cách hoạt động' },
      { key: 'C', code: 'OP', text: 'Học theo quy trình rồi áp dụng từng bước' },
      { key: 'D', code: 'CO', text: 'Học thông qua trao đổi, thực hành với người khác' },
    ],
  },
  {
    id: 10,
    question: 'Nếu công việc tương lai chỉ cho phép bạn dành phần lớn thời gian cho một hoạt động, bạn sẽ chọn gì?',
    options: [
      { key: 'A', code: 'CR', text: 'Phát triển ý tưởng và tạo ra cái mới' },
      { key: 'B', code: 'AN', text: 'Phân tích, đánh giá và tối ưu hiệu quả' },
      { key: 'C', code: 'OP', text: 'Quản lý công việc, nguồn lực và tiến độ' },
      { key: 'D', code: 'CO', text: 'Giao tiếp, đàm phán và phát triển khách hàng/đối tác' },
    ],
  },
];

/**
 * Tendency Metadata Definitions
 */
export const TENDENCY_DEFINITIONS: Record<
  CareerTendencyCode,
  {
    name: string;
    englishName: string;
    description: string;
    whyFit: string;
    color: string;
    bgLight: string;
    border: string;
    badgeColor: string;
  }
> = {
  CR: {
    name: 'Sáng tạo & Đổi mới',
    englishName: 'Creative & Innovation',
    description:
      'Nổi bật ở khả năng nảy ra ý tưởng mới, sáng tạo nội dung, thử nghiệm giải pháp độc đáo và đổi mới sản phẩm, chiến dịch.',
    whyFit:
      'Xu hướng của bạn cho thấy bạn có trực giác nhạy bén với cái mới, thích thử nghiệm góc nhìn khác biệt và tìm thấy niềm vui khi biến ý tưởng thô thành sản phẩm, thông điệp truyền cảm hứng.',
    color: '#712AE2',
    bgLight: '#FAF5FF',
    border: '#E9D5FF',
    badgeColor: 'bg-purple-100 text-purple-800',
  },
  AN: {
    name: 'Phân tích & Tối ưu',
    englishName: 'Analytical & Optimization',
    description:
      'Nổi bật ở tư duy số liệu, nghiên cứu thị trường, logic vấn đề, đánh giá bằng chứng và tối ưu hóa hiệu suất liên tục.',
    whyFit:
      'Xu hướng của bạn cho thấy bạn đề cao sự chính xác, thích đào sâu bản chất vấn đề bằng số liệu và đưa ra quyết định dựa trên bằng chứng đo lường được thay vì cảm tính.',
    color: '#0284C7',
    bgLight: '#F0F9FF',
    border: '#BAE6FD',
    badgeColor: 'bg-sky-100 text-sky-800',
  },
  OP: {
    name: 'Lập kế hoạch & Vận hành',
    englishName: 'Planning & Operations',
    description:
      'Nổi bật ở năng lực tổ chức, xây dựng quy trình, phân bổ nguồn lực, theo dõi tiến độ và đảm bảo thực thi chuẩn xác.',
    whyFit:
      'Xu hướng của bạn cho thấy bạn có tư duy cấu trúc rõ ràng, tỉ mỉ trong việc phân công và luôn hướng đến việc hoàn thành mục tiêu đúng hạn, đúng tiêu chuẩn cam kết.',
    color: '#059669',
    bgLight: '#ECFDF5',
    border: '#A7F3D0',
    badgeColor: 'bg-emerald-100 text-emerald-800',
  },
  CO: {
    name: 'Giao tiếp & Kinh doanh',
    englishName: 'Communication & Business',
    description:
      'Nổi bật ở kỹ năng đàm phán, kết nối mạng lưới, thuyết phục khách hàng/đối tác và mở rộng cơ hội thương mại.',
    whyFit:
      'Xu hướng của bạn cho thấy bạn thích tương tác trực tiếp với con người, có khả năng lắng nghe và thuyết phục tốt, tạo dựng niềm tin và đem lại giá trị thương mại bền vững.',
    color: '#B90013',
    bgLight: '#FEF2F2',
    border: '#FECACA',
    badgeColor: 'bg-red-100 text-red-800',
  },
};

/**
 * Deterministic scoring engine:
 * Maps selected answers to scores:
 * A -> CR
 * B -> AN
 * C -> OP
 * D -> CO
 *
 * Tie-breaking rule:
 * If two or more categories have equal scores, priority order is strictly
 * CR > AN > OP > CO to ensure stable, reproducible and non-random outcomes.
 */
export function calculateCareerCheckScores(answers: Record<number, 'A' | 'B' | 'C' | 'D'>): {
  scores: CareerInterestScores;
  percentages: CareerInterestScores;
  topTendencies: TopCareerTendency[];
} {
  const scores: CareerInterestScores = {
    CR: 0,
    AN: 0,
    OP: 0,
    CO: 0,
  };

  CAREER_CHECK_QUESTIONS.forEach((q) => {
    const ans = answers[q.id];
    if (ans === 'A') scores.CR += 1;
    else if (ans === 'B') scores.AN += 1;
    else if (ans === 'C') scores.OP += 1;
    else if (ans === 'D') scores.CO += 1;
  });

  // Calculate percentages (always totals 100%)
  const percentages: CareerInterestScores = {
    CR: Math.round((scores.CR / 10) * 100),
    AN: Math.round((scores.AN / 10) * 100),
    OP: Math.round((scores.OP / 10) * 100),
    CO: Math.round((scores.CO / 10) * 100),
  };

  // Stable deterministic sorting with explicit tie-break order: CR > AN > OP > CO
  const tieBreakPriority: Record<CareerTendencyCode, number> = {
    CR: 4,
    AN: 3,
    OP: 2,
    CO: 1,
  };

  const codes: CareerTendencyCode[] = ['CR', 'AN', 'OP', 'CO'];
  codes.sort((a, b) => {
    if (scores[b] !== scores[a]) {
      return scores[b] - scores[a];
    }
    // Tie-break by priority
    return tieBreakPriority[b] - tieBreakPriority[a];
  });

  const topTendencies: TopCareerTendency[] = codes.slice(0, 3).map((code) => ({
    code,
    name: TENDENCY_DEFINITIONS[code].name,
    percentage: percentages[code],
    score: scores[code],
    description: TENDENCY_DEFINITIONS[code].description,
    whyFit: TENDENCY_DEFINITIONS[code].whyFit,
  }));

  return {
    scores,
    percentages,
    topTendencies,
  };
}

/**
 * Career Recommendation Engine:
 * Combines Top Tendencies (especially Top 2 combination) with User Profile (major, academic year, career goal).
 */
export function generateCareerRecommendations(
  topTendencies: TopCareerTendency[],
  profile?: Partial<UserProfileState>
) {
  const top1 = topTendencies[0]?.code || 'CR';
  const top2 = topTendencies[1]?.code || 'AN';
  const comboKey = [top1, top2].sort().join('+');

  const major = profile?.major || 'Marketing & Truyền thông Đa phương tiện';

  // Major contextual adjustment
  const isMarketing = major.toLowerCase().includes('marketing') || major.toLowerCase().includes('truyền thông');
  const isBusiness = major.toLowerCase().includes('kinh doanh') || major.toLowerCase().includes('thương mại');
  const isIT = major.toLowerCase().includes('công nghệ') || major.toLowerCase().includes('cntt');

  let primary: {
    title: string;
    description: string;
    startingRoles: string[];
    coreSkills: string[];
    fitReason: string;
  };

  let secondaries: {
    title: string;
    description: string;
    startingRoles: string[];
    coreSkills: string[];
    fitReason: string;
  }[] = [];

  switch (comboKey) {
    case 'AN+CR': // CR + AN
      primary = {
        title: isIT ? 'Product Growth / Data Tech' : 'Performance Marketing Specialist',
        description: 'Kết hợp trực giác sáng tạo thông điệp với tư duy phân tích số liệu để tối ưu hóa chiến dịch đa kênh.',
        startingRoles: ['Performance Marketing Intern', 'Digital Marketing Executive', 'Growth Trainee'],
        coreSkills: ['Meta Ads', 'Google Ads', 'GA4 & CRO', 'A/B Testing', 'Excel / Data Reporting'],
        fitReason: 'Xu hướng của bạn cho thấy bạn vừa có cảm quan nội dung tốt vừa nhạy bén với các chỉ số ROI, phễu chuyển đổi.',
      };
      secondaries = [
        {
          title: 'Marketing Analytics Specialist',
          description: 'Chuyên sâu phân tích dữ liệu hành vi người dùng và hiệu quả kinh doanh.',
          startingRoles: ['Marketing Analyst Intern', 'BI Junior Specialist'],
          coreSkills: ['SQL cơ bản', 'Looker Studio', 'GA4', 'Thống kê'],
          fitReason: 'Phù hợp khi thiên hướng phân tích và tối ưu của bạn được phát huy mạnh mẽ.',
        },
        {
          title: 'Growth Marketing Executive',
          description: 'Thực thi các thử nghiệm tăng trưởng thần tốc cho sản phẩm số.',
          startingRoles: ['Growth Intern', 'Product Marketing Trainee'],
          coreSkills: ['Funnel Optimization', 'Copywriting thử nghiệm', 'Automation Tools'],
          fitReason: 'Kết hợp sáng tạo thử nghiệm liên tục với việc đo lường kết quả tức thì.',
        },
      ];
      break;

    case 'CO+CR': // CR + CO
      primary = {
        title: 'Content & Brand Marketing Specialist',
        description: 'Xây dựng câu chuyện thương hiệu, sáng tạo nội dung đa nền tảng và kết nối cảm xúc với cộng đồng.',
        startingRoles: ['Content Marketing Intern', 'Creative Executive', 'Social Media Trainee'],
        coreSkills: ['Content Strategy', 'Storytelling', 'Social Media Management', 'Canva / Visual Thinking', 'Copywriting'],
        fitReason: 'Xu hướng của bạn cho thấy khả năng kết nối cảm xúc người xem và tư duy sáng tạo thông điệp chạm tới khách hàng.',
      };
      secondaries = [
        {
          title: 'Account Executive (Creative Agency)',
          description: 'Cầu nối giữa khách hàng doanh nghiệp và đội ngũ sáng tạo của công ty quảng cáo.',
          startingRoles: ['Account Intern', 'Client Service Executive'],
          coreSkills: ['Pitching & Thuyết trình', 'Lắng nghe yêu cầu', 'Brief sáng tạo', 'Đàm phán'],
          fitReason: 'Phát huy thế mạnh giao tiếp, thấu hiểu khách hàng và định hướng ý tưởng.',
        },
        {
          title: 'PR & Communications Officer',
          description: 'Quản trị hình ảnh tổ chức, quan hệ báo chí và các chiến dịch truyền thông đa kênh.',
          startingRoles: ['PR Intern', 'Corporate Communications Assistant'],
          coreSkills: ['Viết thông cáo', 'Xử lý khủng hoảng', 'Quan hệ báo chí', 'Truyền thông nội bộ'],
          fitReason: 'Tận dụng khả năng ngoại giao và năng khiếu ngôn từ sáng tạo.',
        },
      ];
      break;

    case 'AN+OP': // AN + OP
      primary = {
        title: isIT ? 'IT Business Analyst (BA)' : 'Business Analyst & Operations Specialist',
        description: 'Phân tích yêu cầu kinh doanh, chuẩn hóa quy trình và đề xuất giải pháp tối ưu hệ thống.',
        startingRoles: ['Business Analyst Intern', 'Operations Coordinator', 'Data & Process Associate'],
        coreSkills: ['BPMN / Quy trình', 'SQL & Excel', 'Phân tích yêu cầu', 'Quản lý dự án Agile', 'Jira/Trello'],
        fitReason: 'Xu hướng của bạn cho thấy sự kết hợp hoàn hảo giữa tư duy logic dữ liệu và khả năng sắp xếp quy trình mạch lạc.',
      };
      secondaries = [
        {
          title: 'Operations Analyst',
          description: 'Tối ưu hóa chi phí và hiệu suất vận hành chuỗi cung ứng hoặc kênh thương mại điện tử.',
          startingRoles: ['Operations Intern', 'E-commerce Ops Assistant'],
          coreSkills: ['Quản trị kho vận', 'Đo lường KPI', 'Excel nâng cao', 'Lean/Six Sigma'],
          fitReason: 'Tập trung vào việc đo lường số liệu và chuẩn hóa các bước thực thi.',
        },
        {
          title: 'Project Management Specialist',
          description: 'Điều phối tiến độ, ngân sách và nguồn lực để dự án hoàn thành đúng mục tiêu.',
          startingRoles: ['Project Coordinator Intern', 'Scrum Master Trainee'],
          coreSkills: ['Quản trị rủi ro', 'Timeline Planning', 'Giao việc & Báo cáo'],
          fitReason: 'Phát huy năng lực kiểm soát chất lượng và cam kết mốc thời gian.',
        },
      ];
      break;

    case 'AN+CO': // AN + CO
      primary = {
        title: 'Market Research & Customer Insights Specialist',
        description: 'Nghiên cứu thị trường sâu rộng, phỏng vấn khách hàng và tư vấn chiến lược cho doanh nghiệp.',
        startingRoles: ['Market Research Intern', 'Consumer Insight Trainee', 'Strategic Planner Assistant'],
        coreSkills: ['Khảo sát & Phỏng vấn sâu', 'Phân tích SPSS/Excel', 'Viết báo cáo Insight', 'Thuyết trình dữ liệu'],
        fitReason: 'Xu hướng của bạn cho thấy khả năng vừa lắng nghe người dùng vừa chuyển hóa quan sát thành số liệu định lượng có giá trị.',
      };
      secondaries = [
        {
          title: 'Business Development Specialist (B2B)',
          description: 'Nghiên cứu thị trường mục tiêu và xây dựng quan hệ hợp tác chiến lược.',
          startingRoles: ['B2B Sales Intern', 'Partnership Associate'],
          coreSkills: ['Phân tích đối thủ', 'Kỹ năng Cold Calling / Email', 'Đàm phán hợp đồng', 'CRM'],
          fitReason: 'Tiếp cận khách hàng bằng phương pháp phân tích bài bản, có số liệu thuyết phục.',
        },
        {
          title: 'Management / Strategy Consultant',
          description: 'Tư vấn giải pháp giải quyết bài toán kinh doanh cho lãnh đạo doanh nghiệp.',
          startingRoles: ['Consulting Intern', 'Junior Associate'],
          coreSkills: ['Hypothesis Thinking', 'Financial Modeling', 'Slide Making', 'Client Advisory'],
          fitReason: 'Tận dụng năng lực logic sắc bén cùng phong thái giao tiếp chuyên nghiệp.',
        },
      ];
      break;

    case 'CO+OP': // OP + CO
      primary = {
        title: 'Project Coordinator & Account Specialist',
        description: 'Vừa giữ vai trò kết nối khách hàng vừa trực tiếp điều phối tiến độ và đội ngũ triển khai.',
        startingRoles: ['Project Coordinator Intern', 'Account Executive', 'Event Operations Associate'],
        coreSkills: ['Giao tiếp liên phòng ban', 'Lập kế hoạch tiến độ', 'Quản lý ngân sách', 'Chăm sóc khách hàng'],
        fitReason: 'Xu hướng của bạn cho thấy bạn khéo léo trong tương tác và rất đáng tin cậy trong việc giữ đúng cam kết tiến độ.',
      };
      secondaries = [
        {
          title: 'HR & Talent Acquisition Specialist',
          description: 'Tìm kiếm, phỏng vấn nhân tài và xây dựng quy trình trải nghiệm nhân viên gắn kết.',
          startingRoles: ['HR Intern', 'Recruiter Assistant'],
          coreSkills: ['Phỏng vấn tuyển dụng', 'Employer Branding', 'Quản lý hồ sơ nhân sự', 'Onboarding'],
          fitReason: 'Kết hợp tình yêu làm việc với con người cùng kỹ năng sắp xếp thủ tục chỉn chu.',
        },
        {
          title: 'Event Management Specialist',
          description: 'Tổ chức sự kiện doanh nghiệp, hội thảo chuyên ngành từ khâu lên kịch bản đến chạy thực địa.',
          startingRoles: ['Event Intern', 'Production Assistant'],
          coreSkills: ['Quản lý nhà cung cấp', 'Chạy kịch bản chạy', 'Điều phối nhân sự', 'Xử lý tình huống'],
          fitReason: 'Đòi hỏi sự linh hoạt trong giao tiếp và khả năng quán xuyến nhiều đầu việc cùng lúc.',
        },
      ];
      break;

    case 'CR+OP': // CR + OP
    default:
      primary = {
        title: 'Campaign & Creative Project Manager',
        description: 'Lên kế hoạch tổng thể cho các chiến dịch sáng tạo, cân bằng giữa ý tưởng độc đáo và tính khả thi vận hành.',
        startingRoles: ['Campaign Coordinator Intern', 'Creative Planner Assistant', 'Product Marketing Intern'],
        coreSkills: ['Lập kế hoạch chiến dịch', 'Quản lý Designer / Copywriter', 'Dự trù ngân sách', 'Đánh giá KPI'],
        fitReason: 'Xu hướng của bạn cho thấy bạn vừa giàu ý tưởng mới vừa có kỷ luật tổ chức để biến ý tưởng thành hiện thực.',
      };
      secondaries = [
        {
          title: 'Product Marketing Executive',
          description: 'Chuẩn bị kế hoạch Go-to-Market và đóng gói sản phẩm phù hợp với nhu cầu thị trường.',
          startingRoles: ['PMM Intern', 'Marketing Assistant'],
          coreSkills: ['Định vị sản phẩm', 'Feature Pitch', 'Tài liệu hướng dẫn', 'Cross-team Alignment'],
          fitReason: 'Phát huy khả năng đóng gói ý tưởng sáng tạo thành quy trình ra mắt bài bản.',
        },
        {
          title: 'Event & Experience Designer',
          description: 'Thiết kế trải nghiệm người tham gia và vận hành triển khai các chương trình thương hiệu.',
          startingRoles: ['Event Coordinator', 'Experience Assistant'],
          coreSkills: ['Ý tưởng concept', 'Bản vẽ không gian', 'Timeline triển khai', 'Quản trị rủi ro'],
          fitReason: 'Thỏa mãn khát vọng tạo ra điều mới mẻ trong một khuôn khổ kế hoạch cụ thể.',
        },
      ];
      break;
  }

  return {
    primary,
    secondaries,
    all: [
      { ...primary, isPrimary: true },
      ...secondaries.map((s) => ({ ...s, isPrimary: false })),
    ],
  };
}

/**
 * Generate a complete Skill Gap breakdown tailored to the Career Check result
 */
export function generateSkillGapFromCareerCheck(
  targetRole: string,
  topTendencies: TopCareerTendency[],
  profile?: Partial<UserProfileState>
): SkillGapData {
  const top1 = topTendencies[0]?.code || 'CR';
  const major = profile?.major || 'Marketing';
  const year = profile?.academicYear || 'Năm 3';

  // Base match score derived from top tendencies and year
  const baseMatch = 75 + Math.min(topTendencies[0]?.score * 3, 18);

  if (targetRole.toLowerCase().includes('performance') || targetRole.toLowerCase().includes('digital')) {
    return {
      targetRole: 'Performance Marketing Specialist',
      matchScore: Math.min(baseMatch, 92),
      strengths: [
        'Tư duy số liệu & đo lường chuyển đổi',
        'Khả năng sáng tạo thông điệp & nội dung quảng cáo',
        'Tư duy A/B Testing và tối ưu liên tục',
      ],
      matchedSkills: [
        'Nền tảng Marketing căn bản',
        'Viết Copywriting cho Social Ads',
        'Sử dụng Canva & Công cụ sáng tạo',
        'Phân tích phễu khách hàng',
      ],
      missingSkills: [
        'Kỹ thuật thiết lập Meta Ads & TikTok Ads nâng cao',
        'Đọc hiểu chuyên sâu Google Analytics 4 (GA4)',
        'Tối ưu tỷ lệ chuyển đổi Landing Page (CRO)',
        'Phân bổ ngân sách theo mô hình Attribution',
      ],
      skillMatrix: [
        {
          name: 'Sáng tạo thông điệp quảng cáo (Ad Copywriting)',
          category: 'domain',
          currentLevel: 85,
          requiredLevel: 80,
          status: 'proficient',
          recommendation: 'Đã vững nền tảng, tập trung thử nghiệm thêm các định dạng video ngắn (Short-form)',
        },
        {
          name: 'Thiết lập & Tối ưu Meta Ads / TikTok Ads',
          category: 'technical',
          currentLevel: 55,
          requiredLevel: 85,
          status: 'in_progress',
          recommendation: 'Thực hành chạy chiến dịch thực tế với ngân sách nhỏ trong CLB hoặc dự án môn học',
        },
        {
          name: 'Google Analytics 4 & Báo cáo dữ liệu',
          category: 'technical',
          currentLevel: 45,
          requiredLevel: 80,
          status: 'missing',
          recommendation: 'Tham gia học chứng chỉ Google Analytics 4 Certification miễn phí trên Skillshop',
        },
        {
          name: 'Tư duy A/B Testing & Phân tích ROI',
          category: 'domain',
          currentLevel: 60,
          requiredLevel: 75,
          status: 'in_progress',
          recommendation: 'Học cách tính chỉ số CPA, ROAS, LTV và phương pháp chọn mẫu thử nghiệm',
        },
      ],
      learningRecommendations: [
        'Hoàn thành Cấp độ 2 & Cấp độ 3 trên Career Map về công cụ quảng cáo số',
        'Đăng ký Workshop "Thực chiến tối ưu chuyển đổi với GA4" tại PTIT',
        'Cập nhật CV với các từ khóa đo lường hiệu suất (ROAS, CTR, Conversion Rate)',
      ],
    };
  }

  if (targetRole.toLowerCase().includes('content') || targetRole.toLowerCase().includes('brand')) {
    return {
      targetRole: 'Content & Brand Marketing Specialist',
      matchScore: Math.min(baseMatch, 94),
      strengths: [
        'Kể chuyện thương hiệu & Cảm quan ngôn từ',
        'Nắm bắt xu hướng truyền thông mạng xã hội',
        'Tư duy thẩm mỹ và đóng gói thông điệp',
      ],
      matchedSkills: [
        'Content Creation (Facebook, TikTok, Blog)',
        'Social Media Trend Jacking',
        'Thiết kế đồ họa cơ bản',
        'Nghiên cứu thị hiếu người trẻ',
      ],
      missingSkills: [
        'Lập kế hoạch chiến dịch truyền thông tổng thể (IMC Plan)',
        'Đo lường chỉ số tương tác và sức khỏe thương hiệu (Brand Sentiment)',
        'Quản lý ngân sách sản xuất nội dung',
      ],
      skillMatrix: [
        {
          name: 'Sáng tạo nội dung đa nền tảng',
          category: 'domain',
          currentLevel: 90,
          requiredLevel: 85,
          status: 'proficient',
          recommendation: 'Thế mạnh nổi bật, nên lập một Content Portfolio riêng để ứng tuyển thực tập',
        },
        {
          name: 'Lập kế hoạch truyền thông tích hợp (IMC)',
          category: 'domain',
          currentLevel: 60,
          requiredLevel: 80,
          status: 'in_progress',
          recommendation: 'Nghiên cứu các case study chiến dịch đạt giải BSI Awards / MMA Smarties',
        },
        {
          name: 'Phân tích chỉ số nội dung (Social Analytics)',
          category: 'technical',
          currentLevel: 50,
          requiredLevel: 75,
          status: 'missing',
          recommendation: 'Học cách đo lường Engagement Rate, Reach và tỷ lệ giữ chân video',
        },
      ],
      learningRecommendations: [
        'Xây dựng 1 trang Portfolio tổng hợp các bài viết và chiến dịch đã tham gia',
        'Tham gia cuộc thi Marketing PTIT Challenge trong mục Sự kiện',
        'Dùng tính năng AI CV để đối chiếu từ khóa chuẩn cho vị trí Content Intern',
      ],
    };
  }

  // Default / Business / Operations fallback
  return {
    targetRole,
    matchScore: Math.min(baseMatch, 88),
    strengths: [
      'Tư duy logic và giải quyết vấn đề có phương pháp',
      'Kỹ năng sắp xếp công việc và quản lý mục tiêu',
      'Giao tiếp rõ ràng và làm việc nhóm hiệu quả',
    ],
    matchedSkills: ['Microsoft Office / Google Workspace', 'Kỹ năng trình bày', 'Nghiên cứu tài liệu', 'Tư duy phản biện'],
    missingSkills: ['Công cụ quản lý chuyên ngành', 'Phân tích số liệu nâng cao', 'Kinh nghiệm dự án thực tế'],
    skillMatrix: [
      {
        name: 'Tư duy logic & Quy trình',
        category: 'domain',
        currentLevel: 80,
        requiredLevel: 80,
        status: 'proficient',
        recommendation: 'Duy trì thế mạnh và áp dụng vào các dự án môn học',
      },
      {
        name: 'Công cụ phân tích & Quản trị',
        category: 'technical',
        currentLevel: 50,
        requiredLevel: 80,
        status: 'missing',
        recommendation: 'Lựa chọn các chứng chỉ nghề nghiệp tương ứng trên lộ trình phát triển',
      },
    ],
    learningRecommendations: [
      'Khám phá lộ trình 5 cấp độ trên trang Career Map',
      'Ứng tuyển các cơ hội thực tập sinh được hệ thống gợi ý',
      'Thêm các bài tập thực hành vào mục My Tasks để theo dõi tiến độ mỗi tuần',
    ],
  };
}

/**
 * Generate personalized tasks based on Career Check result
 */
export function generateTasksFromCareerCheck(
  targetRole: string,
  topTendencies: TopCareerTendency[],
  profile?: Partial<UserProfileState>
) {
  const major = profile?.major || 'Marketing';
  const roleName = targetRole || 'Digital Marketing Specialist';

  return [
    {
      id: `task-${Date.now()}-1`,
      title: `Chuẩn hóa CV với từ khóa cho vị trí ${roleName}`,
      description: 'Sử dụng công cụ AI CV để quét độ tương thích và tối ưu các tiêu đề kinh nghiệm.',
      category: 'cv' as const,
      priority: 'high' as const,
      dueDate: 'Tuần này',
      completed: false,
    },
    {
      id: `task-${Date.now()}-2`,
      title: 'Khám phá Lộ trình 5 cấp độ trên Career Map',
      description: `Kiểm tra các kỹ năng nền tảng và công cụ cần trang bị cho hướng đi ${roleName}.`,
      category: 'roadmap' as const,
      priority: 'high' as const,
      dueDate: 'Trước 3 ngày',
      completed: true,
    },
    {
      id: `task-${Date.now()}-3`,
      title: 'Đăng ký 1 sự kiện / workshop liên quan tại PTIT',
      description: 'Mở rộng mạng lưới kết nối doanh nghiệp và tích lũy chứng chỉ ngoại khóa.',
      category: 'learning' as const,
      priority: 'medium' as const,
      dueDate: 'Trong tháng',
      completed: false,
    },
    {
      id: `task-${Date.now()}-4`,
      title: `Lưu và ứng tuyển 2 vị trí thực tập ${roleName}`,
      description: `Khám phá các tin tuyển dụng ưu tiên trên trang Việc làm phù hợp với sinh viên ${major}.`,
      category: 'application' as const,
      priority: 'medium' as const,
      dueDate: 'Cuối tháng',
      completed: false,
    },
  ];
}

/**
 * Full Career Check submission processor
 */
export function processCareerCheckSubmission(
  answers: Record<number, 'A' | 'B' | 'C' | 'D'>,
  profile?: Partial<UserProfileState>
): CareerCheckResult {
  const { scores, percentages, topTendencies } = calculateCareerCheckScores(answers);
  const recommendations = generateCareerRecommendations(topTendencies, profile);
  const skillGap = generateSkillGapFromCareerCheck(recommendations.primary.title, topTendencies, profile);
  const suggestedTasks = generateTasksFromCareerCheck(recommendations.primary.title, topTendencies, profile);

  return {
    scores,
    percentages,
    topTendencies,
    recommendedCareers: recommendations.all,
    skillGap,
    suggestedTasks,
    completedAt: new Date().toISOString(),
  };
}
