'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

interface ErrorPageProps {
  title?: string;
  message?: string;
  error?: string;
}

export default function ErrorPage({
  title = "Lỗi khi tải dữ liệu",
  message = "Có lỗi xảy ra khi tải danh sách câu hỏi từ cơ sở dữ liệu.",
  error = "Lỗi cơ sở dữ liệu (P2022): Cấu trúc bảng không khớp với schema Prisma."
}: ErrorPageProps) {
  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Lỗi</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>

          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-medium">Các bước khắc phục:</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Kiểm tra cấu trúc bảng <code>questions</code> trong cơ sở dữ liệu.</li>
              <li>Đảm bảo schema Prisma khớp với cấu trúc bảng trong cơ sở dữ liệu.</li>
              <li>Chạy lệnh <code>npx prisma db pull</code> để cập nhật schema Prisma từ cơ sở dữ liệu.</li>
              <li>Chạy lệnh <code>npx prisma generate</code> để tạo lại Prisma Client.</li>
              <li>Khởi động lại API backend.</li>
            </ol>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link href="/3141592654/admin">
            <Button variant="outline">Quay lại trang quản trị</Button>
          </Link>
          <Link href="/3141592654/admin/questions/create">
            <Button>Tạo câu hỏi mới</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
