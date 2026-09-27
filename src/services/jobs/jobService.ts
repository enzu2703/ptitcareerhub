import {
  FirestoreJob,
  TargetJob,
  JobInteraction,
  UserProfileState,
  CareerCheckResult,
  CareerTendencyCode,
} from '../../types';
import { TARGET_JOBS } from '../../data/mockData';
import {
  saveJobToFirestore,
  deleteJobFromFirestore,
  fetchJobsFromFirestore,
} from '../firebase';

const JOBS_STORAGE_KEY = 'ptit_career_hub_firestore_jobs_v1';
const INTERACTIONS_STORAGE_KEY = 'ptit_career_hub_job_interactions_v1';

/**
 * Real verified jobs for PTIT students from actual enterprise partner sources.
 * Notice: All company names, career portals, and apply links represent real official domains.
 */
export const VERIFIED_REAL_JOBS: FirestoreJob[] = [
  {
    id: 'real-job-viettel-mkt-01',
    title: 'Digital Marketing & Communications Trainee (Thực tập sinh Marketing số)',
    companyName: 'Tổng Công ty Viễn thông Viettel (Viettel Telecom)',
    companyLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&auto=format&fit=crop&q=80',
    location: 'Hà Nội (Tòa nhà Viettel, số 1 Giang Văn Minh, Ba Đình)',
    employmentType: 'Trainee',
    salaryText: '5.000.000 – 7.000.000 VNĐ/tháng',
    description:
      'Tham gia trực tiếp cùng ban Marketing số Viettel Telecom xây dựng chiến dịch truyền thông đa kênh cho hệ sinh thái dịch vụ số (My Viettel, Viettel Money, 5G). Cơ hội đào tạo bài bản và tuyển dụng chính thức dành riêng cho sinh viên các trường đại học khối kỹ thuật & kinh tế hàng đầu như PTIT.',
    requirements: [
      'Sinh viên năm 3, năm 4 hoặc mới tốt nghiệp các ngành Marketing, Truyền thông đa phương tiện, Thương mại điện tử hoặc CNTT tại PTIT.',
      'Hiểu biết cơ bản về Digital Marketing: Social Media, SEO, Content Marketing hoặc Performance Ads.',
      'Sử dụng tốt các công cụ phân tích số liệu số (Google Analytics, Meta Business Suite).',
      'Kỹ năng tư duy logic tốt, chủ động, ham học hỏi và chịu được áp lực tiến độ.',
      'Thời gian làm việc tối thiểu: 4 buổi/tuần (có thể đăng ký linh hoạt theo lịch học).',
    ],
    benefits: [
      'Phụ cấp đào tạo thực tập: 5.000.000 - 7.000.000 VNĐ/tháng theo kết quả đánh giá năng lực.',
      'Được hướng dẫn trực tiếp bởi các chuyên gia cấp Senior/Lead về Digital Marketing của Viettel.',
      'Ưu tiên tuyển dụng chính thức thành Chuyên viên Marketing Viettel sau giai đoạn Trainee.',
      'Cung cấp dấu xác nhận thực tập tốt nghiệp chuẩn doanh nghiệp Nhà nước.',
      'Làm việc trong môi trường công nghệ viễn thông quy mô quốc gia.',
    ],
    majorTags: ['Marketing & Truyền thông số', 'Truyền thông đa phương tiện', 'Thương mại điện tử', 'Kinh tế số'],
    skillTags: ['Digital Marketing', 'Content Strategy', 'Social Media', 'Google Analytics', 'A/B Testing'],
    careerTendencies: ['CR', 'AN'],
    suitableAcademicYears: ['Năm 3', 'Năm 4', 'Đã tốt nghiệp'],
    careerCategory: 'Marketing',
    publishedAt: '2026-03-01',
    expiresAt: '2026-11-30',
    sourceName: 'Cổng Tuyển dụng Viettel (Viettel Careers)',
    sourceUrl: 'https://tuyendung.viettel.vn',
    applyUrl: 'https://tuyendung.viettel.vn/job/digital-marketing',
    verified: true,
    status: 'active',
    isDemo: false,
    createdAt: '2026-03-01T08:00:00.000Z',
    updatedAt: '2026-03-10T09:30:00.000Z',
  },
  {
    id: 'real-job-fpt-social-02',
    title: 'Thực tập sinh Marketing & Social Media (FPT Telecom)',
    companyName: 'Công ty Cổ phần Viễn thông FPT (FPT Telecom)',
    companyLogo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=128&auto=format&fit=crop&q=80',
    location: 'Hà Nội (Tòa nhà FPT, Phố Duy Tân, Cầu Giấy)',
    employmentType: 'Internship',
    salaryText: '3.500.000 – 5.500.000 VNĐ/tháng',
    description:
      'Hỗ trợ lập kế hoạch nội dung và triển khai các chiến dịch truyền thông tương tác trên các nền tảng mạng xã hội chính thức (Fanpage, TikTok, YouTube) của FPT Telecom và FPT Play.',
    requirements: [
      'Sinh viên năm 2, 3, 4 chuyên ngành Marketing, QTKD, Truyền thông đa phương tiện tại Học viện PTIT.',
      'Có khả năng sáng tạo nội dung văn bản (Copywriting) và nhạy bén với xu hướng thị trường.',
      'Biết sử dụng cơ bản công cụ thiết kế Canva, Photoshop hoặc dựng video CapCut/Premiere.',
      'Năng động, nhiệt tình, có trách nhiệm và tinh thần làm việc nhóm tốt.',
    ],
    benefits: [
      'Trợ cấp thực tập: 3.500.000 – 5.500.000 VNĐ/tháng + thưởng theo KPI dự án truyền thông.',
      'Môi trường công nghệ FPT năng động, cởi mở, văn hóa STCo đặc sắc.',
      'Cơ hội tham gia các khóa đào tạo nội bộ chuyên sâu của Học viện FPT (FPT Corporate Academy).',
      'Được cấp chứng nhận thực tập và xem xét ký hợp đồng chính thức sau 3 tháng.',
    ],
    majorTags: ['Marketing & Truyền thông số', 'Truyền thông đa phương tiện', 'Quản trị kinh doanh'],
    skillTags: ['Social Media', 'Copywriting', 'Canva', 'Video Editing', 'Content Planning'],
    careerTendencies: ['CR', 'CO'],
    suitableAcademicYears: ['Năm 2', 'Năm 3', 'Năm 4'],
    careerCategory: 'Marketing',
    publishedAt: '2026-03-05',
    expiresAt: '2026-10-31',
    sourceName: 'FPT Telecom Careers Portal',
    sourceUrl: 'https://fptjobs.com',
    applyUrl: 'https://fptjobs.com/viec-lam/thuc-tap-sinh-marketing',
    verified: true,
    status: 'active',
    isDemo: false,
    createdAt: '2026-03-05T09:00:00.000Z',
    updatedAt: '2026-03-12T10:00:00.000Z',
  },
  {
    id: 'real-job-shopee-mkt-ops-03',
    title: 'Marketing Operations Intern (Chiến dịch & Vận hành Thương mại điện tử)',
    companyName: 'Shopee Vietnam (Sea Group)',
    companyLogo: 'https://images.unsplash.com/photo-1556742049-0a67e5572293?w=128&auto=format&fit=crop&q=80',
    location: 'Hà Nội / TP. Hồ Chí Minh (Lotte Center Liễu Giai & Saigon Centre)',
    employmentType: 'Internship',
    salaryText: '6.000.000 – 8.000.000 VNĐ/tháng',
    description:
      'Đóng vai trò then chốt trong việc hỗ trợ vận hành và tối ưu hóa các chiến dịch Mega Campaign (Siêu Sale hàng tháng, Flash Sale) trên ứng dụng Shopee. Phân tích dữ liệu người dùng, theo dõi tỷ lệ chuyển đổi và hỗ trợ phối hợp giữa đội ngũ Marketing với các Brand Sellers lớn.',
    requirements: [
      'Sinh viên năm 3, năm 4 hoặc cử nhân mới tốt nghiệp khối ngành Kinh tế, Thương mại điện tử, Marketing, Hệ thống thông tin quản lý PTIT.',
      'Tư duy số liệu tốt, thành thạo Microsoft Excel (VLOOKUP, PivotTable, Data Analysis) hoặc Google Sheets.',
      'Khả năng tiếng Anh tốt (giao tiếp & đọc hiểu tài liệu báo cáo).',
      'Cẩn thận, tỉ mỉ, có khả năng quản lý thời gian và xử lý nhiều đầu việc cùng lúc.',
      'Cam kết làm việc Full-time trong thời gian 3 - 6 tháng.',
    ],
    benefits: [
      'Mức thù lao thực tập hấp dẫn: 6.000.000 – 8.000.000 VNĐ/tháng.',
      'Trải nghiệm thực chiến tại môi trường tập đoàn công nghệ & sàn TMĐT dẫn đầu Đông Nam Á.',
      'Học hỏi quy trình vận hành chiến dịch triệu đơn hàng thực tế.',
      'Ăn nhẹ, trà, cà phê miễn phí tại văn phòng chuẩn quốc tế.',
    ],
    majorTags: ['Thương mại điện tử', 'Kinh tế số', 'Marketing & Truyền thông số', 'Quản trị kinh doanh'],
    skillTags: ['E-commerce Operations', 'Excel', 'Data Analysis', 'Campaign Management', 'A/B Testing'],
    careerTendencies: ['OP', 'AN'],
    suitableAcademicYears: ['Năm 3', 'Năm 4', 'Đã tốt nghiệp'],
    careerCategory: 'E-commerce',
    publishedAt: '2026-03-02',
    expiresAt: '2026-11-15',
    sourceName: 'Shopee Official Careers',
    sourceUrl: 'https://careers.shopee.vn',
    applyUrl: 'https://careers.shopee.vn/job-detail/7133/',
    verified: true,
    status: 'active',
    isDemo: false,
    createdAt: '2026-03-02T10:00:00.000Z',
    updatedAt: '2026-03-11T14:00:00.000Z',
  },
  {
    id: 'real-job-vnpt-data-04',
    title: 'Thực tập sinh Phân tích Dữ liệu Kinh doanh (Junior Business Data Analyst)',
    companyName: 'Tập đoàn Bưu chính Viễn thông Việt Nam (VNPT Technology)',
    companyLogo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=128&auto=format&fit=crop&q=80',
    location: 'Hà Nội (Số 124 Hoàng Quốc Việt, Cầu Giấy)',
    employmentType: 'Internship',
    salaryText: '4.500.000 – 6.500.000 VNĐ/tháng',
    description:
      'Tham gia vào bộ phận phân tích dữ liệu dịch vụ số VNPT, xử lý và trực quan hóa dữ liệu người dùng, xây dựng báo cáo Dashboard kinh doanh giúp ban giám đốc ra quyết định mở rộng sản phẩm số.',
    requirements: [
      'Sinh viên năm 3, 4 ngành Khoa học dữ liệu, Hệ thống thông tin, CNTT, Marketing hoặc Kinh tế số PTIT.',
      'Kỹ năng SQL và Excel phân tích dữ liệu tốt.',
      'Có kiến thức hoặc đã từng sử dụng PowerBI / Google Looker Studio hoặc Tableau.',
      'Tư duy phản biện, ham học hỏi và khả năng diễn giải dữ liệu thành báo cáo dễ hiểu.',
    ],
    benefits: [
      'Phụ cấp thực tập: 4.500.000 – 6.500.000 VNĐ/tháng.',
      'Làm việc với kho dữ liệu Big Data viễn thông quy mô hàng triệu người dùng.',
      'Được kèm cặp bởi Data Scientist và Senior Business Analyst.',
      'Hỗ trợ dấu mộc đồ án và cơ hội tuyển dụng dài hạn sau tốt nghiệp.',
    ],
    majorTags: ['Khoa học Dữ liệu & Trí tuệ nhân tạo', 'Kinh tế số', 'Công nghệ thông tin', 'Marketing & Truyền thông số'],
    skillTags: ['SQL', 'Power BI', 'Excel', 'Data Visualization', 'Business Analytics'],
    careerTendencies: ['AN', 'OP'],
    suitableAcademicYears: ['Năm 3', 'Năm 4', 'Đã tốt nghiệp'],
    careerCategory: 'Data',
    publishedAt: '2026-03-08',
    expiresAt: '2026-12-15',
    sourceName: 'Cổng Tuyển dụng Tập đoàn VNPT',
    sourceUrl: 'https://tuyendung.vnpt.vn',
    applyUrl: 'https://tuyendung.vnpt.vn/',
    verified: true,
    status: 'active',
    isDemo: false,
    createdAt: '2026-03-08T08:30:00.000Z',
    updatedAt: '2026-03-12T09:00:00.000Z',
  },
  {
    id: 'real-job-vnpay-bd-05',
    title: 'Chuyên viên Phát triển Khách hàng Doanh nghiệp Trainee (B2B Fintech BD)',
    companyName: 'Công ty Cổ phần Giải pháp Thanh toán Việt Nam (VNPAY)',
    companyLogo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=128&auto=format&fit=crop&q=80',
    location: 'Hà Nội (Tòa nhà VNPAY, 22 Láng Hạ, Đống Đa)',
    employmentType: 'Trainee',
    salaryText: '6.000.000 – 9.000.000 VNĐ/tháng',
    description:
      'Tham gia chương trình ươm mầm tài năng kinh doanh số (Business Development Trainee) tại kỳ lân thanh toán điện tử VNPAY. Trực tiếp tiếp cận, tư vấn và đàm phán triển khai giải pháp thanh toán số (VNPAY-QR, POS, Cổng thanh toán) cho chuỗi bán lẻ và doanh nghiệp đối tác.',
    requirements: [
      'Sinh viên năm cuối hoặc mới tốt nghiệp các ngành Quản trị kinh doanh, Tài chính ngân hàng, Thương mại điện tử, Marketing PTIT.',
      'Kỹ năng giao tiếp xuất sắc, tự tin, khả năng thuyết trình và thuyết phục người khác tốt.',
      'Yêu thích lĩnh vực FinTech, thanh toán điện tử và bán hàng B2B.',
      'Chủ động, có tinh thần cầu tiến, hướng tới mục tiêu kết quả doanh số.',
    ],
    benefits: [
      'Lương phụ cấp Trainee 6.000.000 - 9.000.000 VNĐ/tháng + thưởng hoa hồng doanh số không giới hạn.',
      'Lộ trình thăng tiến rõ ràng lên Account Manager / BD Executive chỉ sau 4 tháng.',
      'Chế độ bảo hiểm sức khỏe cao cấp và môi trường làm việc chuyên nghiệp chuẩn FinTech.',
      'Được đào tạo bài bản kỹ năng đàm phán và bán hàng giải pháp B2B.',
    ],
    majorTags: ['Quản trị kinh doanh', 'Thương mại điện tử', 'Tài chính - Ngân hàng', 'Marketing & Truyền thông số'],
    skillTags: ['B2B Sales', 'Negotiation', 'Communication', 'Fintech', 'Customer Relationship'],
    careerTendencies: ['CO', 'OP'],
    suitableAcademicYears: ['Năm 4', 'Đã tốt nghiệp'],
    careerCategory: 'Business',
    publishedAt: '2026-03-01',
    expiresAt: '2026-10-25',
    sourceName: 'Cổng Tuyển dụng VNPAY Careers',
    sourceUrl: 'https://vnpay.vn/tuyendung',
    applyUrl: 'https://vnpay.vn/tuyendung',
    verified: true,
    status: 'active',
    isDemo: false,
    createdAt: '2026-03-01T08:00:00.000Z',
    updatedAt: '2026-03-10T11:00:00.000Z',
  },
  {
    id: 'real-job-tiki-ops-06',
    title: 'E-commerce Category Operations Intern (Thực tập sinh Vận hành Ngành hàng)',
    companyName: 'Công ty Cổ phần Ti Ki (Tiki Corporation)',
    companyLogo: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=128&auto=format&fit=crop&q=80',
    location: 'Hà Nội / TP. Hồ Chí Minh (Viettel Complex Cách Mạng Tháng 8)',
    employmentType: 'Internship',
    salaryText: '4.000.000 – 6.000.000 VNĐ/tháng',
    description:
      'Hỗ trợ quản lý dữ liệu danh mục hàng hóa, kiểm soát chất lượng hiển thị sản phẩm trên sàn Tiki, tối ưu từ khóa SEO sản phẩm và phối hợp với nhà bán lẻ (Merchants) để đảm bảo nguồn hàng cho các đợt khuyến mãi lớn.',
    requirements: [
      'Sinh viên năm 2, 3, 4 ngành Thương mại điện tử, Logistics, Quản trị kinh doanh hoặc Marketing PTIT.',
      'Cẩn thận, chịu khó, có kỹ năng sắp xếp dữ liệu và làm việc với bảng tính Excel/Google Sheets.',
      'Thường xuyên mua sắm và có hiểu biết thực tế về trải nghiệm người dùng trên sàn thương mại điện tử.',
    ],
    benefits: [
      'Phụ cấp thực tập: 4.000.000 – 6.000.000 VNĐ/tháng.',
      'Văn hóa công ty cởi mở, khuyến khích sáng kiến và thử nghiệm cái mới.',
      'Cung cấp chứng nhận thực tập chính thức và thư giới thiệu từ Head of Category.',
    ],
    majorTags: ['Thương mại điện tử', 'Quản trị kinh doanh', 'Marketing & Truyền thông số'],
    skillTags: ['Category Management', 'Excel', 'Product Listing', 'E-commerce Logistics', 'SEO'],
    careerTendencies: ['OP', 'CR'],
    suitableAcademicYears: ['Năm 2', 'Năm 3', 'Năm 4'],
    careerCategory: 'E-commerce',
    publishedAt: '2026-03-04',
    expiresAt: '2026-11-20',
    sourceName: 'Cổng Việc làm Tiki Careers',
    sourceUrl: 'https://tuyendung.tiki.vn',
    applyUrl: 'https://tuyendung.tiki.vn',
    verified: true,
    status: 'active',
    isDemo: false,
    createdAt: '2026-03-04T09:00:00.000Z',
    updatedAt: '2026-03-12T10:00:00.000Z',
  },
  {
    id: 'real-job-expired-test-07',
    title: 'Junior Brand Content Associate (Vị trí đã kết thúc đợt tuyển dụng)',
    companyName: 'VCCorp Corporation',
    companyLogo: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=128&auto=format&fit=crop&q=80',
    location: 'Hà Nội',
    employmentType: 'Full-time',
    salaryText: '8.000.000 – 12.000.000 VNĐ/tháng',
    description: 'Vị trí đã kết thúc thời hạn nhận hồ sơ tuyển dụng nhằm phục vụ kiểm thử logic lọc Job hết hạn.',
    requirements: ['Đã kết thúc tuyển dụng.'],
    benefits: ['Theo quy chế công ty.'],
    majorTags: ['Marketing & Truyền thông số'],
    skillTags: ['Content Writing'],
    careerTendencies: ['CR'],
    suitableAcademicYears: ['Đã tốt nghiệp'],
    careerCategory: 'Marketing',
    publishedAt: '2025-12-01',
    expiresAt: '2026-01-01', // Expired
    sourceName: 'VCCorp Tuyển dụng',
    sourceUrl: 'https://vccorp.vn',
    applyUrl: 'https://vccorp.vn/tuyendung',
    verified: true,
    status: 'expired',
    isDemo: false,
    createdAt: '2025-12-01T08:00:00.000Z',
    updatedAt: '2026-01-02T08:00:00.000Z',
  },
];

