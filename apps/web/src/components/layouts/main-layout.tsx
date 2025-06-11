'use client';

import { usePathname } from 'next/navigation';
import React from 'react';
import { Suspense } from 'react';

import { Providers } from '@/app/providers';
import { AuthProvider } from '@/components/auth/auth-provider';
import FloatingCTA from '@/components/floating-cta';
import Footer from '@/components/footer';
import Navbar from '@/components/navbar';
// import { ThemeProvider } from '@/components/theme-provider';
import ScrollToTop from '@/components/ui/scroll-to-top';
import { WishlistProvider } from '@/contexts/wishlist-context';



interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const isAdminPage = pathname?.includes('/3141592654/admin');

  return (
    <WishlistProvider>
      <Providers>
        <Suspense fallback={null}>
          <AuthProvider>
            {!isAdminPage && <Navbar />}
            <main className="flex-1">
              {children}
            </main>
            {!isAdminPage && (
              <>
                <Footer />
                <FloatingCTA />
              </>
            )}
            <ScrollToTop />
          </AuthProvider>
        </Suspense>
      </Providers>
    </WishlistProvider>
  );
}