import React from 'react';
import { Dumbbell, History, TrendingUp, Settings } from 'lucide-react';

interface NavigationProps {
  activeTab: 'workout' | 'history' | 'analytics' | 'settings';
  setActiveTab: (tab: 'workout' | 'history' | 'analytics' | 'settings') => void;
  isWorkoutActive: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  isWorkoutActive,
}) => {
  const tabs = [
    {
      id: 'workout' as const,
      label: 'Workout',
      icon: Dumbbell,
      badge: isWorkoutActive,
    },
    {
      id: 'history' as const,
      label: 'History',
      icon: History,
    },
    {
      id: 'analytics' as const,
      label: 'Progress',
      icon: TrendingUp,
    },
    {
      id: 'settings' as const,
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-gym-card/95 backdrop-blur-xl border-t border-gym-border/80 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto grid grid-cols-4 px-2 py-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-150 relative touch-target tap-active ${
                isActive
                  ? 'text-gym-accent font-bold bg-gym-surface/60'
                  : 'text-gym-muted hover:text-gym-text hover:bg-gym-surface/30'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.75]'}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 bg-gym-cyan rounded-full animate-ping" />
                )}
                {tab.badge && (
                  <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 bg-gym-cyan rounded-full border border-gym-card" />
                )}
              </div>
              <span className={`text-[11px] mt-1 tracking-tight ${isActive ? 'font-bold text-gym-text' : 'font-medium'}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-1 w-6 h-0.5 bg-gym-accent rounded-full shadow-glow-emerald" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