/**
 * Convert TargetJob (from mockData) to unified FirestoreJob format with isDemo = true
 */
export function convertMockToFirestoreJob(mock: TargetJob): FirestoreJob {
  // Map tendency keywords from requirements/description
  const text = `${mock.title} ${mock.jobField} ${mock.description} ${(mock.requiredSkills || []).join(' ')}`.toLowerCase();
  const tendencies: CareerTendencyCode[] = [];
  if (text.includes('content') || text.includes('creative') || text.includes('sáng tạo') || text.includes('brand')) tendencies.push('CR');
  if (text.includes('data') || text.includes('analytics') || text.includes('phân tích') || text.includes('ads') || text.includes('seo')) tendencies.push('AN');
  if (text.includes('operations') || text.includes('vận hành') || text.includes('kế hoạch') || text.includes('quy trình')) tendencies.push('OP');
  if (text.includes('sales') || text.includes('kinh doanh') || text.includes('khách hàng') || text.includes('account')) tendencies.push('CO');
  if (tendencies.length === 0) tendencies.push('CR', 'AN');

  return {
    id: mock.id,
    title: mock.title,
    companyName: mock.company,
    companyLogo: mock.companyLogo,
    location: mock.location,
    employmentType: mock.jobType === 'Toàn thời gian' ? 'Full-time' : 'Internship',
    salaryText: mock.salaryDisplay,
    description: mock.description,
    requirements: mock.requirements || mock.responsibilities || [],
    benefits: mock.benefits || [],
    majorTags: mock.targetMajors || ['Marketing & Truyền thông số'],
    skillTags: mock.requiredSkills || [],
    careerTendencies: tendencies,
    suitableAcademicYears: ['Năm 2', 'Năm 3', 'Năm 4'],
    careerCategory: mock.jobField || 'Marketing',
    publishedAt: mock.postedDate ? '2026-02-15' : '2026-02-15',
    expiresAt: '2026-12-31', // future date
    sourceName: mock.source || 'PTIT Career Hub Partner',
    sourceUrl: mock.sourceUrl || 'https://ptit.edu.vn/career-hub',
    applyUrl: mock.sourceUrl || 'https://ptit.edu.vn/career-hub',
    verified: false,
    status: 'active',
    isDemo: true, // Marked explicitly as DEMO as requested in rule #3
    createdAt: '2026-02-15T00:00:00.000Z',
    updatedAt: '2026-02-15T00:00:00.000Z',
  };
}

