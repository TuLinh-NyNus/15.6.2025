"use client";

import { motion } from "framer-motion";
import { FacebookIcon, InstagramIcon, YoutubeIcon, Twitter, Mail, MapPin, Phone, Globe, ChevronDown, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import logger from "@/lib/utils/logger";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('vi');
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // In a real app, you would send this to your API
      logger.debug('Subscribed with:', email);
      setIsSubscribed(true);
      setEmail('');
      // Reset the subscription state after 3 seconds
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const languages = [
    { code: 'vi', name: 'Tiếng Việt' },
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'ja', name: 'Japanese' }
  ];

  return (
    <footer className="relative pt-24 pb-8 overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 transition-colors duration-300">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[20%] right-[30%] w-1/3 h-1/3 bg-blue-500/5 blur-[150px] rounded-full"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-1/3 h-1/3 bg-purple-500/5 blur-[150px] rounded-full"></div>
      </div>

      {/* Wave decoration on top */}
      <div className="absolute top-0 left-0 w-full h-24 bg-[url('/images/wave-light-top.svg')] dark:bg-[url('/images/wave-dark-top.svg')] bg-cover bg-top bg-no-repeat -z-5 transition-colors duration-300"></div>

      <div className="container px-4 mx-auto">
        {/* Top section with colored wave background */}
        <div className="relative mb-20">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-200/40 via-purple-200/40 to-pink-200/40 dark:from-blue-600/20 dark:via-purple-600/20 dark:to-pink-600/20 rounded-2xl blur-sm -z-10 transition-colors duration-300"></div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 transition-colors duration-300">
            <div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 transition-colors duration-300">Sẵn sàng bắt đầu?</h3>
              <p className="text-slate-600 dark:text-slate-400 transition-colors duration-300">Đăng ký ngay hôm nay để bắt đầu hành trình học tập của bạn</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/auth/register"
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-200 block text-center"
                >
                  Đăng ký miễn phí
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/auth/login"
                  className="px-6 py-3 rounded-full bg-slate-200/50 dark:bg-white/10 border border-slate-300/50 dark:border-white/20 text-slate-700 dark:text-white font-medium hover:bg-slate-200/70 dark:hover:bg-white/15 transition-all duration-200 block text-center"
                >
                  Đăng nhập
                </Link>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Newsletter Subscription */}
        <div className="mb-16 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 bg-white/80 dark:bg-slate-900/50 transition-colors duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-3 transition-colors duration-300">Nhận thông tin mới nhất</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4 transition-colors duration-300">Đăng ký nhận thông báo về các khóa học, đề thi và tính năng mới nhất.</p>
              <div className="flex items-center gap-2 text-sm text-slate-500 transition-colors duration-300">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Không spam, chỉ tin tức hữu ích</span>
              </div>
            </div>
            <div>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <input
                    type="email"
                    placeholder="Email của bạn"
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 text-slate-800 dark:text-white transition-colors"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  {isSubscribed && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </motion.div>
                  )}
                </div>
                <motion.button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubscribed ? "Đã đăng ký!" : <>Đăng ký <ArrowRight className="h-4 w-4" /></>}
                </motion.button>
              </form>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          <div>
            <Link href="/" className="text-2xl font-bold mb-6 inline-block">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400 transition-colors duration-300">
                NyNus
              </span>
            </Link>
            <p className="text-slate-600 dark:text-slate-400 mb-6 transition-colors duration-300">
              Nền tảng học toán thông minh với AI, giúp học sinh cải thiện kỹ năng và đạt kết quả cao trong các kỳ thi quan trọng.
            </p>
            <div className="flex space-x-3 mb-6">
              <Link href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-100 dark:hover:bg-blue-600/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200">
                <FacebookIcon className="h-4 w-4" />
              </Link>
              <Link href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-purple-100 dark:hover:bg-purple-600/20 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-200">
                <InstagramIcon className="h-4 w-4" />
              </Link>
              <Link href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-red-100 dark:hover:bg-red-600/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200">
                <YoutubeIcon className="h-4 w-4" />
              </Link>
              <Link href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-100 dark:hover:bg-blue-400/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200">
                <Twitter className="h-4 w-4" />
              </Link>
            </div>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className="w-full flex items-center justify-between px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 transition-colors duration-300"
              >
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>
                    {languages.find(lang => lang.code === selectedLanguage)?.name || 'Tiếng Việt'}
                  </span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${isLanguageMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLanguageMenuOpen && (
                <motion.div
                  className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden z-20 transition-colors duration-300"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      className={`w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-300 ${selectedLanguage === language.code ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}
                      onClick={() => {
                        setSelectedLanguage(language.code);
                        setIsLanguageMenuOpen(false);
                      }}
                    >
                      {language.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>

          <div className="lg:ml-auto">
            <h3 className="font-semibold text-lg text-slate-800 dark:text-white mb-5 transition-colors duration-300">Liên kết</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/gioi-thieu" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link href="/khoa-hoc" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Khóa học
                </Link>
              </li>
              <li>
                <Link href="/de-thi" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Đề thi
                </Link>
              </li>
              <li>
                <Link href="/thao-luan" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Thảo luận
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg text-slate-800 dark:text-white mb-5 transition-colors duration-300">Hỗ trợ</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/chinh-sach-bao-mat" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link href="/dieu-khoan-su-dung" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Câu hỏi thường gặp
                </Link>
              </li>
              <li>
                <Link href="/huong-dan" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Hướng dẫn sử dụng
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg text-slate-800 dark:text-white mb-5 transition-colors duration-300">Liên hệ</h3>
            <ul className="space-y-4">
              <li className="flex items-start text-slate-600 dark:text-slate-400 transition-colors duration-300">
                <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0 transition-colors duration-300" />
                <span>123 Đường Giáo Dục, Quận 10, TP.HCM</span>
              </li>
              <li className="flex items-center text-slate-600 dark:text-slate-400 transition-colors duration-300">
                <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0 transition-colors duration-300" />
                <span>1900-xxxx</span>
              </li>
              <li className="flex items-center text-slate-600 dark:text-slate-400 transition-colors duration-300">
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0 transition-colors duration-300" />
                <span>contact@nynus.edu.vn</span>
              </li>
              <li className="flex items-center text-slate-600 dark:text-slate-400 transition-colors duration-300">
                <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0 transition-colors duration-300" />
                <span>www.nynus.edu.vn</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center transition-colors duration-300">
          <p className="text-slate-500 dark:text-slate-500 text-sm mb-4 md:mb-0 transition-colors duration-300">
            © {currentYear} NyNus. Tất cả quyền được bảo lưu.
          </p>
          <div className="flex space-x-6">
            <Link href="/chinh-sach-bao-mat" className="text-sm text-slate-500 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Chính sách bảo mật
            </Link>
            <Link href="/dieu-khoan-su-dung" className="text-sm text-slate-500 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Điều khoản sử dụng
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;