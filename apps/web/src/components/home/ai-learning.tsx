"use client";

import { Brain, ChevronRight, LineChart, Target, Users, Sparkles } from "lucide-react";
import Link from "next/link";

const AILearning = () => {
  return (
    <section className="py-24 relative">
      {/* Background decorations */}
      <div className="absolute top-0 inset-0 bg-gradient-to-b from-slate-50 via-slate-50/95 to-slate-100/90 dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-900/90 -z-10 transition-colors duration-300"></div>

      {/* Wave decoration on top */}
      <div className="absolute top-0 left-0 w-full h-24 bg-[url('/images/wave-light-top.svg')] dark:bg-[url('/images/wave-dark-top.svg')] bg-cover bg-top bg-no-repeat -z-10 transition-colors duration-300"></div>

      <div className="container px-4 mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100/50 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 backdrop-blur-sm mb-4 transition-colors duration-300">
            <Sparkles className="h-4 w-4 mr-2" /> Công nghệ AI tiên tiến
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-300 to-purple-400">
            Học tập cá nhân hóa với AI
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto transition-colors duration-300">
            Công nghệ AI giúp đánh giá năng lực, gợi ý lộ trình học tập tối ưu dựa trên điểm mạnh và điểm yếu của từng học sinh.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <div className="space-y-6">
              <div className="bg-white/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-blue-100/50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 mt-1 transition-colors duration-300">
                    <Target className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-slate-800 dark:text-white mb-2 transition-colors duration-300">Phân tích điểm mạnh yếu</h3>
                    <p className="text-slate-600 dark:text-slate-400 transition-colors duration-300">AI phân tích chi tiết năng lực theo từng chủ đề và dạng bài, giúp bạn hiểu rõ những lĩnh vực cần cải thiện.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-purple-100/50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 mt-1 transition-colors duration-300">
                    <LineChart className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-slate-800 dark:text-white mb-2 transition-colors duration-300">Theo dõi tiến độ trực quan</h3>
                    <p className="text-slate-600 dark:text-slate-400 transition-colors duration-300">Biểu đồ hiển thị sự tiến bộ và tốc độ học tập theo thời gian, giúp duy trì động lực học tập.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm hover:shadow-lg hover:shadow-pink-500/5 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-pink-100/50 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 mt-1 transition-colors duration-300">
                    <Brain className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-slate-800 dark:text-white mb-2 transition-colors duration-300">Gợi ý cá nhân hóa</h3>
                    <p className="text-slate-600 dark:text-slate-400 transition-colors duration-300">Đề xuất bài tập và phương pháp học tối ưu cho từng học sinh dựa trên phong cách học và mục tiêu.</p>
                  </div>
                </div>
              </div>
            </div>

            <Link href="/ai-learning" className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium mt-8 hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
              Tìm hiểu thêm về công nghệ AI <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          <div className="order-1 lg:order-2 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl"></div>

            <div className="relative">
              {/* Main dashboard UI */}
              <div className="bg-white/90 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 p-6 rounded-2xl shadow-xl transition-colors duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-100/50 dark:bg-blue-500/30 flex items-center justify-center transition-colors duration-300">
                      <Users className="h-6 w-6 text-blue-600 dark:text-blue-400 transition-colors duration-300" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-white transition-colors duration-300">Hồ sơ học tập</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">Lớp 12 • Chuyên Toán</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="w-8 h-8 rounded-lg bg-slate-200/70 dark:bg-slate-700/50 flex items-center justify-center transition-colors duration-300">
                      <ChevronRight className="h-5 w-5 text-slate-600 dark:text-slate-400 transition-colors duration-300" />
                    </button>
                  </div>
                </div>

                {/* Analytics chart */}
                <div className="mb-6">
                  <div className="bg-slate-100/70 dark:bg-slate-700/30 rounded-xl p-4 mb-4 transition-colors duration-300">
                    <div className="flex justify-between mb-2">
                      <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors duration-300">Phân tích kỹ năng</h5>
                      <span className="text-xs text-slate-600 dark:text-slate-400 transition-colors duration-300">Cập nhật gần nhất: Hôm nay</span>
                    </div>

                    <div className="flex items-end gap-1 h-36">
                      <div className="h-[60%] w-1/6 rounded-t-md bg-gradient-to-t from-blue-500 to-blue-400"></div>
                      <div className="h-[80%] w-1/6 rounded-t-md bg-gradient-to-t from-blue-500 to-blue-400"></div>
                      <div className="h-[40%] w-1/6 rounded-t-md bg-gradient-to-t from-blue-500 to-blue-400"></div>
                      <div className="h-[70%] w-1/6 rounded-t-md bg-gradient-to-t from-purple-500 to-purple-400"></div>
                      <div className="h-[55%] w-1/6 rounded-t-md bg-gradient-to-t from-purple-500 to-purple-400"></div>
                      <div className="h-[65%] w-1/6 rounded-t-md bg-gradient-to-t from-pink-500 to-pink-400"></div>
                    </div>

                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-500 mt-2 transition-colors duration-300">
                      <span>Đại số</span>
                      <span>Hình học</span>
                      <span>Giải tích</span>
                    </div>
                  </div>

                  <div className="bg-slate-100/70 dark:bg-slate-700/30 rounded-xl p-4 transition-colors duration-300">
                    <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4 transition-colors duration-300">Đề xuất lộ trình học</h5>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 bg-white/80 dark:bg-slate-800/50 p-3 rounded-lg transition-colors duration-300">
                        <div className="w-8 h-8 rounded-full bg-blue-100/50 dark:bg-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium transition-colors duration-300">1</div>
                        <div className="flex-1">
                          <p className="text-sm text-slate-700 dark:text-slate-300 transition-colors duration-300">Ôn tập phương trình bậc hai</p>
                          <div className="mt-1 h-1.5 w-full bg-slate-300 dark:bg-slate-700 rounded-full overflow-hidden transition-colors duration-300">
                            <div className="h-full w-3/4 bg-blue-500 rounded-full"></div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 bg-white/80 dark:bg-slate-800/50 p-3 rounded-lg transition-colors duration-300">
                        <div className="w-8 h-8 rounded-full bg-purple-100/50 dark:bg-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 font-medium transition-colors duration-300">2</div>
                        <div className="flex-1">
                          <p className="text-sm text-slate-700 dark:text-slate-300 transition-colors duration-300">Luyện tập bất đẳng thức Cauchy</p>
                          <div className="mt-1 h-1.5 w-full bg-slate-300 dark:bg-slate-700 rounded-full overflow-hidden transition-colors duration-300">
                            <div className="h-full w-1/2 bg-purple-500 rounded-full"></div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 bg-white/80 dark:bg-slate-800/50 p-3 rounded-lg transition-colors duration-300">
                        <div className="w-8 h-8 rounded-full bg-pink-100/50 dark:bg-pink-500/30 flex items-center justify-center text-pink-600 dark:text-pink-400 font-medium transition-colors duration-300">3</div>
                        <div className="flex-1">
                          <p className="text-sm text-slate-700 dark:text-slate-300 transition-colors duration-300">Làm đề thi Hình học không gian</p>
                          <div className="mt-1 h-1.5 w-full bg-slate-300 dark:bg-slate-700 rounded-full overflow-hidden transition-colors duration-300">
                            <div className="h-full w-1/4 bg-pink-500 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating notification */}
              <div className="absolute -bottom-5 -right-5 bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 p-4 rounded-xl shadow-lg w-64 transition-colors duration-300">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-100/50 dark:bg-green-500/20 text-green-600 dark:text-green-400 transition-colors duration-300">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="font-medium text-slate-800 dark:text-white text-sm transition-colors duration-300">Thành tích mới!</h5>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 transition-colors duration-300">Bạn đã hoàn thành 5 bài tập liên tiếp chính xác.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave decoration at bottom */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-[url('/images/wave-light-bottom.svg')] dark:bg-[url('/images/wave-dark-bottom.svg')] bg-cover bg-bottom bg-no-repeat transition-colors duration-300"></div>
    </section>
  );
};

export default AILearning;