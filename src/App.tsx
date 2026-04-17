import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import trTR from 'antd/locale/tr_TR';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Permissions from './pages/Permissions';
import Modules from './pages/Modules';
import Analyses from './pages/Analyses';
import Tests from './pages/Tests';
import Settings from './pages/Settings';

export default function App() {
  return (
    <ConfigProvider
      locale={trTR}
      theme={{
        token: {
          colorPrimary: '#d41920',
          colorSuccess: '#2e8b57',
          colorWarning: '#e8960c',
          colorError: '#d41920',
          colorInfo: '#1a2744',
          borderRadius: 12,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          colorBgLayout: 'transparent',
          controlHeight: 38,
        },
        components: {
          Button: {
            borderRadius: 10,
            controlHeight: 38,
            primaryShadow: '0 2px 10px rgba(212, 25, 32, 0.25)',
          },
          Card: {
            borderRadiusLG: 16,
            boxShadowTertiary: '0 2px 8px rgba(26,39,68,0.06), 0 1px 2px rgba(0,0,0,0.04)',
          },
          Table: {
            headerBg: '#f0f2f8',
            headerColor: '#1a2744',
            rowHoverBg: '#f8f9fc',
            borderColor: '#e2e8f0',
            headerBorderRadius: 10,
          },
          Input: {
            borderRadius: 8,
            controlHeight: 38,
          },
          Select: {
            borderRadius: 8,
            controlHeight: 38,
          },
          Modal: {
            borderRadiusLG: 18,
            titleFontSize: 18,
          },
          Menu: {
            itemBg: 'transparent',
            itemSelectedBg: 'rgba(212,25,32,0.08)',
            itemHoverBg: 'rgba(26,39,68,0.04)',
            itemSelectedColor: '#d41920',
            itemColor: '#3d4f6f',
            itemBorderRadius: 10,
            itemMarginInline: 8,
            iconSize: 18,
          },
          Tag: {
            borderRadiusSM: 6,
          },
          DatePicker: {
            borderRadius: 8,
            controlHeight: 38,
          },
          InputNumber: {
            borderRadius: 8,
            controlHeight: 38,
          },
        },
      }}
    >
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/roles" element={<Roles />} />
              <Route path="/permissions" element={<Permissions />} />
              <Route path="/modules" element={<Modules />} />
              <Route path="/analyses" element={<Analyses />} />
              <Route path="/tests" element={<Tests />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
}
