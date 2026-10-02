import React, { useState } from 'react';
import { ScreenView } from '../../types';
import {
  ShieldCheck,
  Lock,
  FileText,
  UserCheck,
  Eye,
  Database,
  Trash2,
  Cpu,
  Search,
  ChevronRight,
  ExternalLink,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface PrivacyPolicyViewProps {
  onNavigate: (view: ScreenView) => void;
}

export const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState<string>('sec-1');

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-8 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-6">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="px-3 py-1 bg-red-50 text-[#B90013] text-xs font-bold rounded-full border border-red-100 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#B90013]" />
            PTIT Career Hub • Văn bản Pháp lý & Bảo mật
          </span>
          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full">
            Phiên bản hiệu lực: 2026 • Áp dụng toàn trường
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#131B2E] tracking-tight">
          Chính sách bảo mật dữ liệu
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
          Cam kết bảo vệ tuyệt đối thông tin học tập, hồ sơ CV và hoạt động hướng nghiệp của sinh viên Học viện Công nghệ Bưu chính Viễn thông khi sử dụng nền tảng PTIT Career Hub.
        </p>
      </div>

      {/* 4 Key Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-[#B90013] flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-sm text-[#131B2E]">Bảo mật tệp CV PDF</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Tệp CV tải lên chỉ sử dụng cho phiên đối chiếu của bạn. Không bao giờ gửi cho doanh nghiệp khi bạn chưa chủ động bấm ứng tuyển.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-sm text-[#131B2E]">Minh bạch với AI Gemini</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            AI xử lý đọc dữ liệu theo thời gian thực. Tuyệt đối không dùng thông tin cá nhân của sinh viên để huấn luyện mô hình mở công cộng.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-sm text-[#131B2E]">Quyền kiểm soát 100%</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Sinh viên có toàn quyền kiểm tra, xác nhận (user_verified), chỉnh sửa hoặc xóa vĩnh viễn phiên làm việc CV bất cứ lúc nào.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-sm text-[#131B2E]">Mã hóa đường truyền</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Dữ liệu truyền tải qua giao thức mã hóa HTTPS/TLS tiêu chuẩn cao, lưu trữ an toàn trong hạ tầng trường học.
          </p>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500">
              Mục lục chính sách
            </h4>

            <nav className="space-y-1 text-xs font-semibold">
              {[
                { id: 'sec-1', label: '1. Mục đích và phạm vi thu thập dữ liệu' },
                { id: 'sec-2', label: '2. Quy trình xử lý tệp CV & Gemini AI' },
                { id: 'sec-3', label: '3. Chia sẻ thông tin với Nhà tuyển dụng' },
                { id: 'sec-4', label: '4. Quyền của sinh viên đối với dữ liệu' },
                { id: 'sec-5', label: '5. Lưu trữ, thời hạn và bảo vệ dữ liệu' },
                { id: 'sec-6', label: '6. Cookie và phân tích kỹ thuật số' },
                { id: 'sec-7', label: '7. Đơn vị phụ trách & Thông tin liên hệ' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                    activeSection === item.id
                      ? 'bg-red-50 text-[#B90013] font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                </button>
              ))}
            </nav>
          </div>

          {/* Quick Action Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-red-50/70 via-white to-purple-50/50 border border-red-100 text-xs space-y-3">
            <span className="font-bold text-[#B90013] block">
              Bạn muốn kiểm tra dữ liệu CV của mình?
            </span>
            <p className="text-slate-600 leading-relaxed">
              Bạn có thể xem lại phiên phân tích gần nhất, xóa dữ liệu đã tải lên hoặc chỉnh sửa thông tin trực tiếp.
            </p>
            <button
              onClick={() => onNavigate('cv-builder')}
              className="w-full py-2.5 px-3 rounded-xl bg-[#B90013] text-white font-bold flex items-center justify-center gap-1.5 hover:bg-[#A30010] transition-colors cursor-pointer"
            >
              <span>Vào Tối ưu hóa CV</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Policy Detail Sections (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-2xs space-y-8 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {/* Section 1 */}
          <section id="sec-1" className="space-y-3 pt-2">
            <h2 className="text-base sm:text-lg font-extrabold text-[#131B2E] border-b border-slate-100 pb-2">
              1. Mục đích và phạm vi thu thập dữ liệu
            </h2>
            <p>
              PTIT Career Hub được xây dựng với mục tiêu định hướng nghề nghiệp, kết nối việc làm thực tập và tối ưu hóa hồ sơ cho sinh viên Học viện Công nghệ Bưu chính Viễn thông. Để vận hành các tính năng cốt lõi, nền tảng thu thập các nhóm dữ liệu sau:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>
                <strong>Thông tin định danh học vụ:</strong> Họ tên sinh viên, Mã sinh viên (MSV), địa chỉ email sinh viên (tênmiền <code>@student.ptit.edu.vn</code>), khóa đào tạo và chuyên ngành học tại PTIT.
              </li>
              <li>
                <strong>Dữ liệu định hướng và sở thích nghề nghiệp:</strong> Câu trả lời trắc nghiệm Holland/Big Five, mục tiêu nghề nghiệp (careerGoal), kỹ năng hiện có và công việc mục tiêu sinh viên quan tâm.
              </li>
              <li>
                <strong>Tệp tài liệu CV do sinh viên chủ động tải lên:</strong> Tệp PDF chứa thông tin học vấn, kỹ năng, kinh nghiệm và dự án được sinh viên gửi vào hệ thống.
              </li>
              <li>
                <strong>Lịch sử tương tác:</strong> Danh sách công việc đã lưu, sự kiện hướng nghiệp đã đăng ký tham gia điểm danh.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section id="sec-2" className="space-y-3 pt-4">
            <h2 className="text-base sm:text-lg font-extrabold text-[#131B2E] border-b border-slate-100 pb-2">
              2. Quy trình xử lý tệp CV và công nghệ Gemini AI
            </h2>
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-2">
              <span className="font-extrabold text-purple-950 flex items-center gap-1.5 text-xs">
                <Sparkles className="w-4 h-4 text-purple-700" />
                <span>Nguyên tắc xử lý Trí tuệ Nhân tạo Đạo đức (Ethical AI)</span>
              </span>
              <p className="text-xs text-purple-900 leading-relaxed">
                Tất cả các lệnh xử lý tài liệu PDF được thực hiện thông qua mô hình Gemini 3.8 Flash của Google theo kênh bảo mật riêng (Enterprise API pipeline). Dữ liệu văn bản trong PDF của bạn được xử lý trực tiếp trong bộ nhớ tạm theo phiên làm việc (Session) để bóc tách cấu trúc và đối chiếu với JD.
              </p>
            </div>
            <p>
              Hệ thống tuân thủ 3 cam kết bất biến đối với tệp CV:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5 text-slate-600">
              <li>
                <strong>Không học máy trái phép:</strong> Dữ liệu CV của sinh viên không bao giờ được đưa vào tập dữ liệu huấn luyện mở của các mô hình AI bên ngoài.
              </li>
              <li>
                <strong>Không bịa đặt số liệu (Zero Hallucination Policy):</strong> AI chỉ đề xuất chỉnh sửa dựa trên dữ liệu có thật trong file PDF của bạn, tuyệt đối không tự bịa thêm KPI, doanh thu hay số liệu giả mạo.
              </li>
              <li>
                <strong>Cô lập phiên làm việc (Session Isolation):</strong> Mỗi lần tải file mới sẽ tạo một <code>cvSession</code> riêng biệt và xóa hoàn toàn trạng thái phiên trước để ngăn ngừa rò rỉ dữ liệu giữa các lần tải.
              </li>
            </ol>
          </section>

          {/* Section 3 */}
          <section id="sec-3" className="space-y-3 pt-4">
            <h2 className="text-base sm:text-lg font-extrabold text-[#131B2E] border-b border-slate-100 pb-2">
              3. Chia sẻ thông tin với Nhà tuyển dụng & Đối tác
            </h2>
            <p>
              PTIT Career Hub là cầu nối hợp tác giữa Học viện và các doanh nghiệp công nghệ, thương mại điện tử và viễn thông (VNPT, Viettel, FPT, Tiki, v.v.):
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>
                <strong>Chỉ chia sẻ khi có sự đồng thuận rõ ràng:</strong> Nhà tuyển dụng chỉ nhận được thông tin liên hệ và file CV của bạn khi bạn nhấn nút "Ứng tuyển" hoặc đồng ý mở chế độ "Cho phép doanh nghiệp kết nối".
              </li>
              <li>
                <strong>Báo cáo thống kê ẩn danh:</strong> Nhà trường có thể sử dụng số liệu thống kê tổng hợp (ví dụ: "70% sinh viên ngành Marketing quan tâm đến Digital Marketing") cho các báo cáo kiểm định chất lượng đào tạo mà không tiết lộ danh tính cá nhân sinh viên.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section id="sec-4" className="space-y-3 pt-4">
            <h2 className="text-base sm:text-lg font-extrabold text-[#131B2E] border-b border-slate-100 pb-2">
              4. Quyền của sinh viên đối với dữ liệu cá nhân
            </h2>
            <p>Sinh viên sử dụng nền tảng được bảo đảm đầy đủ các quyền:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 block mb-0.5">Quyền kiểm tra & Xác nhận</span>
                <span className="text-slate-600">Kiểm tra toàn bộ nội dung do AI trích xuất và chỉnh sửa theo ý muốn.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 block mb-0.5">Quyền yêu cầu xóa vĩnh viễn</span>
                <span className="text-slate-600">Xóa file CV và các phiên phân tích khỏi hệ thống bất kỳ lúc nào.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 block mb-0.5">Quyền làm lại trắc nghiệm</span>
                <span className="text-slate-600">Thực hiện lại trắc nghiệm nghề nghiệp để cập nhật xu hướng mới.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 block mb-0.5">Quyền từ chối nhận email</span>
                <span className="text-slate-600">Bật/tắt thông báo về cơ hội việc làm mới và tin sự kiện.</span>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section id="sec-5" className="space-y-3 pt-4">
            <h2 className="text-base sm:text-lg font-extrabold text-[#131B2E] border-b border-slate-100 pb-2">
              5. Lưu trữ, thời hạn và bảo vệ an toàn dữ liệu
            </h2>
            <p>
              Dữ liệu của sinh viên được lưu trữ trên hạ tầng điện toán đám mây với cơ chế bảo mật đa lớp (Multi-layer Security) gồm xác thực phân quyền Role-Based Access Control (RBAC) nghiêm ngặt.
            </p>
            <p>
              Hồ sơ học tập được lưu trữ trong suốt thời gian sinh viên theo học tại Học viện và được lưu trữ phục vụ mạng lưới cựu sinh viên trừ khi có yêu cầu hủy tài khoản chính thức.
            </p>
          </section>

          {/* Section 6 */}
          <section id="sec-6" className="space-y-3 pt-4">
            <h2 className="text-base sm:text-lg font-extrabold text-[#131B2E] border-b border-slate-100 pb-2">
              6. Sử dụng Cookie và bộ nhớ đệm trình duyệt
            </h2>
            <p>
              Hệ thống sử dụng bộ nhớ cục bộ (<code>localStorage</code>) và Cookie phiên làm việc cần thiết nhằm:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Ghi nhớ trạng thái đăng nhập của sinh viên.</li>
              <li>Lưu trữ tạm thời tiến trình làm bài trắc nghiệm khi kết nối mạng bị gián đoạn.</li>
              <li>Lưu danh sách công việc và sự kiện bạn đã đánh dấu yêu thích để truy cập nhanh ngoại tuyến.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section id="sec-7" className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-base sm:text-lg font-extrabold text-[#131B2E]">
              7. Đơn vị phụ trách & Thông tin liên hệ
            </h2>
            <p>
              Mọi thắc mắc hoặc yêu cầu liên quan đến việc xử lý dữ liệu cá nhân, sinh viên có thể liên hệ trực tiếp:
            </p>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1 text-slate-700">
              <span className="font-bold text-slate-900 block">
                Ban Quản trị Nền tảng PTIT Career Hub & Bộ phận Dữ liệu Sinh viên
              </span>
              <p>Học viện Công nghệ Bưu chính Viễn thông (Cơ sở Hà Nội & TP. Hồ Chí Minh)</p>
              <p>Email tiếp nhận yêu cầu dữ liệu: <code>careerhub@ptit.edu.vn</code></p>
              <p>Địa chỉ: Km10, Đường Nguyễn Trãi, Quận Hà Đông, Hà Nội</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
