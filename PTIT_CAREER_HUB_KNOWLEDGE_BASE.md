# PTIT CAREER HUB — HỆ TRI THỨC VÀ DỮ LIỆU NGHIỆP VỤ (KNOWLEDGE BASE FOR AI AGENT)

> **Mô tả tài liệu**: Đây là tài liệu Knowledge Base toàn diện chuẩn hóa toàn bộ nội dung kiến thức chuyên môn, bộ câu hỏi & đáp án trắc nghiệm định hướng nghề nghiệp, ma trận kỹ năng (Skill Gap), khung lộ trình chuẩn hóa 5 cấp độ, thuật toán gợi ý việc làm, dữ liệu việc làm & sự kiện, quy tắc tối ưu hóa CV ATS và ngữ cảnh đào tạo tại Học viện Công nghệ Bưu chính Viễn thông (PTIT).
> **Đối tượng sử dụng**: AI Agent, LLM RAG System, Chatbot tư vấn hướng nghiệp sinh viên, Động cơ gợi ý việc làm.

---

## MỤC LỤC
1. [Tổng quan Nền tảng & Đối tượng Người dùng](#1-tổng-quan-nền-tảng--đối-tượng-người-dùng)
2. [Hệ thống Đào tạo & Khóa học Sinh viên PTIT](#2-hệ-thống-đào-tạo--khóa-học-sinh-viên-ptit)
3. [Bộ Công cụ Trắc nghiệm Đánh giá Nghề nghiệp (Assessment)](#3-bộ-công-cụ-trắc-nghiệm-đánh-giá-nghề-nghiệp-assessment)
   - 3.1. Bộ câu hỏi Career Check nhanh (10 câu hỏi cốt lõi)
   - 3.2. Mô hình 4 Thiên hướng nghề nghiệp (CR, AN, OP, CO)
   - 3.3. Quy tắc tính điểm & Xử lý đồng điểm (Tie-breaking Rule)
   - 3.4. Ma trận kết hợp Thiên hướng & Bản đồ vị trí nghề nghiệp
   - 3.5. Bộ câu hỏi Đánh giá Chuyên sâu (32 câu hỏi 3 phần)
4. [Khung Phân tích Khoảng cách Kỹ năng (Skill Gap Matrix)](#4-khung-phân-tích-khoảng-cách-kỹ-năng-skill-gap-matrix)
5. [Lộ trình Phát triển Nghề nghiệp theo Cấp độ Chuẩn hóa](#5-lộ-trình-phát-triển-nghề-nghiệp-theo-cấp-độ-chuẩn-hóa)
6. [Hệ thống Dữ liệu Việc làm & Thuật toán Đối khớp (Job Matching Engine)](#6-hệ-thống-dữ-liệu-việc-làm--thuật-toán-đối-khớp-job-matching-engine)
   - 6.1. Thuật toán tính điểm tương thích (5 yếu tố trọng số)
   - 6.2. Cơ sở dữ liệu việc làm doanh nghiệp đối tác
7. [Hệ tri thức Tối ưu hóa CV theo Chuẩn ATS (AI CV Optimization)](#7-hệ-tri-thức-tối-ưu-hóa-cv-theo-chuẩn-ats-ai-cv-optimization)
8. [Cơ sở Dữ liệu Sự kiện, Hội thảo & Điểm rèn luyện](#8-cơ-sở-dữ-liệu-sự-kiện-hội-thảo--điểm-rèn-luyện)
9. [Chính sách Phân quyền (RBAC) & Chỉ số Quản trị Hệ thống](#9-chính-sách-phân-quyền-rbac--chỉ-số-quản-trị-hệ-thống)

---

## 1. TỔNG QUAN NỀN TẢNG & ĐỐI TƯỢNG NGƯỜI DÙNG

### 1.1. Sứ mệnh Nền tảng
PTIT Career Hub là nền tảng định hướng nghề nghiệp, phát triển kỹ năng và kết nối việc làm chuyên biệt dành riêng cho sinh viên Học viện Công nghệ Bưu chính Viễn thông (PTIT). Nền tảng kết nối chặt chẽ giữa 3 đỉnh tam giác:
1. **Khung chương trình đào tạo chính quy** của Học viện (Marketing, Truyền thông đa phương tiện, Thương mại điện tử, CNTT, Kinh tế số, QTKD).
2. **Năng lực thực tế & Thiên hướng tự nhiên của sinh viên** (đo lường qua Career Check và hồ sơ cá nhân).
3. **Nhu cầu tuyển dụng thực tế từ mạng lưới doanh nghiệp đối tác** (Viettel, VNPT, FPT, Shopee, VNG, Techcombank, Tiki, VNPAY,...).

### 1.2. Chân dung Người dùng (User Personas)
- **Sinh viên Năm 1**: Cần làm quen môi trường đại học, khám phá sở thích, định hình ngành học và tích lũy điểm rèn luyện qua sự kiện.
- **Sinh viên Năm 2**: Học môn cơ sở ngành, cần xác định chuyên ngành hẹp/thiên hướng nghề nghiệp để lên kế hoạch học tập.
- **Sinh viên Năm 3**: Giai đoạn bản lề; cần bù đắp khoảng cách kỹ năng (Skill Gap), thực hành công cụ thực tế, xây dựng CV và tìm kiếm vị trí thực tập doanh nghiệp (Internship/Trainee).
- **Sinh viên Năm 4 / Mới tốt nghiệp**: Hoàn thiện đồ án tốt nghiệp, ứng tuyển việc làm chính thức (Fresher/Junior), tối ưu CV vượt qua hệ thống quét lọc ATS.
- **Ban Cố vấn / Quản trị viên (Admin/Advisor)**: Theo dõi xu hướng lựa chọn nghề nghiệp, phân tích khoảng cách kỹ năng tập hợp để điều chỉnh workshop và cầu nối doanh nghiệp.

---

## 2. HỆ THỐNG ĐÀO TẠO & KHÓA HỌC SINH VIÊN PTIT

### 2.1. Quy tắc Tính Niên khóa Tự động (Academic Batch Logic)
Năm học đại học bắt đầu vào **tháng 8 hàng năm** (`academicStartYear`). Công thức xác định niên khóa:
$$\text{EntryYear} = \text{AcademicStartYear} - (\text{YearNum} - 1)$$
- **Năm 4**: Khóa D + (2 số cuối của `academicStartYear - 3`) (VD năm học 2026: Khóa D23 - Nhập học 2023).
- **Năm 3**: Khóa D + (2 số cuối của `academicStartYear - 2`) (VD năm học 2026: Khóa D24 - Nhập học 2024).
- **Năm 2**: Khóa D + (2 số cuối của `academicStartYear - 1`) (VD năm học 2026: Khóa D25 - Nhập học 2025).
- **Năm 1**: Khóa D + (2 số cuối của `academicStartYear`) (VD năm học 2026: Khóa D26 - Nhập học 2026).

### 2.2. Danh mục Ngành học Chính quy liên kết trong Hệ thống
1. **Marketing & Truyền thông số**: Trọng tâm Marketing số, Sáng tạo nội dung, Hành vi khách hàng số, Quảng cáo trực tuyến.
2. **Truyền thông đa phương tiện**: Thiết kế hình ảnh, sản xuất video, kịch bản truyền thông, quản trị mạng xã hội.
3. **Thương mại điện tử**: Vận hành gian hàng sàn (Shopee, TikTok Shop, Lazada), tối ưu chuỗi cung ứng số, thanh toán điện tử.
4. **Kinh tế số & Quản trị kinh doanh**: Mô hình kinh doanh số, đàm phán thương mại B2B, quản trị dự án, khởi nghiệp công nghệ.
5. **Công nghệ thông tin / Kỹ thuật Phần mềm**: Lập trình Fullstack, ứng dụng di động, giải thuật, kiến trúc hệ thống.
6. **Khoa học Dữ liệu & Trí tuệ Nhân tạo**: Phân tích dữ liệu, Machine Learning, Business Intelligence (BI), SQL & Python.
7. **Công nghệ Tài chính (Fintech) & Kế toán**: Phân tích dữ liệu tài chính, thanh toán số, ngân hàng số.

---

## 3. BỘ CÔNG CỤ TRẮC NGHIỆM ĐÁNH GIÁ NGHỀ NGHIỆP (ASSESSMENT)

### 3.1. Bộ Câu hỏi Career Check Nhanh (10 Câu hỏi Chuẩn hóa)

Mỗi câu hỏi đo lường thiên hướng hành vi thực tế trong công việc học tập và dự án. 4 phương án tương ứng chuẩn xác với 4 mã thiên hướng:
- **Lựa chọn A** $\rightarrow$ **CR** (*Creative & Innovation*)
- **Lựa chọn B** $\rightarrow$ **AN** (*Analytical & Optimization*)
- **Lựa chọn C** $\rightarrow$ **OP** (*Planning & Operations*)
- **Lựa chọn D** $\rightarrow$ **CO** (*Communication & Business*)

| Câu | Nội dung câu hỏi | Lựa chọn A (CR) | Lựa chọn B (AN) | Lựa chọn C (OP) | Lựa chọn D (CO) |
|---|---|---|---|---|---|
| **1** | Nếu được giao một dự án mới, phần việc nào bạn muốn nhận nhất? | Nghĩ ý tưởng và hướng tiếp cận mới | Tìm hiểu thông tin, dữ liệu và vấn đề | Lập kế hoạch và phân chia công việc | Làm việc với khách hàng, đối tác hoặc thành viên nhóm |
| **2** | Hoạt động nào khiến bạn dễ duy trì sự tập trung trong thời gian dài nhất? | Sáng tạo nội dung, ý tưởng hoặc sản phẩm | Phân tích số liệu, báo cáo hoặc thông tin | Theo dõi tiến độ và xử lý các đầu việc | Trao đổi, thuyết phục hoặc xây dựng quan hệ |
| **3** | Khi gặp một vấn đề chưa có cách giải quyết rõ ràng, bạn thường làm gì trước? | Thử nghĩ ra một cách tiếp cận khác | Tìm dữ liệu và phân tích nguyên nhân | Xác định các bước cần làm và sắp xếp thứ tự | Hỏi ý kiến những người liên quan để hiểu vấn đề |
| **4** | Nếu phải chọn một loại kết quả để tạo ra, bạn thấy mình hứng thú nhất với kết quả nào? | Một ý tưởng/sản phẩm mới và khác biệt | Một kết luận dựa trên dữ liệu và bằng chứng | Một kế hoạch được triển khai đúng mục tiêu | Một thỏa thuận hoặc mối quan hệ mang lại kết quả |
| **5** | Trong một nhóm làm việc, bạn thường tự nhiên đảm nhận vai trò nào? | Người đưa ra ý tưởng và hướng mới | Người kiểm tra thông tin và đánh giá phương án | Người phân công, theo dõi và thúc đẩy tiến độ | Người kết nối, trình bày và làm việc với các bên |
| **6** | Điều gì khiến bạn cảm thấy công việc của mình ‘làm tốt’? | Tạo ra điều mới mẻ và có giá trị | Đưa ra quyết định chính xác, có cơ sở | Hoàn thành mục tiêu đúng kế hoạch | Đạt được sự đồng thuận hoặc phản hồi tích cực từ người khác |
| **7** | Nếu tham gia một cuộc thi kinh doanh, bạn muốn phụ trách phần nào nhất? | Xây dựng concept và ý tưởng sản phẩm/chiến dịch | Nghiên cứu thị trường và phân tích dữ liệu | Lập kế hoạch triển khai và quản lý ngân sách/tiến độ | Pitching, thuyết phục giám khảo/đối tác và phát triển quan hệ |
| **8** | Bạn thích môi trường làm việc nào nhất? | Nơi khuyến khích thử nghiệm và đưa ra ý tưởng mới | Nơi coi trọng dữ liệu, logic và bằng chứng | Nơi có mục tiêu, quy trình và trách nhiệm rõ ràng | Nơi có nhiều tương tác, khách hàng và cơ hội thương lượng |
| **9** | Khi phải học một kỹ năng mới phục vụ công việc, cách nào khiến bạn thấy hứng thú nhất? | Tự thử nghiệm và biến nó thành cách làm của riêng mình | Tìm hiểu nguyên lý, số liệu và cách hoạt động | Học theo quy trình rồi áp dụng từng bước | Học thông qua trao đổi, thực hành với người khác |
| **10** | Nếu công việc tương lai chỉ cho phép bạn dành phần lớn thời gian cho một hoạt động, bạn sẽ chọn gì? | Phát triển ý tưởng và tạo ra cái mới | Phân tích, đánh giá và tối ưu hiệu quả | Quản lý công việc, nguồn lực và tiến độ | Giao tiếp, đàm phán và phát triển khách hàng/đối tác |

---

### 3.2. Mô hình 4 Thiên hướng Nghề nghiệp (Career Tendencies)

#### 1. CR — Sáng tạo & Đổi mới (Creative & Innovation)
- **Đặc trưng**: Trực giác nhạy bén với cái mới, tư duy ý tưởng đột phá, khả năng kể chuyện (Storytelling), thích thử nghiệm các định dạng nội dung mới.
- **Điểm mạnh cốt lõi**: Khả năng tạo ra các chiến dịch viral, bắt trend nhanh, thiết kế thông điệp chạm đến cảm xúc người tiêu dùng.
- **Môi trường phù hợp**: Creative Agency, phòng Sáng tạo nội dung, Studio truyền thông, Startup sản phẩm mới.

#### 2. AN — Phân tích & Tối ưu (Analytical & Optimization)
- **Đặc trưng**: Tư duy logic, đề cao số liệu định lượng, hoài nghi khoa học, đưa ra quyết định dựa trên bằng chứng và số liệu thống kê.
- **Điểm mạnh cốt lõi**: Đọc hiểu phễu chuyển đổi (Funnel), tối ưu chi phí quảng cáo (CPA, CPC, ROAS), phát hiện điểm nghẽn của sản phẩm qua dữ liệu.
- **Môi trường phù hợp**: Performance Agency, phòng Dữ liệu (BI/Data Analytics), Tech Product Company, Ngân hàng/Fintech.

#### 3. OP — Lập kế hoạch & Vận hành (Planning & Operations)
- **Đặc trưng**: Tư duy cấu trúc, tính kỷ luật cao, tỉ mỉ với deadline, kiểm soát ngân sách và tối ưu hóa các bước thực thi dự án.
- **Điểm mạnh cốt lõi**: Đảm bảo dự án hoàn thành đúng tiến độ, quản trị rủi ro, phân bổ công việc công bằng và chuẩn hóa quy trình SOP.
- **Môi trường phù hợp**: Doanh nghiệp E-commerce, phòng Vận hành (Operations), Quản lý dự án (Project Management Office), Logistics/Chuỗi cung ứng.

#### 4. CO — Giao tiếp & Kinh doanh (Communication & Business)
- **Đặc trưng**: Khả năng thấu cảm con người, kỹ năng lắng nghe và thuyết phục xuất sắc, năng nổ trong việc kết nối mạng lưới quan hệ (Networking).
- **Điểm mạnh cốt lõi**: Đàm phán hợp đồng thương mại, giải quyết xung đột, tư vấn khách hàng lớn (B2B), xây dựng quan hệ đối tác chiến lược.
- **Môi trường phù hợp**: Phát triển kinh doanh (Business Development), Account Management, Quan hệ đối ngoại & Báo chí (PR), Quản trị nhân sự (HR).

---

### 3.3. Quy tắc Tính điểm & Xử lý Đồng điểm (Tie-breaking Rules)

1. **Tổng điểm thô**: Mỗi câu trả lời đóng góp 1 điểm vào mã thiên hướng tương ứng:
   $$\text{Score}(X) \in [0, 10], \quad \sum \text{Score} = 10$$
2. **Tỷ lệ phần trăm**:
   $$\text{Percentage}(X) = \frac{\text{Score}(X)}{10} \times 100\%$$
3. **Quy tắc phân định khi bằng điểm (Deterministic Tie-breaking Priority)**:
   Để đảm bảo kết quả hướng nghiệp luôn ổn định, có tính tái lập và không phụ thuộc vào yếu tố ngẫu nhiên, khi có từ hai nhóm điểm bằng nhau, hệ thống ưu tiên tuyệt đối theo thứ tự:
   $$\mathbf{CR} > \mathbf{AN} > \mathbf{OP} > \mathbf{CO}$$
   *(Trọng số ưu tiên: $\text{Priority}_{\text{CR}}=4, \text{Priority}_{\text{AN}}=3, \text{Priority}_{\text{OP}}=2, \text{Priority}_{\text{CO}}=1$)*.

---

### 3.4. Ma trận Kết hợp Thiên hướng (Top 2 Combos) & Bản đồ Nghề nghiệp

Hệ thống kết hợp 2 thiên hướng dẫn đầu của sinh viên để đưa ra hướng nghề nghiệp tối ưu:

| Cặp Thiên hướng | Chức danh Mục tiêu Chính (Primary Career) | Vị trí Khởi đầu (Starting Roles) | Kỹ năng Cốt lõi Cần trang bị | Các Hướng Mở rộng (Secondary Careers) |
|---|---|---|---|---|
| **AN + CR** *(hoặc CR + AN)* | **Performance Marketing Specialist** *(IT: Product Growth / Data Tech)* | Performance Marketing Intern, Digital Marketing Executive, Growth Trainee | Meta Ads, Google Ads, GA4 & CRO, A/B Testing, Excel/Data Reporting | - Marketing Analytics Specialist<br>- Growth Marketing Executive |
| **CO + CR** *(hoặc CR + CO)* | **Content & Brand Marketing Specialist** | Content Marketing Intern, Creative Executive, Social Media Trainee | Content Strategy, Storytelling, Social Media Management, Canva/Visual Thinking, Copywriting | - Account Executive (Agency)<br>- PR & Communications Officer |
| **AN + OP** *(hoặc OP + AN)* | **Business Analyst & Operations Specialist** *(IT: IT Business Analyst)* | Business Analyst Intern, Operations Coordinator, Data & Process Associate | BPMN/Quy trình, SQL & Excel, Phân tích yêu cầu, Quản lý dự án Agile/Jira | - Operations Analyst (E-commerce)<br>- Project Management Specialist |
| **AN + CO** *(hoặc CO + AN)* | **Market Research & Customer Insights Specialist** | Market Research Intern, Consumer Insight Trainee, Strategic Planner Assistant | Khảo sát & Phỏng vấn sâu, Phân tích SPSS/Excel, Viết báo cáo Insight, Thuyết trình dữ liệu | - B2B Business Development Specialist<br>- Management/Strategy Consultant |
| **CO + OP** *(hoặc OP + CO)* | **Project Coordinator & Account Specialist** | Project Coordinator Intern, Account Executive, Event Operations Associate | Giao tiếp liên phòng ban, Lập kế hoạch tiến độ, Quản lý ngân sách, Chăm sóc khách hàng | - HR & Talent Acquisition Specialist<br>- Event Management Specialist |
| **CR + OP** *(hoặc OP + CR)* | **Campaign & Creative Project Manager** | Campaign Coordinator Intern, Creative Planner Assistant, Product Marketing Intern | Lập kế hoạch chiến dịch, Quản lý Designer/Copywriter, Dự trù ngân sách, Đánh giá KPI | - Product Marketing Executive (PMM)<br>- Event & Experience Designer |

---

### 3.5. Bộ Câu hỏi Đánh giá Chuyên sâu (Comprehensive 32-Question Assessment)

Hệ thống cung cấp bài kiểm tra 32 câu chia thành 3 phần nhằm chấm điểm độ phù hợp chi tiết với các chuyên ngành hẹp:

- **Phần 1: Giới thiệu bản thân & Nền tảng học tập (Câu 1 - 8)**:
  - Ngành học hiện tại tại PTIT.
  - Năm học hiện tại (Năm 1 đến Năm 4/Đã tốt nghiệp).
  - Môn học mang lại nhiều cảm hứng nhất (Hành vi người tiêu dùng, Lập trình giải thuật, Thống kê dữ liệu, Thiết kế đa phương tiện, Quản trị đàm phán).
  - Hoạt động giải trí tự nhiên (Xem video/bắt trend, lập trình thử nghiệm, đọc dữ liệu tài chính, vẽ đồ họa, giao lưu kết nối).
  - Kỹ năng tự tin nhất (Viết lách, Tư duy kỹ thuật, Xử lý số liệu Excel, Công cụ Canva/Figma, Điều phối sự kiện).
  - Kinh nghiệm ban câu lạc bộ sinh viên (Truyền thông, Kỹ thuật, Đối ngoại tài trợ, Nhân sự, Hậu cần tổ chức).
  - Mức độ tự tin với tiếng Anh trong công việc.
  - Mục tiêu trước mắt trong 6 tháng tới (Khám phá bản thân, Tích lũy kỹ năng, Hoàn thiện CV, Tìm kiếm thực tập).

- **Phần 2: Sở thích nghề nghiệp & Thiên hướng hành vi (Câu 9 - 20)**:
  - Phản ứng khi gặp một đề bài không có khuôn mẫu hướng dẫn.
  - Cách tiếp cận tài liệu chuyên môn dài và phức tạp.
  - Sở thích tương tác: Độc lập nghiên cứu sâu vs. Làm việc nhóm thảo luận liên tục.
  - Khả năng chịu áp lực thời gian (Deadline khắt khe) và môi trường biến đổi nhanh.
  - Hứng thú giữa việc sáng tạo ý tưởng mới vs. Tinh chỉnh quy trình đã có để đạt hiệu suất cao hơn.
  - Động lực thúc đẩy công việc: Sự công nhận của xã hội, Thu nhập tài chính, Tự do sáng tạo hay Tính ổn định bền vững.

- **Phần 3: Mục tiêu phát triển & Môi trường làm việc mong muốn (Câu 21 - 32)**:
  - Loại hình doanh nghiệp mong muốn (Tập đoàn lớn nhà nước/viễn thông, Công ty đa quốc gia FMCG/Tech, Startup tăng trưởng nhanh, Agency chuyên sâu).
  - Mức độ sẵn sàng làm việc ngoài giờ khi có chiến dịch quan trọng.
  - Định hướng phát triển cá nhân: Chuyên gia sâu (Individual Contributor/Specialist) vs. Quản lý điều hành (People Manager).
  - Tầm nhìn 3 năm sau tốt nghiệp: Đạt vị trí Senior/Lead trong lĩnh vực nào.

---

## 4. KHUNG PHÂN TÍCH KHOẢNG CÁCH KỸ NĂNG (SKILL GAP MATRIX)

Mỗi vị trí công việc mục tiêu được đối chiếu với ma trận năng lực gồm 3 nhóm kỹ năng:
1. **Domain Skills (Kiến thức chuyên môn & Nghiệp vụ ngành)**.
2. **Technical Skills (Công cụ, Nền tảng kỹ thuật & Dữ liệu)**.
3. **Soft Skills (Kỹ năng mềm, Quản trị bản thân & Giao tiếp)**.

### 4.1. Vị trí: Performance Marketing Specialist
- **Điểm tương thích nền tảng**: 75% – 92% (tùy kết quả kiểm tra và năm học).
- **Điểm mạnh ghi nhận (Strengths)**:
  - Tư duy số liệu & đo lường chuyển đổi định lượng.
  - Sáng tạo thông điệp quảng cáo (Ad Copywriting) trên mạng xã hội.
  - Tư duy thử nghiệm A/B Testing.
- **Kỹ năng đã có (Matched Skills)**:
  - Nền tảng Marketing căn bản (học phần PTIT).
  - Viết Copywriting cho Social Ads.
  - Sử dụng Canva & công cụ thiết kế cơ bản.
  - Phân tích phễu khách hàng trực tuyến.
- **Kỹ năng còn thiếu trọng yếu (Critical Missing Skills)**:
  - Kỹ thuật thiết lập & tối ưu Meta Ads Manager / TikTok Ads nâng cao.
  - Đọc hiểu chuyên sâu Google Analytics 4 (GA4) và thiết lập Event Tracking.
  - Tối ưu hóa tỷ lệ chuyển đổi Landing Page (CRO).
  - Phân bổ ngân sách chiến dịch theo mô hình Attribution Model.
- **Khuyến nghị hành động**:
  - Học chứng chỉ Google Analytics 4 Certification miễn phí trên Google Skillshop.
  - Thực hành chạy chiến dịch ngân sách nhỏ (300.000 – 500.000 VNĐ) cho sự kiện câu lạc bộ hoặc đồ án môn học.

### 4.2. Vị trí: Content & Brand Marketing Specialist
- **Điểm tương thích nền tảng**: 78% – 94%.
- **Điểm mạnh ghi nhận (Strengths)**:
  - Kể chuyện thương hiệu (Storytelling) & cảm quan ngôn từ tinh tế.
  - Nắm bắt nhanh nhạy xu hướng truyền thông mạng xã hội (Trend Jacking).
  - Tư duy thẩm mỹ và đóng gói nhận diện thông điệp.
- **Kỹ năng đã có (Matched Skills)**:
  - Sáng tạo nội dung đa nền tảng (Facebook, TikTok, Blog).
  - Bắt trend mạng xã hội thời gian thực.
  - Thiết kế đồ họa và biên tập video ngắn cơ bản (Canva, CapCut).
  - Nghiên cứu thị hiếu thế hệ trẻ (Gen Z).
- **Kỹ năng còn thiếu trọng yếu (Critical Missing Skills)**:
  - Lập kế hoạch truyền thông tích hợp tổng thể (Integrated Marketing Communications - IMC Plan).
  - Đo lường chỉ số sức khỏe thương hiệu (Brand Sentiment, Share of Voice - SOV).
  - Quản trị ngân sách sản xuất nội dung và làm việc với KOLs/KOCs/Agency.
- **Khuyến nghị hành động**:
  - Xây dựng 1 trang Portfolio trực tuyến tổng hợp các bài viết và chiến dịch đã sản xuất.
  - Nghiên cứu các Case Study chiến dịch truyền thông đạt giải thưởng MMA Smarties hoặc BSI Awards.

### 4.3. Vị trí: Business Analyst & Data Analyst
- **Điểm tương thích nền tảng**: 70% – 88%.
- **Điểm mạnh ghi nhận (Strengths)**:
  - Tư duy phân tích logic vấn đề có cấu trúc.
  - Đọc hiểu báo cáo định lượng và bảng tính Excel.
  - Khả năng chuyển hóa dữ liệu thành biểu đồ trực quan.
- **Kỹ năng đã có (Matched Skills)**:
  - Excel nâng cao (VLOOKUP, INDEX-MATCH, Pivot Table).
  - Tư duy xác suất thống kê cơ sở.
  - Trình bày giải pháp bằng slide trực quan.
- **Kỹ năng còn thiếu trọng yếu (Critical Missing Skills)**:
  - Viết truy vấn SQL trên cơ sở dữ liệu quan hệ (PostgreSQL, MySQL).
  - Xây dựng Dashboard báo cáo tự động trên Power BI hoặc Google Looker Studio.
  - Mô hình hóa quy trình nghiệp vụ theo chuẩn BPMN 2.0.

---

## 5. LỘ TRÌNH PHÁT TRIỂN NGHỀ NGHIỆP THEO CẤP ĐỘ CHUẨN HÓA

Lộ trình được thiết kế chuẩn mực thành **5 Cấp độ tiến trình (5 Standardized Stages)**, giúp sinh viên từng bước phát triển từ tân sinh viên đến ứng viên sẵn sàng nhận việc:

```
[Cấp độ 1: Nền tảng] ➔ [Cấp độ 2: Thực thi] ➔ [Cấp độ 3: Hiệu suất] ➔ [Cấp độ 4: Chuyên nghiệp] ➔ [Cấp độ 5: Sẵn sàng nghề nghiệp]
```

### Chi tiết 5 Cấp độ Lộ trình:

| Cấp độ | Tên Cấp độ | Mục tiêu Trọng tâm | Các Học phần / Module Kỹ năng Cốt lõi | Sản phẩm Đầu ra Yêu cầu |
|---|---|---|---|---|
| **Cấp độ 1** | **Nền tảng** *(Foundation)* | Nắm vững các khái niệm cốt lõi về thị trường số và tâm lý người tiêu dùng. | 1. **Marketing Fundamentals**: Khung 4P/7P, phân khúc STP.<br>2. **Viết Content**: Cấu trúc bài viết chuẩn truyền thông.<br>3. **Hành vi người tiêu dùng**: Thấu hiểu Insight và Customer Journey. | Đạt điểm A các môn đại cương; viết được bài phân tích khách hàng mục tiêu. |
| **Cấp độ 2** | **Thực thi** *(Execution)* | Làm chủ các kênh phân phối trực tiếp và kỹ thuật sản xuất nội dung đa kênh. | 4. **Social Media**: Quản trị trang cộng đồng, lịch đăng bài.<br>5. **Content Planning**: Xây dựng kế hoạch nội dung tháng.<br>6. **Canva & Visual**: Thiết kế ấn phẩm theo Brand Guideline.<br>7. **SEO cơ bản**: Nghiên cứu từ khóa, tối ưu On-page. | Bộ ấn phẩm truyền thông thực tế cho sự kiện hoặc Fanpage câu lạc bộ. |
| **Cấp độ 3** | **Hiệu suất** *(Performance)* | Tối ưu hóa các chiến dịch quảng cáo trả phí và phân tích chỉ số chuyển đổi. | 8. **Meta Ads**: Thiết lập đối tượng, Pixel, tối ưu ngân sách.<br>9. **Google Analytics (GA4)**: Đọc hiểu phễu và chỉ số tương tác.<br>10. **Copywriting**: Viết lời kêu gọi hành động (CTA) chuyển đổi cao. | Báo cáo hiệu quả chiến dịch thực tế có đo lường CPC, CTR, CVR. |
| **Cấp độ 4** | **Chuyên nghiệp** *(Professional)* | Lập kế hoạch chiến dịch tổng thể và xây dựng hồ sơ năng lực thực tế. | 11. **Campaign Planning**: Bản kế hoạch IMC đa kênh hoàn chỉnh.<br>12. **Data Analysis**: Phân tích dữ liệu kinh doanh & đề xuất cải tiến.<br>13. **Portfolio**: Đóng gói các dự án tiêu biểu thành trang năng lực. | Trang Portfolio cá nhân hoàn chỉnh (Notion/PDF/Web). |
| **Cấp độ 5** | **Sẵn sàng nghề nghiệp** *(Career Ready)* | Tối ưu hóa hồ sơ ứng tuyển, hoàn thiện CV và sẵn sàng phỏng vấn doanh nghiệp. | 14. **Internship**: Tham gia kỳ thực tập doanh nghiệp chính thức.<br>15. **CV Optimization**: Tối ưu CV theo chuẩn ATS khớp từng JD.<br>16. **Interview Skills**: Thực hành phỏng vấn chuyên môn và phỏng vấn tình huống (STAR). | Nhận lời mời làm việc (Offer Letter) từ doanh nghiệp đối tác. |

---

## 6. HỆ THỐNG DỮ LIỆU VIỆC LÀM & THUẬT TOÁN ĐỐI KHỚP (JOB MATCHING ENGINE)

### 6.1. Thuật toán Tính Điểm Tương Thích (Job Match Scoring Algorithm)

Thuật toán tính điểm được chuẩn hóa trên thang điểm **100%** dựa trên 5 yếu tố trọng số (Weights):

$$\text{MatchScore} = W_{\text{Major}} + W_{\text{Goal}} + W_{\text{Tendency}} + W_{\text{Skills}} + W_{\text{Year}}$$

#### Bảng Trọng số & Quy tắc Chấm điểm Chi tiết:

| Yếu tố | Trọng số | Quy tắc Tính điểm & Điều kiện Thỏa mãn |
|---|---|---|
| **1. Ngành học (Major Match)** | **30%** | - Khớp trực tiếp chuyên ngành: **100% điểm trọng số (30/30)**.<br>- Khớp khối ngành liên quan (Kinh tế, Thương mại số, Truyền thông): **80% điểm trọng số (24/30)**.<br>- Ngành khác: **30% điểm trọng số (9/30)**. |
| **2. Mục tiêu nghề nghiệp (Career Goal)** | **20%** | - Khớp chính xác với chức danh hoặc danh mục công việc mục tiêu: **100% (20/20)**.<br>- Ví dụ mục tiêu *Performance Marketing*: Ưu tiên các JD chứa *Performance, Digital Marketing, Growth, Marketing Analytics, User Acquisition*.<br>- Người dùng chưa chọn mục tiêu cụ thể: Nhận điểm trung tính **70% (14/20)**. |
| **3. Thiên hướng Career Check (Tendencies)** | **25%** | So khớp Top 3 thiên hướng của sinh viên với thẻ thiên hướng của JD (`CR`, `AN`, `OP`, `CO`):<br>- Khớp thiên hướng Top 1: Tính hệ số **1.5**.<br>- Khớp thiên hướng Top 2: Tính hệ số **1.0**.<br>- Khớp thiên hướng Top 3: Tính hệ số **0.5**.<br>- Tỷ lệ hoàn thành: $\text{Min}(1, \text{Sum} / 2.0) \times 25\%$.<br>- Chưa làm Career Check: Nhận mặc định **60% (15/25)**. |
| **4. Kỹ năng đối khớp (Skill Tags)** | **15%** | - So khớp giữa danh sách kỹ năng đã có trong hồ sơ sinh viên với danh mục `skillTags` của JD.<br>- Tỷ lệ: $\text{Min}(1, \text{MatchedCount} / (0.5 \times \text{TotalRequired})) \times 15\%$. Điểm sàn tối thiểu nếu có khớp: $9/15$. |
| **5. Năm học phù hợp (Academic Year)** | **10%** | - Năm học của sinh viên nằm trong danh sách `suitableAcademicYears` của JD: **100% (10/10)**.<br>- Không khớp chính xác năm học: **40% (4/10)**. |

- **Chuẩn hóa Điểm số Cuối cùng**: Điểm thô được chuẩn hóa nằm trong khoảng an toàn và có ý nghĩa khích lệ:
  $$\text{NormalizedScore} = \text{Clamp}(\text{RawScore}, 65\%, 96\%)$$
- **Quy tắc giải thích lý do**: Hệ thống tự động tạo chuỗi giải thích nhân văn:
  *Ví dụ: "Được đề xuất dựa trên hồ sơ của bạn: phù hợp ngành Marketing & Truyền thông số + mục tiêu Digital Marketing + xu hướng CR + AN."*

---

### 6.2. Cơ sở Dữ liệu Việc làm Doanh nghiệp Đối tác

| Mã JD | Tiêu đề Công việc | Doanh nghiệp & Quy mô | Địa điểm | Mức Lương / Phụ cấp | Đối tượng Sinh viên | Kỹ năng Bắt buộc (Required Skills) | Thiên hướng |
|---|---|---|---|---|---|---|---|
| **real-job-viettel-mkt-01** | Digital Marketing & Communications Trainee | **Tổng Công ty Viễn thông Viettel** *(>10.000 NV)* | Hà Nội (Giang Văn Minh, Ba Đình) | 5.000.000 – 7.000.000 VNĐ/tháng | Năm 3, 4, Mới tốt nghiệp | Digital Marketing, Content Strategy, Social Media, Google Analytics, A/B Testing | CR, AN |
| **real-job-fpt-social-02** | Thực tập sinh Marketing & Social Media | **Công ty Cổ phần Viễn thông FPT (FPT Telecom)** | Hà Nội (Duy Tân, Cầu Giấy) | 3.500.000 – 5.500.000 VNĐ/tháng + thưởng KPI | Năm 2, 3, 4 | Social Media, Copywriting, Canva, Video Editing, Content Planning | CR, CO |
| **real-job-shopee-mkt-ops-03** | Marketing Operations & Campaign Executive | **Shopee Vietnam (Sea Group)** | Hà Nội (Lotte Center, Ba Đình) | 10.000.000 – 14.000.000 VNĐ/tháng | Năm 4, Mới tốt nghiệp | E-commerce Campaign, Data Tracking, Excel Advanced, Cross-team Coordination | OP, AN |
| **real-job-vnpt-data-04** | Junior Business Intelligence & Data Analyst | **Tập đoàn Bưu chính Viễn thông VNPT (VNPT IT)** | Hà Nội (Nguyễn Du, Hai Bà Trưng) | 12.000.000 – 16.000.000 VNĐ/tháng | Năm 4, Đã tốt nghiệp | SQL, Power BI, Python, Data Modeling, Data Analysis | AN, OP |
| **real-job-vnpay-bd-05** | Business Development Associate - FinTech Solutions | **Công ty Cổ phần Giải pháp Thanh toán Việt Nam (VNPAY)** | Hà Nội (Trần Thái Tông, Cầu Giấy) | 8.000.000 – 12.000.000 VNĐ/tháng + hoa hồng | Năm 3, 4, Mới tốt nghiệp | B2B Sales, Fintech Understanding, Negotiation, Client Relationship | CO, OP |
| **real-job-tiki-ops-06** | E-commerce Operations Trainee | **Tiki Corporation** | TP. Hồ Chí Minh (Tân Bình) | 5.000.000 – 6.500.000 VNĐ/tháng | Năm 3, 4 | Order Management, Inventory Tracking, Excel, Problem Solving | OP, AN |
| **job-1** | Marketing Intern (Thực tập sinh Marketing) | **ABC Consumer Goods Ltd. (FMCG)** | Hà Nội (Keangnam Landmark 72) | 3.000.000 – 5.000.000 VNĐ/tháng | Năm 2, 3, 4 | Content Creation, Social Media Management, Canva | CR, CO |
| **job-3** | Junior Performance Marketer | **VNG Corporation** | TP. Hồ Chí Minh (VNG Campus, Quận 7) | 12.000.000 – 16.000.000 VNĐ/tháng | Năm 4, Mới tốt nghiệp | Meta Ads, Google Ads, GA4, Funnel Optimization, ROAS Tracking | AN, CR |
| **job-5** | Chuyên viên Phân tích Dữ liệu Kinh doanh (Data Analyst) | **Ngân hàng TMCP Kỹ thương Việt Nam (Techcombank)** | Hà Nội (Techcombank Tower, Hoàn Kiếm) | 15.000.000 – 22.000.000 VNĐ/tháng | Năm cuối, Đã tốt nghiệp | SQL, Python, Power BI, Data Warehousing, Banking Insights | AN, OP |
| **job-6** | AI Application Developer Fresher | **FPT Software AI Center** | Hà Nội (Khu CNC Hòa Lạc) | 10.000.000 – 15.000.000 VNĐ/tháng | Năm 4, Mới tốt nghiệp | Python, LLM Prompting, API Integration, Git, Computer Science | AN, CR |

---

## 7. HỆ TRI THỨC TỐI ƯU HÓA CV THEO CHUẨN ATS (AI CV OPTIMIZATION)

### 7.1. Nguyên tắc Cốt lõi của AI CV Optimizer
1. **Không bịa đặt kinh nghiệm**: AI tuyệt đối không tự bịa đặt tên công ty, chức vụ hoặc bằng cấp người dùng chưa trải qua.
2. **Đối chiếu đa chiều (Multi-signal Grounding)**: CV được đối chiếu đồng thời với:
   - *Yêu cầu công việc mục tiêu (Target JD)*: Chức danh, kỹ năng bắt buộc, mô tả trách nhiệm.
   - *Hồ sơ sinh viên PTIT*: Chuyên ngành chính quy, niên khóa, điểm thiên hướng Career Check ($CR, AN, OP, CO$).
3. **Công thức đạn điểm chuẩn số liệu (Google XYZ Formula)**:
   $$\text{"Accomplished [X], as measured by [Y], by doing [Z]"}$$
   *(Đạt được thành tựu [X], được đo lường bằng chỉ số định lượng [Y], thông qua hành động cụ thể [Z]).*

---

### 7.2. Bảng Tiêu chuẩn Đánh giá Vượt qua Máy quét ATS (ATS Checklist)

| Tiêu chí | Trạng thái Đạt | Rủi ro Vi phạm & Lời khuyên Điều chỉnh |
|---|---|---|
| **Định dạng tệp tin & Bóc tách văn bản (Parsability)** | Tệp `.pdf` hoặc `.docx` xuất từ văn bản gốc, dung lượng $< 10\text{MB}$. | **Cảnh báo**: Xuất tệp dạng ảnh chụp (JPEG/PNG) hoặc PDF scan khiến hệ thống OCR của ATS không đọc được từ khóa. |
| **Cấu trúc phân mục chuẩn (Header Structure)** | Phân định rõ ràng: *Thông tin liên hệ, Mục tiêu nghề nghiệp, Học vấn PTIT, Kinh nghiệm & Dự án thực tế, Kỹ năng chuyên môn, Hoạt động & Chứng chỉ*. | **Cảnh báo**: Dùng tiêu đề sáng tạo quá đà (VD: "Tôi là ai", "Hành trình") làm hệ thống ATS bỏ qua phân mục. |
| **Mật độ từ khóa chuẩn khớp với JD** | Độ phủ từ khóa đạt $\ge 80\%$ các từ khóa bắt buộc trong JD. | **Cảnh báo**: Thiếu các thuật ngữ chuyên ngành (VD: GA4, SEO On-page, CTR, CVR, A/B Testing). |
| **Độ dài & Định dạng trang** | Trọn vẹn trong **1 trang A4** đối với sinh viên và ứng viên dưới 3 năm kinh nghiệm. | **Cảnh báo**: CV dài 2-3 trang chứa nhiều thông tin lan man không liên quan đến vị trí ứng tuyển. |

---

### 7.3. Mẫu Chuyển đổi Câu mô tả Kinh nghiệm từ "Yếu" sang "Chuẩn Số liệu"

#### Mẫu 1: Nhóm Sáng tạo & Nội dung (Thiên hướng CR)
- ❌ **Câu cũ thường viết (Yếu)**: *"Tham gia viết bài cho fanpage câu lạc bộ và chạy quảng cáo Facebook."*
  - *Nhược điểm*: Câu mô tả quá ngắn, không có bối cảnh, hoàn toàn không có chỉ số KPI định lượng.
- ✅ **AI Đề xuất viết lại (Chuẩn XYZ)**:
  - *"Sản xuất 15+ bài viết chuẩn thông điệp thương hiệu trên Fanpage câu lạc bộ PTIT; tối ưu chi phí quảng cáo Facebook Ads giúp giảm chi phí mỗi lượt tiếp cận (CPR) xuống 28%, thu hút hơn 3.200 lượt tương tác sinh viên."*
  - *Chỉ số tạo ra*: **+3.200 lượt tương tác, giảm CPR 28%**.

#### Mẫu 2: Nhóm Phân tích & Tối ưu (Thiên hướng AN)
- ❌ **Câu cũ thường viết (Yếu)**: *"Có khả năng phân tích số liệu và làm báo cáo tuần cho quản lý."*
  - *Nhược điểm*: Diễn đạt tự nhận xét cảm tính, thụ động, không nêu rõ công cụ và tác động kinh doanh.
- ✅ **AI Đề xuất viết lại (Chuẩn XYZ)**:
  - *"Thiết lập báo cáo hiệu suất tuần trên Google Sheets & Looker Studio theo dõi các chỉ số CTR, CVR và CPA; phát hiện điểm nghẽn chuyển đổi và đề xuất cải tiến nội dung landing page nâng tỷ lệ đăng ký lên 18%."*
  - *Chỉ số tạo ra*: **Tăng tỷ lệ chuyển đổi +18%, theo dõi tự động 3 chỉ số**.

#### Mẫu 3: Nhóm Vận hành & Dự án (Thiên hướng OP)
- ❌ **Câu cũ thường viết (Yếu)**: *"Hỗ trợ tổ chức sự kiện chào tân sinh viên và giải quyết các vấn đề phát sinh."*
  - *Nhược điểm*: Dùng từ "Hỗ trợ" làm giảm tính chủ động và vai trò thực tế của bản thân trong dự án.
- ✅ **AI Đề xuất viết lại (Chuẩn XYZ)**:
  - *"Điều phối tiến độ truyền thông sự kiện chào tân sinh viên quy mô 800+ người; phối hợp liên nhóm thiết kế - nội dung - hậu cần đảm bảo 100% ấn phẩm ra mắt đúng hạn và không vượt ngân sách dự trù."*
  - *Chỉ số tạo ra*: **Quy mô 800+ người, 100% đúng hạn, kiểm soát ngân sách**.

---

## 8. CƠ SỞ DỮ LIỆU SỰ KIỆN, HỘI THẢO & ĐIỂM RÈN LUYỆN

Tất cả sự kiện đều có chính sách tích lũy **Điểm rèn luyện** chính thức theo quy định của Phòng Công tác Sinh viên (CTSV) PTIT:

| Mã Sự kiện | Tên Sự kiện | Đơn vị Tổ chức | Thời gian & Địa điểm | Hình thức | Quyền lợi & Điểm rèn luyện | Diễn giả / Khách mời |
|---|---|---|---|---|---|---|
| **event-1** | Workshop: Ứng dụng AI trong Tối ưu hóa CV & Phỏng vấn Doanh nghiệp | CLB Kỹ Năng Nghề Nghiệp & PTIT Career Hub Mentors | 19:30 - 21:30 (25/10/2026)<br>Zoom & Livestream Fanpage | Trực tuyến (Online) | **+3 Điểm rèn luyện**; Cấp Giấy chứng nhận E-Certificate; Tặng E-book 100+ Prompt AI | ThS. Nguyễn Hoàng Lan (TA Lead VNG), Trần Đức Toàn (AI Evangelist FPT Software) |
| **event-2** | PTIT Career Fair 2026 — Ngày hội Việc làm & Hướng nghiệp Công nghệ | Học viện Công nghệ Bưu chính Viễn thông (PTIT) | 08:00 - 17:00 (18/11/2026)<br>Hội trường A2 & Sân đa năng PTIT | Trực tiếp (Offline) | **+5 Điểm rèn luyện**; Phỏng vấn tuyển dụng trực tiếp tại 45+ gian hàng doanh nghiệp; Tư vấn CV 1-1 | Đại diện Tập đoàn VNPT, Viettel, FPT Telecom, Shopee, Techcombank, VNG |
| **event-3** | Tọa đàm: Xu hướng Thương mại số & Marketing hiệu suất 2026 | Viện Kinh tế Bưu điện PTIT & Khoa Marketing | 14:00 - 16:30 (05/11/2026)<br>Hội đồng Viện Kinh tế (Tầng 4 Nhà A1) | Hybrid | **+3 Điểm rèn luyện**; Cập nhật báo cáo độc quyền về xu hướng thương mại số & Livestream bán hàng | Giám đốc Marketing Masan Consumer, Head of Growth Shopee Vietnam |
| **event-4** | Cuộc thi Sáng tạo Ý tưởng Kinh doanh số & Marketing PTIT 2026 | Ban Chấp hành Đoàn Thanh niên Học viện PTIT | Vòng chung kết 13:30 (12/12/2026)<br>PTIT Innovation Hub (Tầng 2 Thư viện) | Trực tiếp | **+5 Điểm rèn luyện**; Tổng giải thưởng 50.000.000 VNĐ; Cơ hội ươm tạo khởi nghiệp cùng Quỹ đầu tư | Ban Giám khảo đến từ NextTech, VNPAY, Viettel Digital |
| **event-5** | Bootcamp Kỹ năng Lập trình Thực chiến & Giải thuật cho Phỏng vấn Tech | Khoa CNTT & Câu lạc bộ Lập trình PTIT | Diễn ra 4 buổi tối T7 & CN<br>MS Teams & Lab tự động | Trực tuyến | **+4 Điểm rèn luyện**; Tài khoản luyện phỏng vấn LeetCode Premium; Chứng nhận hoàn thành Bootcamp | Senior Software Engineers tại FPT Software, Viettel Telecom |
| **event-6** | Lễ Vinh danh & Kết nối Học bổng Doanh nghiệp PTIT Quý 4/2026 | Phòng CTSV & Phòng Hợp tác Quốc tế PTIT | 08:30 - 11:30 (20/12/2026)<br>Hội trường Quốc tế G2 | Trực tiếp | Trao 30 suất học bổng doanh nghiệp tài trợ (5.000.000 - 20.000.000 VNĐ/suất); Networking cấp cao | Lãnh đạo Tập đoàn VNPT, Viettel, Tokyo Institute of Technology |

---

## 9. CHÍNH SÁCH PHÂN QUYỀN (RBAC) & CHỈ SỐ QUẢN TRỊ HỆ THỐNG

### 9.1. Quy tắc Xác thực & Phân quyền (Role-Based Access Control)
- **Role `student`**:
  - Được xem toàn bộ Trang chủ, Career Map, Danh sách việc làm, Danh sách sự kiện, AI CV, Nhiệm vụ cá nhân (My Tasks), Hồ sơ sinh viên.
  - Được làm bài test Career Check, lưu việc làm/sự kiện, tải CV lên phân tích.
  - **Không có quyền** truy cập các đường dẫn quản trị (`/admin/*`). Nếu truy cập URL admin, hệ thống tự động điều hướng về `/` (Trang chủ).
- **Role `admin`**:
  - Danh sách email quản trị viên được cấp phép chính thức:
    - `admin@ptit.edu.vn`
    - `career.admin@ptit.edu.vn`
    - `admin@ptitcareer.vn`
    - `quanly.ptit@ptit.edu.vn`
  - Quyền hạn: Quản trị danh mục tin tuyển dụng (Thêm/Sửa/Duyệt/Xóa), Quản lý sự kiện, Quản trị hồ sơ sinh viên, Truy cập Dashboard Báo cáo Phân tích Marketing & Hướng nghiệp AI.

### 9.2. Khung Chỉ số Phân tích Dữ liệu Hệ thống (Analytics & BI Engine)
Hệ thống tổng hợp dữ liệu thống kê ẩn danh phục vụ công tác dự báo xu hướng:
1. **Phân bố Ngành học & Tỷ lệ hoàn thành Career Check**: Đo lường tỷ lệ sinh viên từng khoa tham gia định hướng nghề nghiệp sớm.
2. **Điểm trung bình 4 Thiên hướng ($CR, AN, OP, CO$)**: Thống kê bức tranh năng lực tổng thể của sinh viên PTIT theo từng khóa nhập học.
3. **Top Cặp Thiên hướng dẫn đầu**: Phục vụ việc mở rộng liên kết doanh nghiệp thuộc các ngành nghề tương ứng.
4. **Phễu tuyển dụng & Tương tác**:
   - `pageViews` $\rightarrow$ `jobViews` $\rightarrow$ `applyClicks` (Đo lường tỷ lệ chuyển đổi từ quan tâm đến nộp hồ sơ).
   - `eventViews` $\rightarrow$ `eventRegistrationClicks` (Đo lường mức độ quan tâm đến các workshop kỹ năng).
5. **Khoảng cách Kỹ năng Tập hợp (Aggregate Skill Gap)**: Tổng hợp các kỹ năng còn thiếu phổ biến nhất (ví dụ: Google Analytics 4, Meta Ads, SQL, Tiếng Anh phỏng vấn) để Nhà trường tổ chức các khóa bồi dưỡng chuyên đề kịp thời.

---

## LƯU Ý KHI TÍCH HỢP VỚI AI AGENT BÊN NGOÀI
- Khi AI Agent trả lời sinh viên PTIT, luôn xưng hô thân thiện, mang tính cố vấn sư phạm (*"chào bạn / chúc bạn có một lộ trình học tập hiệu quả tại PTIT"*).
- Mọi lời khuyên nghề nghiệp cần bám sát hệ thống môn học, các câu lạc bộ thực tế và mạng lưới doanh nghiệp đối tác đã được chuẩn hóa trong tài liệu này.
- Khi người dùng cung cấp thông tin CV hoặc mục tiêu, AI Agent cần trích xuất mã thiên hướng tương ứng ($CR, AN, OP, CO$) và áp dụng công thức viết lại **Action + Context + Metric (XYZ)** để hướng dẫn sinh viên.
