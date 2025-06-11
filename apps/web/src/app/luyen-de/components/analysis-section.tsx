"use client";

import { motion } from "framer-motion";
import { Clock, Brain } from "lucide-react";
import Link from "next/link";
import React from "react";

interface AnalysisSectionProps {
  userStats: {
    completedExams: number;
    avgScore: number;
    weakTopics: string[];
    strongTopics: string[];
    timeSpent: string;
    completed: string;
  };
  getMotivationalMessage: (progress: string) => string;
  getMotivationColor: (progress: string) => string;
}

export default function AnalysisSection({
  userStats,
  getMotivationalMessage,
  getMotivationColor
}: AnalysisSectionProps) {
  return (
    <section id="analysis" className="py-20 bg-slate-100/50 dark:bg-slate-900/50 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white transition-colors duration-300">Phân tích kết quả của bạn</h2>
          <p className="mt-4 text-slate-700 dark:text-slate-50 max-w-2xl mx-auto leading-relaxed transition-colors duration-300">
            Theo dõi tiến trình học tập, phân tích điểm mạnh và điểm yếu, nhận gợi ý cải thiện từ AI.
          </p>

          {/* Thông điệp động viên cá nhân hóa */}
          <motion.div
            className={`mt-8 mx-auto max-w-xl p-4 rounded-lg bg-gradient-to-r ${getMotivationColor(userStats.completed)} border backdrop-blur-md`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <p className="text-white font-medium">{getMotivationalMessage(userStats.completed)}</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tiến độ */}
          <motion.div
            className="col-span-1 bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50 p-6 fancy-card transition-colors duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 transition-colors duration-300">Tiến độ học tập</h3>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-700 dark:text-slate-300 transition-colors duration-300">Đề thi đã hoàn thành</span>
                  <span className="text-indigo-600 dark:text-indigo-300 font-medium transition-colors duration-300">{userStats.completedExams}</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden transition-colors duration-300">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                    style={{ width: `${userStats.completed}` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-700 dark:text-slate-300 transition-colors duration-300">Điểm trung bình</span>
                  <span className="text-indigo-600 dark:text-indigo-300 font-medium transition-colors duration-300">{userStats.avgScore}/10</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden transition-colors duration-300">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                    style={{ width: `${userStats.avgScore * 10}%` }}
                  ></div>
                </div>
              </div>

              <div className="p-4 bg-indigo-100/30 dark:bg-indigo-900/30 rounded-lg border border-indigo-200/30 dark:border-indigo-900/30 transition-colors duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400 transition-colors duration-300" />
                  <span className="text-sm font-medium text-indigo-600 dark:text-indigo-300 transition-colors duration-300">Thời gian luyện tập</span>
                </div>
                <div className="text-3xl font-bold text-slate-800 dark:text-white transition-colors duration-300">{userStats.timeSpent}</div>
              </div>
            </div>
          </motion.div>

          {/* Chart */}
          <motion.div
            className="col-span-1 lg:col-span-2 bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50 p-6 fancy-card transition-colors duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 transition-colors duration-300">Phân tích kỹ năng</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-indigo-600 dark:text-indigo-300 mb-4 flex items-center gap-2 transition-colors duration-300">
                  <div className="h-2 w-2 rounded-full bg-red-500 transition-colors duration-300"></div>
                  Chủ đề cần cải thiện
                </h4>
                <ul className="space-y-4">
                  {userStats.weakTopics.map((topic, i) => (
                    <li key={i} className="flex justify-between items-center">
                      <span className="text-slate-700 dark:text-slate-300 transition-colors duration-300">{topic}</span>
                      <div className="flex items-center">
                        <div className="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden transition-colors duration-300">
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                            style={{ width: `${30 + Math.random() * 30}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-xs text-red-500 dark:text-red-400 transition-colors duration-300">{Math.floor(30 + Math.random() * 30)}%</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium text-indigo-600 dark:text-indigo-300 mb-4 flex items-center gap-2 transition-colors duration-300">
                  <div className="h-2 w-2 rounded-full bg-green-500 transition-colors duration-300"></div>
                  Chủ đề nổi trội
                </h4>
                <ul className="space-y-4">
                  {userStats.strongTopics.map((topic, i) => (
                    <li key={i} className="flex justify-between items-center">
                      <span className="text-slate-700 dark:text-slate-300 transition-colors duration-300">{topic}</span>
                      <div className="flex items-center">
                        <div className="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden transition-colors duration-300">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                            style={{ width: `${70 + Math.random() * 30}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-xs text-green-500 dark:text-green-400 transition-colors duration-300">{Math.floor(70 + Math.random() * 30)}%</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 p-4 bg-indigo-100/30 dark:bg-indigo-900/30 rounded-lg border border-indigo-200/30 dark:border-indigo-900/30 transition-colors duration-300">
              <div className="flex items-start gap-3">
                <Brain className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-1 transition-colors duration-300" />
                <div>
                  <h4 className="text-sm font-medium text-indigo-600 dark:text-indigo-300 mb-2 transition-colors duration-300">Gợi ý từ AI:</h4>
                  <p className="text-slate-700 dark:text-slate-300 text-sm transition-colors duration-300">
                    Bạn đang làm tốt ở các chủ đề về Lượng giác và Đạo hàm. Để nâng cao điểm số, hãy tập trung vào
                    Hàm số và Số phức. Đề xuất luyện tập thêm 3 đề về Hàm số và 2 đề về Số phức.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href="/luyen-de/chu-de/ham-so"
                      className="px-3 py-1 bg-indigo-100/50 dark:bg-indigo-600/20 hover:bg-indigo-600 rounded-full text-indigo-600 dark:text-indigo-300 hover:text-white text-xs font-medium border border-indigo-300/30 dark:border-indigo-600/30 transition-colors duration-300"
                    >
                      Luyện đề Hàm số
                    </Link>
                    <Link
                      href="/luyen-de/chu-de/so-phuc"
                      className="px-3 py-1 bg-indigo-100/50 dark:bg-indigo-600/20 hover:bg-indigo-600 rounded-full text-indigo-600 dark:text-indigo-300 hover:text-white text-xs font-medium border border-indigo-300/30 dark:border-indigo-600/30 transition-colors duration-300"
                    >
                      Luyện đề Số phức
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}