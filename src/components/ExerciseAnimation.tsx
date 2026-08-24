import React, { useState } from 'react';
import { Dumbbell } from 'lucide-react';
import { ExerciseVectorIllustration } from './illustrations/ExerciseVectorIllustration';

interface ExerciseAnimationProps {
  exerciseId?: string;
  category?: 'strength' | 'mobility';
  src?: string;
  alt?: string;
  className?: string;
  poster?: string;
}

export const ExerciseAnimation: React.FC<ExerciseAnimationProps> = ({
  exerciseId,
  category = 'strength',
  src,
  alt = 'Exercise demonstration',
  className = 'w-full h-full object-contain',
  poster,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // If video or image source is provided and hasn't errored, render native player
  if (src && !hasError) {
    const isVideo = src.endsWith('.mp4') || src.endsWith('.webm');
    if (isVideo) {
      return (
        <div className="relative w-full h-full flex items-center justify-center bg-black/40 rounded-xl overflow-hidden">
          <video
            src={src}
            poster={poster}
            autoPlay
            loop
            muted
            playsInline
            onError={() => setHasError(true)}
            onLoadedData={() => setIsLoaded(true)}
            onLoadedMetadata={() => setIsLoaded(true)}
            onPlay={() => setIsLoaded(true)}
            className={`${className} rounded-xl transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-90'
            }`}
            aria-label={alt}
          />
        </div>
      );
    }

    return (
      <img
        src={src}
        alt={alt}
        loading="eager"
        onError={() => setHasError(true)}
        onLoad={() => setIsLoaded(true)}
        className={`${className} transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    );
  }

  // Fallback to vector illustration if provided
  if (exerciseId) {
    return (
      <ExerciseVectorIllustration
        id={exerciseId}
        category={category}
        className={className}
      />
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-gym-muted bg-slate-950/60 text-center rounded-xl">
      <Dumbbell className="w-8 h-8 stroke-[1.5] text-gym-dimmed animate-pulse mb-1.5" />
      <span className="text-[10px] font-bold text-gym-dimmed uppercase tracking-wider">
        Form Demo
      </span>
    </div>
  );
};
