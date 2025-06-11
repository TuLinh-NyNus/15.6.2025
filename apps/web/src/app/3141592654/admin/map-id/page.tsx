'use client';

import { Loader2, Save, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

export default function MapIDPage() {
  const [mapIdContent, setMapIdContent] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const { toast } = useToast();

  // Load existing MapID content when component mounts
  useEffect(() => {
    const loadMapIdContent = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/map-id');
        if (response.ok) {
          const data = await response.json();
          if (data.content) {
            setMapIdContent(data.content);
          }
        } else {
          throw new Error('Không thể tải nội dung MapID');
        }
      } catch (error) {
        console.error("Error loading MapID content:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải nội dung MapID",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMapIdContent();
  }, [toast]);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Validate the input
      if (!validateMapIdFormat(mapIdContent)) {
        toast({
          title: "Lỗi định dạng",
          description: "Vui lòng kiểm tra lại định dạng MapID",
          variant: "destructive",
        });
        return;
      }
      
      // Call API to save the MapID content
      const response = await fetch('/api/map-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: mapIdContent }),
      });
      
      if (!response.ok) {
        throw new Error('Lỗi khi lưu MapID');
      }
      
      toast({
        title: "Thành công",
        description: "Đã lưu định nghĩa MapID",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi lưu MapID",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const validateMapIdFormat = (content: string): boolean => {
    // Simple validation to check if the content follows the required format
    if (!content.trim()) return false;
    
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.trim() === '') continue;
      
      // Check if line has the format with dashes and brackets
      // Allow empty lines and comment lines (starting with %)
      if (line.trim().startsWith('%')) continue;
      
      const dashMatch = line.match(/^(-+)\[(.+?)\]/);
      if (!dashMatch && line.trim() !== '' && !line.trim().startsWith('%==')) return false;
    }
    return true;
  };
  
  const handleGoBack = () => {
    router.push('/3141592654/admin/questions');
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            onClick={handleGoBack}
            className="text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Quay lại
          </Button>
          <h1 className="text-2xl font-bold">Quản lý MapID</h1>
        </div>
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || isLoading}
          className="flex items-center gap-2"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Lưu MapID
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-700 text-slate-100">
        <CardHeader>
          <CardTitle>Định nghĩa MapID</CardTitle>
          <CardDescription className="text-slate-400">
            Nhập định nghĩa cho từng tham số của MapID với định dạng như sau:
          </CardDescription>
          <div className="bg-slate-800 p-3 rounded-md text-sm font-mono mt-2 text-slate-300 border border-slate-700">
            <p>-[0] Lớp 10 (định nghĩa Lớp có 1 dấu -)</p>
            <p>----[P] 10-NGÂN HÀNG CHÍNH (định nghĩa Môn có 4 dấu -)</p>
            <p>-------[1] Mệnh đề và tập hợp (định nghĩa Chương có 7 dấu -)</p>
            <p>----------[1] Mệnh đề (định nghĩa Bài có 10 dấu -)</p>
            <p>-------------[1] Xác định mệnh đề, mệnh đề chứa biến (định nghĩa Dạng có 13 dấu -)</p>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : (
            <Textarea
              className="min-h-[400px] font-mono bg-slate-800 border-slate-700 text-slate-100 resize-none"
              placeholder="Nhập định nghĩa MapID ở đây..."
              value={mapIdContent}
              onChange={(e) => setMapIdContent(e.target.value)}
            />
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handleGoBack}
            className="bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-100"
          >
            Quay lại
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Lưu MapID
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 