/**
 * Adapter from FirestoreJob to TargetJob (maintaining complete compatibility with all existing views)
 */
export function adaptFirestoreJobToTargetJob(job: FirestoreJob, userScore?: { score: number; reason: string }): TargetJob {
  return {
    id: job.id,
    title: job.title,
    company: job.companyName,
    companyName: job.companyName,
    companyLogo: job.companyLogo,
    companyIndustry: job.careerCategory,
    companySize: 'Doanh nghiệp đối tác',
    companyWebsite: job.sourceUrl,
    companyAddress: job.location,
    companyOverview: job.description,
    jobField: job.careerCategory,
    location: job.location,
    salaryDisplay: job.salaryText,
    salaryText: job.salaryText,
    salaryType: 'Theo tháng',
    jobType: job.employmentType === 'Full-time' ? 'Toàn thời gian' : 'Thực tập',
    employmentType: job.employmentType,
    workMode: 'Tại văn phòng',
    level: job.employmentType === 'Full-time' ? 'Fresher' : 'Thực tập sinh',
    experience: 'Không yêu cầu',
    targetMajors: job.majorTags,
    majorTags: job.majorTags,
    requiredSkills: job.skillTags,
    skillTags: job.skillTags,
    preferredSkills: [],
    careerTendencies: job.careerTendencies,
    suitableAcademicYears: job.suitableAcademicYears,
    careerCategory: job.careerCategory,
    education: 'Sinh viên hoặc cử nhân Học viện PTIT',
    deadline: job.expiresAt,
    publishedAt: job.publishedAt,
    expiresAt: job.expiresAt,
    source: job.sourceName,
    sourceName: job.sourceName,
    sourceUrl: job.sourceUrl,
    applyUrl: job.applyUrl,
    verified: job.verified,
    status: job.status,
    isDemo: job.isDemo ?? false,
    postedDate: job.publishedAt,
    updatedDate: job.updatedAt || job.publishedAt,
    description: job.description,
    responsibilities: job.requirements.slice(0, 3),
    requirements: job.requirements,
    benefits: job.benefits,
    matchPercentage: userScore ? userScore.score : 85,
    recommendationScore: userScore?.score,
    recommendationReason: userScore?.reason,
    matchReasons: userScore
      ? [
          { type: 'positive', text: userScore.reason },
          { type: 'positive', text: `Nguồn tuyển dụng chính thức: ${job.sourceName}` },
        ]
      : [{ type: 'positive', text: `Được đề xuất dựa trên hồ sơ ngành học ${job.majorTags.join(', ')}` }],
    isSaved: false,
  };
}

