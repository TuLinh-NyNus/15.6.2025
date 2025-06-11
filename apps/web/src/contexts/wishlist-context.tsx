'use client';

import * as React from "react";

interface Course {
  id: string;
  title: string;
  image: string;
  instructor: string;
  price: string;
  href: string;
  progress: number;
  rating: number;
  students: number;
  tags: string[];
  duration: string;
}

interface WishlistContextType {
  wishlist: Course[];
  addToWishlist: (course: Course) => void;
  removeFromWishlist: (courseId: string) => void;
  isInWishlist: (courseId: string) => boolean;
}

const WishlistContext = React.createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = React.useState<Course[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wishlist');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  React.useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (course: Course) => {
    setWishlist((prev) => {
      if (!prev.some((item) => item.id === course.id)) {
        return [...prev, course];
      }
      return prev;
    });
  };

  const removeFromWishlist = (courseId: string) => {
    setWishlist((prev) => prev.filter((course) => course.id !== courseId));
  };

  const isInWishlist = (courseId: string) => {
    return wishlist.some((course) => course.id === courseId);
  };

  return (
    <WishlistContext.Provider
      value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = React.useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}