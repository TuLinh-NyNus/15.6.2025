import dynamic from "next/dynamic";

// Import các component client với dynamic import để sử dụng trong Server Component
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DynamicSkeleton = dynamic(() => import("@/components/ui/skeleton"), { ssr: false });
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DynamicCardSkeleton = dynamic(() => import("@/components/ui/skeleton").then(mod => ({ default: mod.CardSkeleton })), { ssr: false });
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DynamicCourseCardSkeleton = dynamic(() => import("@/components/ui/skeleton").then(mod => ({ default: mod.CourseCardSkeleton })), { ssr: false });
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DynamicTextSkeleton = dynamic(() => import("@/components/ui/skeleton").then(mod => ({ default: mod.TextSkeleton })), { ssr: false });

export default function Loading() {
  // Render một phiên bản tĩnh trong Server Component
  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* Hero Section Skeleton */}
      <section className="flex flex-col lg:flex-row gap-8 items-center">
        <div className="flex-1 space-y-6">
          <div className="h-[60px] w-[80%] bg-slate-200 dark:bg-slate-800 rounded-md" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[16px] w-[80%] bg-slate-200 dark:bg-slate-800 rounded-md"
              />
            ))}
          </div>
          <div className="flex gap-4 pt-4">
            <div className="h-[48px] w-[120px] bg-slate-200 dark:bg-slate-800 rounded-full" />
            <div className="h-[48px] w-[150px] bg-slate-200 dark:bg-slate-800 rounded-full" />
          </div>
        </div>
        <div className="flex-1">
          <div className="h-[350px] w-full bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </section>

      {/* Features Section Skeleton */}
      <section className="py-12">
        <div className="text-center mb-12">
          <div className="h-[40px] w-[300px] bg-slate-200 dark:bg-slate-800 rounded-md mx-auto mb-4" />
          <div className="h-[20px] w-[500px] bg-slate-200 dark:bg-slate-800 rounded-md mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3">
              <div className="h-[24px] w-[70%] bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="h-[100px] w-full bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="h-[20px] w-[30%] bg-slate-200 dark:bg-slate-800 rounded-md" />
            </div>
          ))}
        </div>
      </section>

      {/* AI Learning Section Skeleton */}
      <section className="py-12">
        <div className="flex flex-col lg:flex-row gap-8 items-center">
          <div className="flex-1">
            <div className="h-[350px] w-full bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          </div>
          <div className="flex-1 space-y-6">
            <div className="h-[40px] w-[70%] bg-slate-200 dark:bg-slate-800 rounded-md" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-[16px] w-[80%] bg-slate-200 dark:bg-slate-800 rounded-md"
                />
              ))}
            </div>
            <div className="h-[48px] w-[150px] bg-slate-200 dark:bg-slate-800 rounded-full" />
          </div>
        </div>
      </section>

      {/* Courses Section Skeleton */}
      <section className="py-12">
        <div className="text-center mb-12">
          <div className="h-[40px] w-[300px] bg-slate-200 dark:bg-slate-800 rounded-md mx-auto mb-4" />
          <div className="h-[20px] w-[500px] bg-slate-200 dark:bg-slate-800 rounded-md mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
              <div className="h-[200px] w-full bg-slate-200 dark:bg-slate-800" />
              <div className="p-4 space-y-3">
                <div className="h-[24px] w-[80%] bg-slate-200 dark:bg-slate-800 rounded-md" />
                <div className="h-[16px] w-[60%] bg-slate-200 dark:bg-slate-800 rounded-md" />
                <div className="flex justify-between items-center pt-2">
                  <div className="h-[20px] w-[80px] bg-slate-200 dark:bg-slate-800 rounded-md" />
                  <div className="h-[36px] w-[100px] bg-slate-200 dark:bg-slate-800 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}