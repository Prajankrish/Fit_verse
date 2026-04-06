import { useState, ImgHTMLAttributes } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ImageWithFallbackProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  skeletonClassName?: string;
  imgClassName?: string;
}

export function ImageWithFallback({
  src,
  alt,
  className,
  skeletonClassName,
  imgClassName,
  fallbackSrc = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
  ...props
}: ImageWithFallbackProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const currentSrc = hasError ? fallbackSrc : src;

  return (
    <div className={cn("relative overflow-hidden w-full h-full", className)}>
      {!isLoaded && (
        <Skeleton className={cn("absolute inset-0 w-full h-full", skeletonClassName)} />
      )}
      
      <img
        loading="lazy"
        src={currentSrc}
        alt={alt || "Image"}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-500",
          isLoaded ? "opacity-100" : "opacity-0",
          imgClassName
        )}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          if (!hasError) {
             setHasError(true);
             setIsLoaded(false); // reset load state to trigger load event for fallback
          } else {
             // Fallback also failed 
             setIsLoaded(true);
          }
        }}
        {...props}
      />
    </div>
  );
}

// Export original name for backwards compatibility
export const ImageWithSkeleton = ImageWithFallback;
