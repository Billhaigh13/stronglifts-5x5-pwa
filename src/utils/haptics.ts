// HTML5 Vibration API wrapper for Android and mobile haptics

export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'timerComplete' | 'pr' = 'light') {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) {
    return;
  }

  try {
    switch (type) {
      case 'light':
        navigator.vibrate(25);
        break;
      case 'medium':
        navigator.vibrate(50);
        break;
      case 'heavy':
        navigator.vibrate(100);
        break;
      case 'timerComplete':
        // Pattern: vibrate, pause, vibrate
        navigator.vibrate([200, 100, 200, 100, 400]);
        break;
      case 'pr':
        navigator.vibrate([100, 50, 100, 50, 300]);
        break;
    }
  } catch {
    // Ignore unsupported browser permission issues
  }
}
