import { useMemo, useState } from 'react';
import { Layout, Menu, Button, Typography, Avatar, Dropdown, theme } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  SafetyOutlined,
  CrownOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AppstoreOutlined,
  FileSearchOutlined,
  ExperimentOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import type { ReactNode } from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Header, Sider, Content } = Layout;

interface MenuItemDef {
  key: string;
  icon: ReactNode;
  label: string;
  requiredPermission?: string;
  group: string;
}

const allMenuItems: MenuItemDef[] = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard', group: 'GENEL' },
  { key: '/users', icon: <UserOutlined />, label: 'Kullanıcılar', requiredPermission: 'USER_READ', group: 'YÖNETİM' },
  { key: '/roles', icon: <CrownOutlined />, label: 'Roller', requiredPermission: 'ROLES_READ', group: 'YÖNETİM' },
  { key: '/permissions', icon: <SafetyOutlined />, label: 'Yetkiler', requiredPermission: 'PERMISSION_READ', group: 'YÖNETİM' },
  { key: '/modules', icon: <AppstoreOutlined />, label: 'Modüller', requiredPermission: 'MODULE_READ', group: 'OPERASYON' },
  { key: '/analyses', icon: <FileSearchOutlined />, label: 'Analizler', requiredPermission: 'ANALYSIS_READ', group: 'OPERASYON' },
  { key: '/tests', icon: <ExperimentOutlined />, label: 'Testler', requiredPermission: 'TEST_READ', group: 'OPERASYON' },
  { key: '/services', icon: <ToolOutlined />, label: 'Servisler', requiredPermission: 'SERVICE_READ', group: 'OPERASYON' },
  { key: '/settings', icon: <SettingOutlined />, label: 'Ayarlar', group: 'GENEL' },
];

export default function MainLayout() {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { token: { borderRadiusLG } } = theme.useToken();

  const filteredItems = useMemo(
    () => allMenuItems.filter((item) => !item.requiredPermission || hasPermission(item.requiredPermission)),
    [hasPermission],
  );

  const menuItems = useMemo(() => {
    const groups: Record<string, typeof filteredItems> = {};
    for (const item of filteredItems) {
      if (!groups[item.group]) groups[item.group] = [];
      groups[item.group].push(item);
    }
    return Object.entries(groups).map(([label, children]) => ({
      type: 'group' as const,
      label,
      children: children.map(({ requiredPermission: _, group: __, ...rest }) => rest),
    }));
  }, [filteredItems]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: 'Profil' },
    { key: 'settings', icon: <SettingOutlined />, label: 'Ayarlar', onClick: () => navigate('/settings') },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Çıkış Yap',
      danger: true,
      onClick: async () => { await logout(); navigate('/login', { replace: true }); },
    },
  ];

  const currentPage = allMenuItems.find((i) => i.key === location.pathname)?.label ?? 'Sayfa';

  return (
    <div className="main-shell" style={{ minHeight: '100vh', background: '#f3f5f9', position: 'relative' }}>
      {/* Truck background silhouette */}
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: 'url(/truck_background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.18,
        filter: 'grayscale(100%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
    <Layout style={{ minHeight: '100vh', background: 'transparent', position: 'relative', zIndex: 1 }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          borderRight: '1px solid #e2e8f0',
          overflow: 'auto',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 10,
        }}
      >
        {/* Logo alanı */}
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: collapsed ? '0 22px' : '0 20px',
          borderBottom: '1px solid #e2e8f0',
        }}>
          <img
            src="/may-logo.png"
            alt="MAY Fren Sistemleri"
            style={{
              height: 40,
              width: collapsed ? 32 : 'auto',
              objectFit: 'contain',
              objectPosition: 'left',
              flexShrink: 0,
            }}
          />
        </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className="may-menu"
          style={{
            background: 'transparent',
            borderRight: 'none',
            padding: '8px 0',
          }}
        />
      </Sider>

      <Layout style={{
        marginLeft: collapsed ? 80 : 240,
        transition: 'margin-left 0.2s',
        background: 'transparent',
        minHeight: '100vh',
      }}>
        {/* Header */}
        <Header style={{
          padding: '0 28px',
          background: 'rgba(255, 255, 255, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          zIndex: 9,
          height: 64,
          backdropFilter: 'blur(8px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 16, width: 36, height: 36, color: '#1a2744' }}
            />
            <div>
              <Typography.Text style={{ fontSize: 16, fontWeight: 700, color: '#1a2744', display: 'block', lineHeight: 1.2 }}>
                {currentPage}
              </Typography.Text>
              <Typography.Text style={{ fontSize: 12, color: '#8a95a8' }}>
                MAY Fren Sistemleri
              </Typography.Text>
            </div>
          </div>

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
              padding: '6px 14px 6px 6px',
              borderRadius: 40,
              border: '1px solid #e2e8f0',
              background: '#f8f9fc',
              transition: 'all 0.2s',
            }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#d41920')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
            >
              <Avatar
                size={32}
                style={{
                  background: 'linear-gradient(135deg, #1a2744, #2d4470)',
                  fontWeight: 700,
                  fontSize: 13,
                  color: '#fff',
                }}
              >
                {user.username.substring(0, 2).toUpperCase()}
              </Avatar>
              {!collapsed && (
                <Typography.Text strong style={{ fontSize: 13, color: '#1a2744' }}>
                  {user.username}
                </Typography.Text>
              )}
            </div>
          </Dropdown>
        </Header>

        <Content style={{
          margin: 24,
          padding: 28,
          background: 'rgba(255, 255, 255, 0.65)',
          borderRadius: borderRadiusLG,
          minHeight: 280,
          border: '1px solid #e2e8f0',
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
    </div>
  );
}