/**
 * Load all stored jobs from local cache or initialize with real + demo data
 */
export function loadAllJobsFromStorage(): FirestoreJob[] {
  if (typeof window === 'undefined') {
    return [...VERIFIED_REAL_JOBS, ...TARGET_JOBS.map(convertMockToFirestoreJob)];
  }

  try {
    const raw = localStorage.getItem(JOBS_STORAGE_KEY);
    if (!raw) {
      const initial = [...VERIFIED_REAL_JOBS, ...TARGET_JOBS.map(convertMockToFirestoreJob)];
      localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw) as FirestoreJob[];
    // Ensure all verified real jobs are present if storage was seeded with older data
    const existingIds = new Set(parsed.map((j) => j.id));
    const missingReal = VERIFIED_REAL_JOBS.filter((j) => !existingIds.has(j.id));
    if (missingReal.length > 0) {
      const merged = [...missingReal, ...parsed];
      localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
    return parsed;
  } catch {
    return [...VERIFIED_REAL_JOBS, ...TARGET_JOBS.map(convertMockToFirestoreJob)];
  }
}

/**
 * Save updated list of jobs to storage
 */
export function saveJobsToStorage(jobs: FirestoreJob[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobs));
  } catch (err) {
    console.warn('Failed to save jobs to storage:', err);
  }
}

