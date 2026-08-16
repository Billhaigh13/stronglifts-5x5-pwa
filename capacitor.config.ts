import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.stronglifts.fivebyfive',
  appName: 'StrongLifts 5x5',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    backgroundColor: '#090d16'
  }
};

export default config;
