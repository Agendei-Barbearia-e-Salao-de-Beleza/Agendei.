import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/explore" element={<ExploreScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/dashboard" element={<DashboardScreen />} />
        <Route path="/select-category" element={<SelectCategoryScreen />} />
        <Route path="/select-service" element={<SelectServiceScreen />} />
        <Route path="/select-date" element={<SelectDateScreen />} />
        <Route path="/select-time" element={<SelectTimeScreen />} />
        <Route path="/summary" element={<SummaryScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