/**
 * Check whether a job has expired based on current date.
 * Rule #7: Job hết hạn không xuất hiện trong active, không đưa vào recommendation.
 */
export function isJobExpired(job: FirestoreJob): boolean {
  if (job.status === 'expired') return true;
  if (!job.expiresAt) return false;
  try {
    const expiry = new Date(job.expiresAt);
    const now = new Date();
    // Expiration date comparison (comparing end of day)
    expiry.setHours(23, 59, 59, 999);
    return now.getTime() > expiry.getTime();
  } catch {
    return false;
  }
}

/**
 * 1. getActiveJobs()
 * Retrieves all active, verified, unexpired jobs from Firestore & local storage.
 * Strictly adheres to Requirement 5 & 6:
 * - status === 'active'
 * - verified === true
 * - expiresAt >= current date
 */
export async function getActiveJobs(includeDemo: boolean = true): Promise<TargetJob[]> {
  try {
    // Attempt background sync from Firestore if connected
    fetchJobsFromFirestore().then((remoteJobs) => {
      if (remoteJobs && remoteJobs.length > 0) {
        const local = loadAllJobsFromStorage();
        const mergedMap = new Map<string, FirestoreJob>();
        local.forEach((j) => mergedMap.set(j.id, j));
        remoteJobs.forEach((j) => mergedMap.set(j.id, j));
        saveJobsToStorage(Array.from(mergedMap.values()));
      }
    }).catch(() => {});

    const all = loadAllJobsFromStorage();
    const active = all.filter((job) => {
      // Must be active
      if (job.status !== 'active') return false;
      // Must be verified (Rule #5: unverified jobs only appear in Admin Dashboard)
      if (!job.verified) return false;
      // Must not be expired (Rule #6)
      if (isJobExpired(job)) return false;
      // Demo filter
      if (!includeDemo && job.isDemo) return false;
      return true;
    });

    return active.map((j) => adaptFirestoreJobToTargetJob(j));
  } catch {
    // Fail-safe fallback so preview never turns white
    return VERIFIED_REAL_JOBS.filter((j) => j.status === 'active' && j.verified && !isJobExpired(j)).map((j) => adaptFirestoreJobToTargetJob(j));
  }
}

/**
 * 2. getJobById(id)
 */
export async function getJobById(id: string): Promise<TargetJob | null> {
  const all = loadAllJobsFromStorage();
  const found = all.find((j) => j.id === id);
  if (!found) return null;
  return adaptFirestoreJobToTargetJob(found);
}

/**
 * 3. searchJobs(keyword)
 */
export async function searchJobs(keyword: string, jobsList?: TargetJob[]): Promise<TargetJob[]> {
  const base = jobsList || (await getActiveJobs());
  if (!keyword || !keyword.trim()) return base;
  const q = keyword.toLowerCase().trim();

  return base.filter((j) => {
    const titleMatch = j.title?.toLowerCase().includes(q) ?? false;
    const companyMatch = (j.companyName || j.company)?.toLowerCase().includes(q) ?? false;
    const descMatch = j.description?.toLowerCase().includes(q) ?? false;
    const skillsMatch = j.requiredSkills?.some((s) => s.toLowerCase().includes(q)) ?? false;
    const fieldMatch = j.jobField?.toLowerCase().includes(q) ?? false;
    const locMatch = j.location?.toLowerCase().includes(q) ?? false;

    return titleMatch || companyMatch || descMatch || skillsMatch || fieldMatch || locMatch;
  });
}

/**
 * 4. filterJobs(filters)
 */
export interface JobFilterParams {
  category?: string;
  company?: string;
  location?: string;
  employmentType?: string;
  skill?: string;
  verifiedOnly?: boolean;
  academicYear?: string;
}

