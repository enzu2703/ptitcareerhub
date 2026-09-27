export interface PtitBatchInfo {
  id: string; // e.g. 'D23'
  yearNum: number; // 4, 3, 2, 1
  yearName: string; // 'Năm 4', 'Năm 3', 'Năm 2', 'Năm 1'
  label: string; // 'Khóa 2023'
  entryYear: number; // 2023
}

/**
 * Tính toán danh sách Khóa học PTIT tự động theo thời gian thực (năm học hiện tại).
 * Ví dụ:
 * - Năm 2026: Sinh viên năm 4 là khóa D23 (nhập học 2023), năm 3 là D24, năm 2 là D25, năm 1 là D26.
 * - Tự động cập nhật theo chu kỳ năm học mới (bắt đầu từ tháng 8 hàng năm).
 */
export function getPtitBatches(): PtitBatchInfo[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  // Năm học mới của đại học bắt đầu từ tháng 8 (tháng 0-indexed >= 7)
  const academicStartYear = now.getMonth() >= 7 ? currentYear : currentYear - 1;

  const batches: PtitBatchInfo[] = [];

  for (let yearNum = 4; yearNum >= 1; yearNum--) {
    const entryYear = academicStartYear - (yearNum - 1);
    const shortYear = String(entryYear).slice(-2);
    batches.push({
      id: `D${shortYear}`,
      yearNum,
      yearName: `Năm ${yearNum}`,
      label: `Khóa ${entryYear}`,
      entryYear,
    });
  }

  return batches;
}

/**
 * Trả về chuỗi hiển thị năm học hiện tại (VD: "Năm học 2026 - 2027")
 */
export function getCurrentAcademicYearLabel(): string {
  const now = new Date();
  const currentYear = now.getFullYear();
  const academicStartYear = now.getMonth() >= 7 ? currentYear : currentYear - 1;
  return `Năm học ${academicStartYear} - ${academicStartYear + 1}`;
}
