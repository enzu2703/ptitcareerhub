import React, { useState, useEffect } from 'react';
import {
  loadAllUsersForAdmin,
  computeUserAggregates,
  UserAggregateReport,
} from '../../services/userService';
import {
  Users,
  Award,
  GraduationCap,
  Target,
  Compass,
  PieChart,
  BarChart3,
  TrendingUp,
  RefreshCw,
  Sparkles,
  BookOpen,
  Calendar,
} from 'lucide-react';

export const AdminUsersTab: React.FC = () => {
  const [report, setReport] = useState<UserAggregateReport | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const users = await loadAllUsersForAdmin();
      const aggregates = computeUserAggregates(users);
      setReport(aggregates);
    } catch (err) {
      console.warn('Failed to load users for admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-red-600" />
        <p className="text-xs font-bold text-slate-500">Đang tải và tổng hợp dữ liệu sinh viên từ Firestore...</p>
      </div>
    );
  }

  const hasData = report && report.hasData && report.totalUsers > 0;
  const cc = report?.careerCheckAnalytics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            <span>Quản Lý Người Dùng & Thống Kê Career Check</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Báo cáo tổng hợp số liệu thực tế về cơ cấu sinh viên PTIT, tỷ lệ hoàn thành khảo sát và phân tích 4 nhóm năng lực.
          </p>
        </div>

        <button
          onClick={fetchUserData}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Làm mới dữ liệu</span>
        </button>
      </div>

      {!hasData ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">Chưa có dữ liệu</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Hệ thống chưa ghi nhận hồ sơ sinh viên hoặc bài đánh giá Career Check nào trong cơ sở dữ liệu.
          </p>
        </div>
      ) : (
        <>
          {/* Top 4 Aggregate Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng người dùng (Users)</span>
              <p className="text-2xl font-black text-slate-900">{report.totalUsers}</p>
              <span className="text-[11px] text-slate-500">Hồ sơ đã đăng ký tài khoản</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Career Check đã làm</span>
              <p className="text-2xl font-black text-purple-600">{report.careerCheckCompletedCount}</p>
              <span className="text-[11px] text-purple-700 font-semibold">
                Tỷ lệ hoàn thành: {report.careerCheckCompletionRate}%
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ngành đông nhất</span>
              <p className="text-sm font-black text-slate-900 truncate">
                {report.majorDistribution[0]?.major || 'Chưa có dữ liệu'}
              </p>
              <span className="text-[11px] text-slate-500">
                {report.majorDistribution[0] ? `${report.majorDistribution[0].count} sinh viên (${report.majorDistribution[0].percentage}%)` : ''}
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Niên khóa chủ đạo</span>
              <p className="text-sm font-black text-slate-900 truncate">
                {report.academicYearDistribution[0]?.year || 'Chưa có dữ liệu'}
              </p>
              <span className="text-[11px] text-slate-500">
                {report.academicYearDistribution[0] ? `${report.academicYearDistribution[0].count} sinh viên (${report.academicYearDistribution[0].percentage}%)` : ''}
              </span>
            </div>
          </div>

          {/* User Distributions: Major, Academic Year, Career Goal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Major Distribution */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>Phân bổ theo Chuyên ngành (Major)</span>
                </h3>
              </div>
              <div className="space-y-3">
                {report.majorDistribution.map((item, idx) => (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 font-medium truncate max-w-[200px]">
                        {item.major}
                      </span>
                      <span className="font-bold text-slate-900">
                        {item.count} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Academic Year Distribution */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>Phân bổ theo Niên khóa (Year)</span>
                </h3>
              </div>
              <div className="space-y-3">
                {report.academicYearDistribution.map((item, idx) => (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 font-medium">{item.year}</span>
                      <span className="font-bold text-slate-900">
                        {item.count} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-2 rounded-full transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Career Goal Distribution */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Target className="w-4 h-4 text-red-600" />
                  <span>Mục tiêu nghề nghiệp (Career Goal)</span>
                </h3>
              </div>
              <div className="space-y-3">
                {report.careerGoalDistribution.map((item, idx) => (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 font-medium truncate max-w-[200px]">
                        {item.goal}
                      </span>
                      <span className="font-bold text-slate-900">
                        {item.count} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#B90013] h-2 rounded-full transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CAREER CHECK ANALYTICS SECTION */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  <span>Phân Tích Chi Tiết Dữ Liệu Career Check</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Điểm trung bình các nhóm xu hướng tính cách nghề nghiệp theo chuẩn trắc nghiệm năng lực PTIT.
                </p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-200 self-start sm:self-auto">
                {cc?.totalCompleted || 0} bài khảo sát hoàn tất
              </span>
            </div>

            {!cc || !cc.hasData ? (
              <div className="py-8 text-center text-slate-400">
                <p className="font-semibold text-xs">Chưa có bài đánh giá Career Check hoàn thành để tính toán xu hướng.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 4 Tendencies Average: CR, AN, OP, CO */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Điểm trung bình 4 xu hướng năng lực
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* CR */}
                    <div className="p-4 bg-purple-50/70 rounded-xl border border-purple-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-purple-900 text-xs">CR (Sáng tạo)</span>
                        <span className="font-black text-purple-700 text-lg">{cc.averageTendencies.CR}%</span>
                      </div>
                      <div className="w-full bg-purple-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${cc.averageTendencies.CR}%` }} />
                      </div>
                      <span className="text-[10px] text-purple-600 font-medium block">Creative Thinking & Content</span>
                    </div>

                    {/* AN */}
                    <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-900 text-xs">AN (Phân tích)</span>
                        <span className="font-black text-blue-700 text-lg">{cc.averageTendencies.AN}%</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${cc.averageTendencies.AN}%` }} />
                      </div>
                      <span className="text-[10px] text-blue-600 font-medium block">Data & Analytical Logic</span>
                    </div>

                    {/* OP */}
                    <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-900 text-xs">OP (Vận hành)</span>
                        <span className="font-black text-emerald-700 text-lg">{cc.averageTendencies.OP}%</span>
                      </div>
                      <div className="w-full bg-emerald-200 rounded-full h-2">
                        <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${cc.averageTendencies.OP}%` }} />
                      </div>
                      <span className="text-[10px] text-emerald-600 font-medium block">Operational Process & Execution</span>
                    </div>

                    {/* CO */}
                    <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900 text-xs">CO (Thương mại)</span>
                        <span className="font-black text-amber-700 text-lg">{cc.averageTendencies.CO}%</span>
                      </div>
                      <div className="w-full bg-amber-200 rounded-full h-2">
                        <div className="bg-amber-600 h-2 rounded-full" style={{ width: `${cc.averageTendencies.CO}%` }} />
                      </div>
                      <span className="text-[10px] text-amber-600 font-medium block">Commercial & Business Growth</span>
                    </div>
                  </div>
                </div>

                {/* Top 1 Tendency & Top 3 Combinations */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Top 1 Tendency (Chiếm ưu thế)</span>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-600 text-white font-black text-sm flex items-center justify-center">
                        {cc.topTendency?.code || 'CR'}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-sm">
                          {cc.topTendency?.name || 'Sáng tạo (Creative)'}
                        </p>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Điểm trung bình toàn trường: {cc.topTendency?.percentage || 0}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Top 3 Combinations (Tổ hợp hàng đầu)</span>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {cc.topCombinations.length > 0 ? (
                        cc.topCombinations.map((c, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs"
                          >
                            #{idx + 1} {c.combo} ({c.count} bài - {c.percentage}%)
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">
                          Đang cập nhật thêm dữ liệu khảo sát
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cross-tabulations: Direction by Major & Direction by Academic Year */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
                  {/* Career Direction by Major */}
                  <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
                    <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-blue-600" />
                      <span>Định hướng nghề nghiệp theo Chuyên ngành</span>
                    </h5>
                    {Object.keys(cc.directionByMajor).length === 0 ? (
                      <p className="text-xs text-slate-400">Chưa có dữ liệu</p>
                    ) : (
                      <div className="space-y-2.5">
                        {Object.entries(cc.directionByMajor).map(([major, dirs], i) => (
                          <div key={i} className="text-xs bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                            <span className="font-bold text-slate-800 block">{major}</span>
                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                              {Object.entries(dirs).map(([dirName, count], di) => (
                                <span key={di} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium text-[11px]">
                                  {dirName}: {count} SV
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Career Direction by Academic Year */}
                  <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
                    <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      <span>Định hướng nghề nghiệp theo Niên khóa</span>
                    </h5>
                    {Object.keys(cc.directionByYear).length === 0 ? (
                      <p className="text-xs text-slate-400">Chưa có dữ liệu</p>
                    ) : (
                      <div className="space-y-2.5">
                        {Object.entries(cc.directionByYear).map(([year, dirs], i) => (
                          <div key={i} className="text-xs bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                            <span className="font-bold text-slate-800 block">{year}</span>
                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                              {Object.entries(dirs).map(([dirName, count], di) => (
                                <span key={di} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium text-[11px]">
                                  {dirName}: {count} SV
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
