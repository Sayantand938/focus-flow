// src/features/FocusSheet/components/ShiftCardSkeleton.tsx
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";

const SkeletonBlock = ({ className }: { className?: string }) => (
  <div className={`bg-muted/60 rounded-md animate-pulse ${className}`} />
);

export function ShiftCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <SkeletonBlock className="h-6 w-1/3" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <div className="grid grid-cols-2 sm:grid-cols-3 items-center gap-3 sm:gap-4">
                <SkeletonBlock className="h-7 w-full" />
                <div className="hidden sm:flex justify-center">
                  <SkeletonBlock className="h-9 w-[130px] lg:w-[150px]" />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <SkeletonBlock className="hidden sm:inline-flex h-5 w-16" />
                  <SkeletonBlock className="h-5 w-8 rounded-full" />
                </div>
              </div>
              {i < 3 && <Separator className="mt-4" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}