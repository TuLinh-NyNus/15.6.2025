"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import Link from "next/link";
import { signOut } from 'next-auth/react';
import { useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWishlist } from "@/contexts/wishlist-context";

import LoginModal from "./auth/login-modal";
import RegisterModal from "./auth/register-modal";
// ThemeSwitch component is not used, using ThemeToggle instead



const navItems = [
  {
    title: "KHÓA HỌC",
    href: "/khoa-hoc",
    isHighlight: false
  },
  {
    title: "LUYỆN ĐỀ",
    href: "/luyen-de",
    isHighlight: false
  },
  {
    title: "ĐỀ THI",
    href: "/de-thi",
    isHighlight: false
  },
  {
    title: "CÂU HỎI",
    href: "/cau-hoi",
    isHighlight: false
  },
  {
    title: "THẢO LUẬN",
    href: "/thao-luan",
    isHighlight: false
  },
  {
    title: "NHẮN TIN",
    href: "/nhan-tin",
    isHighlight: false
  },
  {
    title: "THƯ VIỆN",
    href: "/thu-vien",
    isHighlight: false
  }
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const { wishlist } = useWishlist();
  const { user, logout } = useAuth();

  const handleOpenLoginModal = () => {
    setIsRegisterModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const handleOpenRegisterModal = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(true);
  };

  const handleCloseRegisterModal = () => {
    setIsRegisterModalOpen(false);
  };

  const handleLogout = async () => {
    logout(); // Xóa token từ localStorage
    // Sử dụng NextAuth signOut và chuyển hướng về trang chủ
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-800/10 bg-white/80 backdrop-blur dark:border-slate-50/[0.06] dark:bg-slate-900/80">
        <nav className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 hover:from-purple-500 hover:via-pink-400 hover:to-purple-500 transition-all duration-300"
            style={{
              textShadow: "0 0 40px rgba(168, 85, 247, 0.3)",
              fontFamily: "'Nunito', 'Segoe UI', system-ui, sans-serif",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              borderRadius: "0.5rem"
            }}
          >
            NyNus
          </Link>

          <div className="hidden gap-6 md:flex">
            {navItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className={`text-sm font-semibold tracking-wide transition-all duration-300 ${
                    item.isHighlight
                      ? "text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      : "text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400"
                  } font-sans`}
                  style={{
                    textShadow: item.isHighlight ? "0 0 20px rgba(168, 85, 247, 0.2)" : "none",
                    letterSpacing: "0.05em"
                  }}
                >
                  {item.title}
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />

            <Link href="/wishlist" className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 transition-colors hover:bg-purple-500/10"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <AnimatePresence>
                  {wishlist.length > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-purple-500 text-[10px] font-medium text-white"
                    >
                      {wishlist.length}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </Link>

            <div className="flex items-center gap-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src="/images/avatar.png" alt="Avatar" />
                        <AvatarFallback className="bg-purple-500/10 text-purple-500">
                          {user.fullName?.substring(0, 2).toUpperCase() || user.email.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.fullName || user.email}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {user.role === 'admin' && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/admin/dashboard">Quản trị hệ thống</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem>
                      Hồ sơ của tôi
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Khóa học của tôi
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Cài đặt
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-500" onClick={handleLogout}>
                      Đăng xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
                  onClick={handleOpenLoginModal}
                >
                  Đăng nhập
                </Button>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-3">
            <ThemeToggle />
            <button
              className="p-2 focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Đóng menu" : "Mở menu"}
            >
              <motion.div
                animate={isMenuOpen ? "open" : "closed"}
                variants={{
                  open: { rotate: 180 },
                  closed: { rotate: 0 }
                }}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </motion.div>
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden px-4 py-3 space-y-3 shadow-lg fancy-glass bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block py-2 transition-all duration-300 text-sm font-semibold tracking-wide ${
                  item.isHighlight
                    ? "text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500"
                    : "hover:text-purple-600 dark:hover:text-purple-400"
                }`}
                style={{
                  textShadow: item.isHighlight ? "0 0 20px rgba(168, 85, 247, 0.2)" : "none",
                  letterSpacing: "0.05em"
                }}
              >
                {item.title}
              </Link>
            ))}
            <div className="relative py-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="search-input pl-10 py-1.5 pr-4 rounded-full focus:outline-none focus:ring-1 focus:ring-primary w-full bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white transition-colors duration-300"
              />
            </div>
          </motion.div>
        )}
      </header>

      {/* Auth Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={handleCloseLoginModal}
        onSwitchToRegister={handleOpenRegisterModal}
      />
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={handleCloseRegisterModal}
        onSwitchToLogin={handleOpenLoginModal}
      />
    </>
  );
};

export default Navbar;