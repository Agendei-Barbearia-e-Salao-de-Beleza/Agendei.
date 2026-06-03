import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors } from 'lucide-react';
import { supabase } from './lib/supabase';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { ExploreScreen } from './screens/ExploreScreen';
import { LoginScreen } from './screens/LoginScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { SelectCategoryScreen } from './screens/SelectCategoryScreen';
import { SelectServiceScreen } from './screens/SelectServiceScreen';
import { SelectDateScreen } from './screens/SelectDateScreen';
import { SelectTimeScreen } from './screens/SelectTimeScreen';
import { SummaryScreen } from './screens/SummaryScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { HistoryScreen } from './screens/HistoryScreen';

import { Toaster } from 'sonner';
import { StatusBar, Style } from '@capacitor/status-bar';


export const App: React.FC = () => {
  const [initialLoading, setInitialLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('/');
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('agendei_theme') || 'dark';
    const root = window.document.documentElement;
    const isLightMode = savedTheme === 'light' || (savedTheme === 'system' && window.matchMedia('(prefers-color-scheme: light)').matches);
    setIsLight(isLightMode);
    
    if (isLightMode) {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }

    // Sync native status bar style and color
    const syncStatusBar = async () => {
      try {
        if (isLightMode) {
          await StatusBar.setStyle({ style: Style.Light });
          await StatusBar.setBackgroundColor({ color: '#f4f4f5' });
        } else {
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#09090b' });
        }
      } catch (err) {
        console.log('StatusBar not available in browser:', err);
      }
    };
    syncStatusBar();

    // Check initial user authentication session
    const checkInitialSession = async () => {
      try {
        const rememberMe = localStorage.getItem('agendei_remember_me') === 'true';
        const { data: { session } } = await supabase.auth.getSession();
        
        // Premium load delay for the splash animation
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (session && rememberMe) {
          setInitialRoute('/dashboard');
        } else {
          setInitialRoute('/welcome');
        }
      } catch (err) {
        console.error('Erro na verificação de sessão inicial:', err);
        setInitialRoute('/welcome');
      } finally {
        setInitialLoading(false);
      }
    };
    checkInitialSession();
  }, []);

  return (
    <>
      <Toaster position="bottom-center" theme="dark" richColors offset={90} />
      
      <AnimatePresence mode="wait">
        {initialLoading ? (
          <motion.div 
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center p-6 ${isLight ? 'bg-zinc-50' : 'bg-zinc-950'} transition-colors duration-300`}
          >
            {/* Ambient luxury lights */}
            <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[50%] bg-[radial-gradient(ellipse_at_top_right,rgba(253,150,2,0.12),transparent_60%)] pointer-events-none z-0" />
            <div className={`absolute left-[-20%] bottom-[-10%] w-[60%] h-[50%] bg-[#fd9602] ${isLight ? 'opacity-[0.03]' : 'opacity-[0.07]'} blur-[120px] rounded-full pointer-events-none z-0`} />

            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex flex-col items-center justify-center space-y-6 relative z-10"
            >
              <motion.div 
                animate={{ 
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    "0 10px 15px -3px rgba(253,150,2,0.2)",
                    "0 20px 25px -5px rgba(253,150,2,0.4)",
                    "0 10px 15px -3px rgba(253,150,2,0.2)"
                  ]
                }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="w-20 h-20 bg-[#fd9602] flex items-center justify-center rounded-2xl shadow-xl shadow-[#fd9602]/25 cursor-pointer"
              >
                <Scissors className="w-10 h-10 text-zinc-950" strokeWidth={2} />
              </motion.div>
              
              <h1 className={`text-3xl font-black tracking-tighter ${isLight ? 'text-zinc-950' : 'text-white'}`}>
                Agendei<span className="text-[#fd9602]">.</span>
              </h1>
              
              {/* Premium minimal bar loader */}
              <div className={`w-36 h-1 rounded-full overflow-hidden relative ${isLight ? 'bg-zinc-200' : 'bg-zinc-900'}`}>
                <motion.div 
                  initial={{ left: "-100%" }}
                  animate={{ left: "100%" }}
                  transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
                  className="absolute top-0 bottom-0 w-1/2 bg-[#fd9602] rounded-full"
                />
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {!initialLoading && (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to={initialRoute} replace />} />
            <Route path="/welcome" element={<WelcomeScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />

            <Route path="/dashboard" element={<DashboardScreen />} />
            <Route path="/explore" element={<ExploreScreen />} />
            <Route path="/select-category" element={<SelectCategoryScreen />} />
            <Route path="/select-service" element={<SelectServiceScreen />} />
            <Route path="/select-date" element={<SelectDateScreen />} />
            <Route path="/select-time" element={<SelectTimeScreen />} />
            <Route path="/summary" element={<SummaryScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
            <Route path="/history" element={<HistoryScreen />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      )}
    </>
  );
};

export default App;