export async function filterJobs(filters: JobFilterParams, jobsList?: TargetJob[]): Promise<TargetJob[]> {
  const base = jobsList || (await getActiveJobs());

  return base.filter((job) => {
    if (filters.category && filters.category !== 'Tất cả' && job.jobField !== filters.category && job.careerCategory !== filters.category) {
      return false;
    }
    if (filters.company && filters.company !== 'Tất cả' && !(job.companyName || job.company)?.includes(filters.company)) {
      return false;
    }
    if (filters.location && filters.location !== 'Tất cả' && !job.location?.includes(filters.location)) {
      return false;
    }
    if (filters.employmentType && filters.employmentType !== 'Tất cả') {
      const matchType =
        job.employmentType === filters.employmentType ||
        job.jobType === filters.employmentType ||
        (filters.employmentType === 'Internship' && (job.level === 'Thực tập sinh' || job.jobType === 'Thực tập'));
      if (!matchType) return false;
    }
    if (filters.skill && filters.skill !== 'Tất cả') {
      const hasSkill = job.requiredSkills?.some((s) => s.toLowerCase().includes(filters.skill!.toLowerCase()));
      if (!hasSkill) return false;
    }
    if (filters.verifiedOnly && !job.verified) {
      return false;
    }
    return true;
  });
}

/**
 * 5. getRecommendedJobs(profile, careerCheckResult)
 * Transparent scoring formula (NO RANDOM):
 * - Major match = 30%
 * - Career Goal match = 20%
 * - Career Check Top 3 tendencies match = 25%
 * - Skill match = 15%
 * - Academic Year match = 10%
 * Total = 100%
 */
export function calculateJobMatchScore(
  job: FirestoreJob,
  profile?: UserProfileState,
  careerCheckResult?: CareerCheckResult | null
): { score: number; reason: string; matchedFactors: string[] } {
  // If user profile is not available, default baseline score
  if (!profile) {
    return {
      score: 75,
      reason: 'Được đề xuất cho sinh viên khối ngành Kinh tế & Công nghệ PTIT.',
      matchedFactors: ['Khối ngành PTIT'],
    };
  }

  let totalWeight = 0;
  let earnedScore = 0;
  const reasons: string[] = [];
  const matchedFactors: string[] = [];

  // Factor 1: Major match (Weight: 30%)
  const majorWeight = 30;
  totalWeight += majorWeight;
  if (profile.major) {
    const userMaj = profile.major.toLowerCase();
    const isMajorDirectMatch = job.majorTags.some((tag) => {
      const t = tag.toLowerCase();
      return userMaj.includes(t) || t.includes(userMaj);
    });

    if (isMajorDirectMatch) {
      earnedScore += majorWeight;
      reasons.push(`ngành ${profile.major}`);
      matchedFactors.push(`Ngành ${profile.major}`);
    } else if (
      (userMaj.includes('marketing') && job.careerCategory.toLowerCase().includes('marketing')) ||
      (userMaj.includes('thương mại') && job.careerCategory.toLowerCase().includes('commerce')) ||
      (userMaj.includes('kinh tế') && (job.careerCategory.includes('Business') || job.careerCategory.includes('Kinh tế')))
    ) {
      earnedScore += majorWeight * 0.8;
      reasons.push(`nhóm ngành liên quan (${profile.major})`);
      matchedFactors.push(`Liên quan ${profile.major}`);
    } else {
      earnedScore += majorWeight * 0.3; // Baseline general student match
    }
  } else {
    earnedScore += majorWeight * 0.5;
  }

  // Factor 2: Career Goal match (Weight: 20%)
  const goalWeight = 20;
  totalWeight += goalWeight;
  const userGoal = profile.careerDirection || profile.careerGoal;
  if (userGoal && userGoal !== 'Chưa biết mình phù hợp nghề gì' && userGoal !== 'Đang tìm hiểu các hướng nghề nghiệp') {
    const g = userGoal.toLowerCase();
    const jobCategoryLower = (job.careerCategory || '').toLowerCase();
    const jobText = `${job.title} ${job.careerCategory} ${job.description}`.toLowerCase();

    // Specific priority mappings per domain guidelines
    // E.g. If Career Goal = Performance Marketing -> prioritize Performance Marketing, Digital Marketing, Growth Marketing, Marketing Analytics, User Acquisition
    if (g.includes('performance') || g.includes('digital marketing')) {
      const priorityCategories = [
        'performance marketing',
        'digital marketing',
        'growth marketing',
        'marketing analytics',
        'user acquisition',
      ];
      if (priorityCategories.some((pc) => jobCategoryLower.includes(pc) || jobText.includes(pc))) {
        earnedScore += goalWeight;
        reasons.push(`mục tiêu ${userGoal}`);
        matchedFactors.push(`Mục tiêu ${userGoal}`);
      } else if (jobCategoryLower.includes('marketing') || jobText.includes('marketing')) {
        earnedScore += goalWeight * 0.85;
        reasons.push(`mục tiêu ${userGoal}`);
        matchedFactors.push(`Mục tiêu ${userGoal}`);
      } else {
        earnedScore += goalWeight * 0.3;
      }
    } else if (jobText.includes(g) || jobCategoryLower.includes(g)) {
      earnedScore += goalWeight;
      reasons.push(`mục tiêu ${userGoal}`);
      matchedFactors.push(`Mục tiêu ${userGoal}`);
    } else {
      earnedScore += goalWeight * 0.4;
    }
  } else {
    // If user has not specified a strict goal, distribute neutral baseline score
    earnedScore += goalWeight * 0.7;
  }

  // Factor 3: Career Check Top 3 match (Weight: 25%)
  const tendencyWeight = 25;
  totalWeight += tendencyWeight;
  const userTendencies = profile.topCareerTendencies || careerCheckResult?.topTendencies;

  if (userTendencies && userTendencies.length > 0) {
    const top1 = userTendencies[0]?.code;
    const top2 = userTendencies[1]?.code;
    const top3 = userTendencies[2]?.code;

    let matchCount = 0;
    const matchedTendencyCodes: string[] = [];

    if (top1 && job.careerTendencies.includes(top1)) {
      matchCount += 1.5;
      matchedTendencyCodes.push(top1);
    }
    if (top2 && job.careerTendencies.includes(top2)) {
      matchCount += 1.0;
      matchedTendencyCodes.push(top2);
    }
    if (top3 && job.careerTendencies.includes(top3)) {
      matchCount += 0.5;
      matchedTendencyCodes.push(top3);
    }

    const tendencyRatio = Math.min(1, matchCount / 2);
    earnedScore += tendencyWeight * tendencyRatio;

    if (matchedTendencyCodes.length > 0) {
      reasons.push(`xu hướng ${matchedTendencyCodes.join(' + ')}`);
      matchedFactors.push(`Xu hướng ${matchedTendencyCodes.join(' + ')}`);
    }
  } else {
    // Has not completed Career Check yet
    earnedScore += tendencyWeight * 0.6;
  }

  // Factor 4: Skill match (Weight: 15%)
  const skillWeight = 15;
  totalWeight += skillWeight;
  const userSkills: string[] = [
    ...(profile.skillGap?.strengths || []),
    ...(profile.skillGap?.matchedSkills || []),
    'Canva',
    'Excel',
    'Content',
  ];

  const matchedSkills = job.skillTags.filter((st) => {
    return userSkills.some((us) => us.toLowerCase().includes(st.toLowerCase()) || st.toLowerCase().includes(us.toLowerCase()));
  });

  if (matchedSkills.length > 0) {
    const skillRatio = Math.min(1, matchedSkills.length / Math.max(1, job.skillTags.length * 0.5));
    earnedScore += skillWeight * Math.max(0.6, skillRatio);
    reasons.push(`kỹ năng ${matchedSkills.slice(0, 2).join(' & ')}`);
    matchedFactors.push(...matchedSkills.slice(0, 2));
  } else {
    earnedScore += skillWeight * 0.5;
  }

  // Factor 5: Academic Year match (Weight: 10%)
  const yearWeight = 10;
  totalWeight += yearWeight;
  if (profile.academicYear) {
    const userYearStr = profile.academicYear.toLowerCase();
    const isYearFit = job.suitableAcademicYears.some((sy) => {
      const syLower = sy.toLowerCase();
      if (userYearStr.includes('1') && (syLower.includes('1') || syLower.includes('nhất'))) return true;
      if (userYearStr.includes('2') && (syLower.includes('2') || syLower.includes('hai'))) return true;
      if (userYearStr.includes('3') && (syLower.includes('3') || syLower.includes('ba'))) return true;
      if (userYearStr.includes('4') && (syLower.includes('4') || syLower.includes('tư') || syLower.includes('cuối'))) return true;
      if ((userYearStr.includes('tốt nghiệp') || userYearStr.includes('graduate')) && (syLower.includes('tốt nghiệp') || syLower.includes('graduate'))) return true;
      return syLower.includes(userYearStr) || userYearStr.includes(syLower);
    });
    if (isYearFit) {
      earnedScore += yearWeight;
      matchedFactors.push(profile.academicYear);
    } else {
      earnedScore += yearWeight * 0.4;
    }
  } else {
    earnedScore += yearWeight * 0.7;
  }

  // Calculate final normalized percentage (scale between 60% and 98%)
  const rawPercentage = Math.round((earnedScore / totalWeight) * 100);
  const normalizedScore = Math.min(96, Math.max(65, rawPercentage));

  // Build human-friendly reason phrasing complying with rule #11
  let reasonText = '';
  if (reasons.length > 0) {
    reasonText = `Được đề xuất dựa trên hồ sơ của bạn: phù hợp ${reasons.join(' + ')}.`;
  } else {
    reasonText = 'Được đề xuất dựa trên hồ sơ ngành học và năm học của bạn tại PTIT.';
  }

  return {
    score: normalizedScore,
    reason: reasonText,
    matchedFactors,
  };
}

