import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.agendei.gerente',
  appName: 'Agendei Gerente',
  webDir: 'out',
  server: {
    url: 'https://agendei-n1t324epv-matheus-lucindos-projects.vercel.app',
    cleartext: false
  }
};

export default config;
