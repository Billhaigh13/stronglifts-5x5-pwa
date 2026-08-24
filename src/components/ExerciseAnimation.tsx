import React, { useState } from 'react';
import { Dumbbell } from 'lucide-react';

interface ExerciseAnimationProps {
  src?: string;
  alt?: string;
  className?: string;
  poster?: string;
}

export const ExerciseAnimation: React.FC<ExerciseAnimationProps> = ({
  src,
  alt = 'Exercise demonstration',
  className = 'w-full h-full object-contain mix-blend-screen',
  poster,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  if (!src || hasError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-gym-muted bg-slate-950/60 text-center">
        <Dumbbell className="w-8 h-8 stroke-[1.5] text-gym-dimmed animate-pulse mb-1.5" />
        <span className="text-[10px] font-bold text-gym-dimmed uppercase tracking-wider">
          Form Demo
        </span>
      </div>
    );
  }

  const isVideo = src.endsWith('.mp4') || src.endsWith('.webm');

  if (isVideo) {
    return (
      <video
        src={src}
        poster={poster}
        autoPlay
        loop
        muted
        playsInline
        onError={() => setHasError(true)}
        onLoadedData={() => setIsLoaded(true)}
        className={`${className} transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        aria-label={alt}
      />
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
};