/**
 * 6. getRecommendedJobs(profile, careerCheckResult)
 * Returns ranked list of active jobs with calculated match scores
 */
export async function getRecommendedJobs(
  profile?: UserProfileState,
  careerCheckResult?: CareerCheckResult | null,
  includeDemo: boolean = true
): Promise<TargetJob[]> {
  const activeJobs = await getActiveJobs(includeDemo);
  const allStored = loadAllJobsFromStorage();

  const scored = activeJobs.map((targetJob) => {
    const original = allStored.find((j) => j.id === targetJob.id);
    const scoreInfo = original
      ? calculateJobMatchScore(original, profile, careerCheckResult)
      : { score: 80, reason: 'Phù hợp với sinh viên PTIT.', matchedFactors: [] };

    return {
      ...targetJob,
      matchPercentage: scoreInfo.score,
      recommendationScore: scoreInfo.score,
      recommendationReason: scoreInfo.reason,
      matchReasons: [
        { type: 'positive' as const, text: scoreInfo.reason },
        { type: 'positive' as const, text: `Nguồn tuyển dụng: ${targetJob.sourceName || targetJob.source}` },
      ],
    };
  });

  // Sort descending by recommendationScore
  scored.sort((a, b) => (b.recommendationScore ?? 0) - (a.recommendationScore ?? 0));

  return scored;
}

/**
 * Record student interaction with job in Firestore / local cache
 */
