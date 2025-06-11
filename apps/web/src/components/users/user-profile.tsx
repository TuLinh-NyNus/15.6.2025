'use client';

import { AlertCircle, Mail, Phone, MapPin, BookOpen, GraduationCap, Calendar, Loader2 } from 'lucide-react';
import { useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { IUpdateProfileRequest } from '@/lib/api/services/user-service';
import { formatDate } from '@/lib/utils';

import { useCurrentUserProfile, useUpdateCurrentUserProfile } from '@/hooks/use-users';

export default function UserProfile() {
  const { data: profile, isLoading, error } = useCurrentUserProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateCurrentUserProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<IUpdateProfileRequest>({
    firstName: '',
    lastName: '',
    bio: '',
    phone: '',
    address: '',
  });

  // Khởi tạo formData khi profile được tải
  const handleEdit = () => {
    if (profile) {
      setFormData({
        firstName: profile.firstName,
        lastName: profile.lastName,
        bio: profile.bio || '',
        phone: profile.phone || '',
        address: profile.address || '',
      });
    }
    setIsEditing(true);
  };

  // Xử lý thay đổi input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Xử lý submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData, {
      onSuccess: () => {
        setIsEditing(false);
      },
    });
  };

  // Xử lý hủy chỉnh sửa
  const handleCancel = () => {
    setIsEditing(false);
  };

  // Lấy chữ cái đầu của tên và họ
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Lấy tên role
  const getRoleName = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Quản trị viên';
      case 'INSTRUCTOR':
        return 'Giáo viên';
      case 'STUDENT':
        return 'Học sinh';
      default:
        return role;
    }
  };

  // Hiển thị skeleton khi đang tải
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-8 w-64 mb-2" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                </div>
              </div>
              <div className="mt-6">
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-24 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Hiển thị thông báo lỗi
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Lỗi</AlertTitle>
            <AlertDescription>
              Đã xảy ra lỗi khi tải thông tin người dùng. Vui lòng thử lại sau.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Hiển thị khi không có dữ liệu
  if (!profile) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="py-8">
              <p className="text-center text-gray-400">Không tìm thấy thông tin người dùng.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              <Avatar className="h-24 w-24 border-2 border-purple-500">
                <AvatarImage src={profile.avatar} alt={profile.fullName || `${profile.firstName} ${profile.lastName}`} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-500 to-pink-500">
                  {getInitials(profile.firstName, profile.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl text-white">
                      {profile.fullName || `${profile.firstName} ${profile.lastName}`}
                    </CardTitle>
                    <CardDescription className="mt-1 text-lg">
                      {getRoleName(profile.role)}
                    </CardDescription>
                  </div>
                  {!isEditing && (
                    <Button
                      variant="outline"
                      className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300"
                      onClick={handleEdit}
                    >
                      Chỉnh sửa thông tin
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-400 mb-1">
                        Tên
                      </label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="bg-slate-800 border-slate-700"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-400 mb-1">
                        Họ
                      </label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="bg-slate-800 border-slate-700"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-400 mb-1">
                        Số điện thoại
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="bg-slate-800 border-slate-700"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
                        Email
                      </label>
                      <Input
                        id="email"
                        value={profile.email}
                        disabled
                        className="bg-slate-800 border-slate-700 opacity-70"
                      />
                    </div>
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-400 mb-1">
                        Địa chỉ
                      </label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="bg-slate-800 border-slate-700"
                      />
                    </div>
                    <div>
                      <label htmlFor="role" className="block text-sm font-medium text-gray-400 mb-1">
                        Vai trò
                      </label>
                      <Input
                        id="role"
                        value={getRoleName(profile.role)}
                        disabled
                        className="bg-slate-800 border-slate-700 opacity-70"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-400 mb-1">
                    Giới thiệu
                  </label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className="bg-slate-800 border-slate-700"
                  />
                </div>
                <div className="mt-6 flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300"
                    onClick={handleCancel}
                    disabled={isUpdating}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      'Lưu thay đổi'
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Mail className="h-5 w-5" />
                      <span>{profile.email}</span>
                    </div>
                    {profile.phone && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Phone className="h-5 w-5" />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                    {profile.address && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <MapPin className="h-5 w-5" />
                        <span>{profile.address}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    {profile.enrolledCourses !== undefined && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <BookOpen className="h-5 w-5" />
                        <span>Đã đăng ký {profile.enrolledCourses} khóa học</span>
                      </div>
                    )}
                    {profile.completedCourses !== undefined && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <GraduationCap className="h-5 w-5" />
                        <span>Đã hoàn thành {profile.completedCourses} khóa học</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="h-5 w-5" />
                      <span>Tham gia từ {formatDate(new Date(profile.createdAt))}</span>
                    </div>
                  </div>
                </div>
                {profile.bio && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-white mb-2">Giới thiệu</h3>
                    <p className="text-gray-400 whitespace-pre-line">{profile.bio}</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