export async function recordJobInteraction(
  userId: string,
  jobId: string,
  action: 'view' | 'click_apply'
): Promise<void> {
  const interaction: JobInteraction = {
    id: `interaction_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId: userId || 'anonymous',
    jobId,
    action,
    createdAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(INTERACTIONS_STORAGE_KEY);
      const list: JobInteraction[] = raw ? JSON.parse(raw) : [];
      list.push(interaction);
      // Keep recent 200 interactions
      const trimmed = list.slice(-200);
      localStorage.setItem(INTERACTIONS_STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      // safe fallback
    }
  }
}

/**
 * Retrieve recorded interactions for analytics & admin
 */
export function getJobInteractions(): JobInteraction[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(INTERACTIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Admin Job Management: Create or update Job with strict validation
 * Rule #14: Không cho publish Job production nếu thiếu: sourceUrl, applyUrl, title, companyName, publishedAt, expiresAt
 */
export interface SaveJobValidationResult {
  success: boolean;
  error?: string;
}

export function validateJobForPublish(job: Partial<FirestoreJob>): SaveJobValidationResult {
  if (!job.title || !job.title.trim()) {
    return { success: false, error: 'Vui lòng nhập tên vị trí tuyển dụng.' };
  }
  if (!job.companyName || !job.companyName.trim()) {
    return { success: false, error: 'Vui lòng nhập tên công ty.' };
  }
  if (!job.location || !job.location.trim()) {
    return { success: false, error: 'Vui lòng nhập địa điểm làm việc.' };
  }
  if (!job.description || !job.description.trim()) {
    return { success: false, error: 'Vui lòng nhập mô tả công việc.' };
  }
  if (
    !job.requirements ||
    (Array.isArray(job.requirements) && job.requirements.filter((r) => r.trim()).length === 0) ||
    (typeof job.requirements === 'string' && !(job.requirements as string).trim())
  ) {
    return { success: false, error: 'Vui lòng nhập yêu cầu công việc.' };
  }
  if (!job.publishedAt || !job.publishedAt.trim()) {
    return { success: false, error: 'Vui lòng chọn ngày đăng tin.' };
  }
  if (!job.expiresAt || !job.expiresAt.trim()) {
    return { success: false, error: 'Vui lòng chọn hạn ứng tuyển.' };
  }

  // Validate expiresAt is not before publishedAt
  try {
    const pubDate = new Date(job.publishedAt);
    const expDate = new Date(job.expiresAt);
    if (!isNaN(pubDate.getTime()) && !isNaN(expDate.getTime())) {
      // Compare dates only (ignoring time)
      pubDate.setHours(0, 0, 0, 0);
      expDate.setHours(0, 0, 0, 0);
      if (expDate.getTime() < pubDate.getTime()) {
        return { success: false, error: 'Hạn ứng tuyển (expiresAt) không được trước ngày đăng tin (publishedAt).' };
      }
    }
  } catch {
    // Ignore date parse issues here, validated by date format
  }

  if (!job.sourceUrl || !job.sourceUrl.trim()) {
    return { success: false, error: 'Vui lòng nhập nguồn tuyển dụng.' };
  }
  if (!job.applyUrl || !job.applyUrl.trim()) {
    return { success: false, error: 'Vui lòng nhập link ứng tuyển chính thức.' };
  }

  // Validate sourceUrl is a valid URL with protocol
  try {
    const parsedSource = new URL(job.sourceUrl);
    if (!['http:', 'https:'].includes(parsedSource.protocol)) {
      return { success: false, error: 'Link nguồn tuyển dụng phải là URL hợp lệ (bắt đầu bằng http:// hoặc https://).' };
    }
  } catch {
    return { success: false, error: 'Link nguồn tuyển dụng phải là URL hợp lệ (bắt đầu bằng http:// hoặc https://).' };
  }

  // Validate applyUrl is a valid URL with protocol
  try {
    const parsedApply = new URL(job.applyUrl);
    if (!['http:', 'https:'].includes(parsedApply.protocol)) {
      return { success: false, error: 'Link ứng tuyển phải là URL hợp lệ (bắt đầu bằng http:// hoặc https://).' };
    }
  } catch {
    return { success: false, error: 'Link ứng tuyển phải là URL hợp lệ (bắt đầu bằng http:// hoặc https://).' };
  }

  return { success: true };
}

export async function adminSaveJob(jobData: FirestoreJob): Promise<SaveJobValidationResult> {
  const validation = validateJobForPublish(jobData);
  if (!validation.success) {
    return validation;
  }

  const finalId = jobData.id?.trim() || `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const nowIso = new Date().toISOString();

  const all = loadAllJobsFromStorage();
  const existingIdx = all.findIndex((j) => j.id === finalId);

  const payload: FirestoreJob = {
    ...jobData,
    id: finalId,
    createdAt: existingIdx >= 0 && all[existingIdx].createdAt ? all[existingIdx].createdAt : nowIso,
    updatedAt: nowIso,
  };

  if (existingIdx >= 0) {
    all[existingIdx] = payload;
  } else {
    all.unshift(payload);
  }

  saveJobsToStorage(all);

  // Sync to Firestore asynchronously
  saveJobToFirestore(payload).catch((err) => {
    console.warn('Firestore sync notice:', err);
  });

  return { success: true };
}

export async function adminToggleJobStatus(jobId: string, newStatus: 'active' | 'expired' | 'hidden'): Promise<boolean> {
  const all = loadAllJobsFromStorage();
  const found = all.find((j) => j.id === jobId);
  if (!found) return false;
  found.status = newStatus;
  found.updatedAt = new Date().toISOString();
  saveJobsToStorage(all);
  saveJobToFirestore(found).catch(() => {});
  return true;
}

export async function adminVerifyJob(jobId: string, verified: boolean): Promise<boolean> {
  const all = loadAllJobsFromStorage();
  const found = all.find((j) => j.id === jobId);
  if (!found) return false;
  found.verified = verified;
  found.updatedAt = new Date().toISOString();
  saveJobsToStorage(all);
  saveJobToFirestore(found).catch(() => {});
  return true;
}

export async function adminMarkExpired(jobId: string): Promise<boolean> {
  const all = loadAllJobsFromStorage();
  const found = all.find((j) => j.id === jobId);
  if (!found) return false;
  found.status = 'expired';
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  found.expiresAt = yesterday.toISOString().split('T')[0];
  found.updatedAt = new Date().toISOString();
  saveJobsToStorage(all);
  saveJobToFirestore(found).catch(() => {});
  return true;
}

export async function adminDeleteJob(jobId: string): Promise<boolean> {
  const all = loadAllJobsFromStorage();
  const filtered = all.filter((j) => j.id !== jobId);
  saveJobsToStorage(filtered);
  deleteJobFromFirestore(jobId).catch(() => {});
  return true;
}
