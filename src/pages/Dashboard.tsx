import { useEffect, useState } from 'react';
import { Card, Col, Row, Typography, Divider, Table, Tag, Spin, Progress } from 'antd';
import {
  UserOutlined,
  CrownOutlined,
  SafetyOutlined,
  AppstoreOutlined,
  FileSearchOutlined,
  ExperimentOutlined,
  ToolOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuth } from '../context/AuthContext';
import { getUsers, type User } from '../services/userService';
import { getModules, type Module } from '../services/moduleService';
import { getAnalyses, type Analysis } from '../services/analysisService';
import { getTests, type Test } from '../services/testService';
import { getServices, type Service } from '../services/serviceService';
import { getRoles } from '../services/roleService';
import { getPermissions } from '../services/permissionService';

interface Stats {
  users: number;
  modules: number;
  analyses: number;
  tests: number;
  services: number;
  roles: number;
  permissions: number;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

/* ---- Mobile card list component ---- */
interface MobileListItem {
  id: number;
  title: string;
  subtitle?: string;
  status: string;
  date: string;
}

function MobileCardList({ items, statusColorMap }: { items: MobileListItem[]; statusColorMap?: Record<string, string> }) {
  const colorMap = statusColorMap || { ACTIVE: 'green', INACTIVE: 'red', BLOCKED: 'orange' };
  if (items.length === 0) {
    return <Typography.Text type="secondary" style={{ padding: 16, display: 'block' }}>Veri yok</Typography.Text>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 16px' }}>
      {items.map((item) => (
        <div
          key={item.id}
          style={{
            padding: '12px 14px',
            background: '#f8f9fc',
            borderRadius: 10,
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontWeight: 600, color: '#1a2744', fontSize: 13 }}>{item.title}</span>
            <Tag color={colorMap[item.status] || 'default'} style={{ margin: 0 }}>{item.status}</Tag>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {item.subtitle && (
              <span style={{ fontSize: 11, color: '#8a95a8' }}>{item.subtitle}</span>
            )}
            <span style={{ fontSize: 11, color: '#8a95a8', marginLeft: 'auto' }}>{item.date}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ users: 0, modules: 0, analyses: 0, tests: 0, services: 0, roles: 0, permissions: 0 });
  const [recentModules, setRecentModules] = useState<Module[]>([]);
  const [recentAnalyses, setRecentAnalyses] = useState<Analysis[]>([]);
  const [recentTests, setRecentTests] = useState<Test[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [allModules, setAllModules] = useState<Module[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [usersRes, modulesRes, analysesRes, testsRes, servicesRes, rolesRes, permsRes] = await Promise.all([
          getUsers({ page: 0, size: 100, sort: 'createdDate,desc' }),
          getModules({ page: 0, size: 100, sort: 'createdDate,desc' }),
          getAnalyses({ page: 0, size: 5, sort: 'createdDate,desc' }),
          getTests({ page: 0, size: 5, sort: 'createdDate,desc' }),
          getServices({ page: 0, size: 100, sort: 'createdDate,desc' }),
          getRoles({ page: 0, size: 1, sort: 'name,asc' }),
          getPermissions({ page: 0, size: 1, sort: 'name,asc' }),
        ]);

        setStats({
          users: usersRes.totalElements,
          modules: modulesRes.totalElements,
          analyses: analysesRes.totalElements,
          tests: testsRes.totalElements,
          services: servicesRes.totalElements,
          roles: rolesRes.totalElements,
          permissions: permsRes.totalElements,
        });

        setAllUsers(usersRes.content);
        setRecentUsers(
          [...usersRes.content]
            .filter((u) => u.lastLoginDate)
            .sort((a, b) => (b.lastLoginDate ?? '').localeCompare(a.lastLoginDate ?? ''))
            .slice(0, 5),
        );
        setRecentModules(modulesRes.content.slice(0, 5));
        setAllModules(modulesRes.content);
        setRecentAnalyses(analysesRes.content);
        setRecentTests(testsRes.content);
        setAllServices(servicesRes.content);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Distributions
  const userStatusDist = allUsers.reduce<Record<string, number>>((acc, u) => {
    acc[u.status] = (acc[u.status] || 0) + 1;
    return acc;
  }, {});

  const cityDist = allServices.reduce<Record<string, number>>((acc, s) => {
    acc[s.city] = (acc[s.city] || 0) + 1;
    return acc;
  }, {});
  const cityEntries = Object.entries(cityDist).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxCityCount = cityEntries.length > 0 ? cityEntries[0][1] : 1;

  const brandDist = allModules.reduce<Record<string, number>>((acc, m) => {
    acc[m.brand] = (acc[m.brand] || 0) + 1;
    return acc;
  }, {});
  const brandEntries = Object.entries(brandDist).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxBrandCount = brandEntries.length > 0 ? brandEntries[0][1] : 1;

  const statCards = [
    { title: 'Kullanıcılar', value: stats.users, icon: <UserOutlined />, iconBg: '#eef1f8', iconColor: '#1a2744', accentColor: '#1a2744' },
    { title: 'Modüller', value: stats.modules, icon: <AppstoreOutlined />, iconBg: '#fff3e0', iconColor: '#e67e22', accentColor: '#e67e22' },
    { title: 'Analizler', value: stats.analyses, icon: <FileSearchOutlined />, iconBg: '#e8f0fe', iconColor: '#2563eb', accentColor: '#2563eb' },
    { title: 'Testler', value: stats.tests, icon: <ExperimentOutlined />, iconBg: '#f3e8ff', iconColor: '#7c3aed', accentColor: '#7c3aed' },
    { title: 'Servisler', value: stats.services, icon: <ToolOutlined />, iconBg: '#e8f5ee', iconColor: '#2e8b57', accentColor: '#2e8b57' },
    { title: 'Roller', value: stats.roles, icon: <CrownOutlined />, iconBg: '#fdedef', iconColor: '#d41920', accentColor: '#d41920' },
    { title: 'Yetkiler', value: stats.permissions, icon: <SafetyOutlined />, iconBg: '#fef9e7', iconColor: '#d4a017', accentColor: '#d4a017' },
  ];

  const statusColorMap: Record<string, string> = {
    ACTIVE: 'green',
    INACTIVE: 'red',
    BLOCKED: 'orange',
  };

  const statusLabelMap: Record<string, string> = {
    ACTIVE: 'Aktif',
    INACTIVE: 'Pasif',
    BLOCKED: 'Bloklu',
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  // Mobile card data transforms
  const moduleCards: MobileListItem[] = recentModules.map((m) => ({
    id: m.id,
    title: m.name,
    subtitle: `${m.brand} / ${m.model}`,
    status: m.status,
    date: dayjs(m.createdDate, 'YYYYMMDDHHmmss').format('DD.MM.YYYY'),
  }));

  const analysisCards: MobileListItem[] = recentAnalyses.map((a) => ({
    id: a.id,
    title: a.name,
    subtitle: a.moduleName,
    status: a.status,
    date: dayjs(a.createdDate, 'YYYYMMDDHHmmss').format('DD.MM.YYYY'),
  }));

  const testCards: MobileListItem[] = recentTests.map((t) => ({
    id: t.id,
    title: t.name,
    subtitle: t.moduleName,
    status: t.status,
    date: dayjs(t.createdDate, 'YYYYMMDDHHmmss').format('DD.MM.YYYY'),
  }));

  const loginCards: MobileListItem[] = recentUsers.map((u) => ({
    id: u.id,
    title: u.username,
    subtitle: `${u.firstName} ${u.lastName}`,
    status: u.status,
    date: u.lastLoginDate ? dayjs(u.lastLoginDate, 'YYYYMMDDHHmmss').format('DD.MM.YYYY HH:mm') : '-',
  }));

  return (
    <div>
      {/* Header */}
      <div style={{
        marginBottom: isMobile ? 20 : 28,
        paddingBottom: isMobile ? 16 : 24,
        borderBottom: '1px solid #e2e8f0',
      }}>
        <Typography.Title level={isMobile ? 4 : 3} style={{ margin: 0, fontWeight: 800, color: '#1a2744' }}>
          Merhaba, {user?.username}
        </Typography.Title>
        <Typography.Text style={{ fontSize: isMobile ? 12 : 14, color: '#8a95a8' }}>
          MAY yönetim paneline genel bakış
        </Typography.Text>
      </div>

      {/* Stat Cards — mobile: horizontal scroll strip */}
      {isMobile ? (
        <div style={{
          display: 'flex',
          gap: 10,
          overflowX: 'auto',
          paddingBottom: 4,
          marginBottom: 20,
          WebkitOverflowScrolling: 'touch',
        }}>
          {statCards.map((card) => (
            <div
              key={card.title}
              style={{
                minWidth: 120,
                flex: '0 0 auto',
                borderRadius: 14,
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                background: '#fff',
              }}
            >
              <div style={{ height: 3, background: card.accentColor }} />
              <div style={{ padding: '14px 14px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, background: card.iconBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, color: card.iconColor,
                  }}>
                    {card.icon}
                  </div>
                  <Typography.Text style={{ fontSize: 22, fontWeight: 800, color: card.accentColor, lineHeight: 1 }}>
                    {card.value}
                  </Typography.Text>
                </div>
                <div style={{ color: '#1a2744', fontSize: 11, fontWeight: 600 }}>{card.title}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Row gutter={[16, 16]} style={{ marginBottom: 28 }}>
          {statCards.map((card) => (
            <Col xs={24} sm={12} md={8} lg={6} xl={6} key={card.title}>
              <Card
                style={{ borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: 'none' }}
                styles={{ body: { padding: 0 } }}
              >
                <div style={{ height: 4, background: card.accentColor }} />
                <div style={{ padding: '18px 20px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, background: card.iconBg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18, color: card.iconColor,
                    }}>
                      {card.icon}
                    </div>
                    <Typography.Text style={{ fontSize: 28, fontWeight: 800, color: card.accentColor, lineHeight: 1 }}>
                      {card.value}
                    </Typography.Text>
                  </div>
                  <div style={{ color: '#1a2744', fontSize: 13, fontWeight: 600 }}>{card.title}</div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Distribution Charts Row */}
      <Row gutter={[isMobile ? 12 : 16, isMobile ? 12 : 16]} style={{ marginBottom: isMobile ? 20 : 28 }}>
        {/* User Status Distribution */}
        <Col xs={24} md={8}>
          <Card
            title={<span style={{ fontWeight: 700, color: '#1a2744', fontSize: isMobile ? 13 : 14 }}>Kullanıcı Durumları</span>}
            style={{ borderRadius: 16, border: '1px solid #e2e8f0', height: '100%' }}
            styles={{ body: { padding: isMobile ? '12px 14px' : '16px 20px' } }}
          >
            {Object.entries(userStatusDist).length === 0 ? (
              <Typography.Text type="secondary">Veri yok</Typography.Text>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 16 }}>
                {Object.entries(userStatusDist).map(([status, count]) => (
                  <div key={status}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Tag color={statusColorMap[status] || 'default'}>{statusLabelMap[status] || status}</Tag>
                      <span style={{ fontWeight: 700, color: '#1a2744' }}>{count}</span>
                    </div>
                    <Progress
                      percent={Math.round((count / stats.users) * 100)}
                      strokeColor={statusColorMap[status] === 'green' ? '#2e8b57' : statusColorMap[status] === 'red' ? '#d41920' : '#e67e22'}
                      showInfo={false}
                      size="small"
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>

        {/* Service City Distribution */}
        <Col xs={24} md={8}>
          <Card
            title={<span style={{ fontWeight: 700, color: '#1a2744', fontSize: isMobile ? 13 : 14 }}>Servislerin Şehir Dağılımı</span>}
            style={{ borderRadius: 16, border: '1px solid #e2e8f0', height: '100%' }}
            styles={{ body: { padding: isMobile ? '12px 14px' : '16px 20px' } }}
          >
            {cityEntries.length === 0 ? (
              <Typography.Text type="secondary">Veri yok</Typography.Text>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {cityEntries.map(([city, count]) => (
                  <div key={city}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ fontSize: 12, color: '#1a2744', fontWeight: 600 }}>{city}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#2e8b57' }}>{count}</span>
                    </div>
                    <div style={{ height: 8, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${(count / maxCityCount) * 100}%`,
                        background: 'linear-gradient(90deg, #2e8b57, #3cb371)',
                        borderRadius: 4,
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>

        {/* Module Brand Distribution */}
        <Col xs={24} md={8}>
          <Card
            title={<span style={{ fontWeight: 700, color: '#1a2744', fontSize: isMobile ? 13 : 14 }}>Modül Marka Dağılımı</span>}
            style={{ borderRadius: 16, border: '1px solid #e2e8f0', height: '100%' }}
            styles={{ body: { padding: isMobile ? '12px 14px' : '16px 20px' } }}
          >
            {brandEntries.length === 0 ? (
              <Typography.Text type="secondary">Veri yok</Typography.Text>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {brandEntries.map(([brand, count]) => (
                  <div key={brand}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ fontSize: 12, color: '#1a2744', fontWeight: 600 }}>{brand}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#e67e22' }}>{count}</span>
                    </div>
                    <div style={{ height: 8, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${(count / maxBrandCount) * 100}%`,
                        background: 'linear-gradient(90deg, #e67e22, #f39c12)',
                        borderRadius: 4,
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Recent Tables Row */}
      <Row gutter={[isMobile ? 12 : 16, isMobile ? 12 : 16]} style={{ marginBottom: isMobile ? 20 : 28 }}>
        {/* Recent Modules */}
        <Col xs={24} lg={12}>
          <Card
            title={<span style={{ fontWeight: 700, color: '#1a2744', fontSize: isMobile ? 13 : 14 }}>Son Eklenen Modüller</span>}
            style={{ borderRadius: 16, border: '1px solid #e2e8f0' }}
            styles={{ body: { padding: 0 } }}
          >
            {isMobile ? (
              <MobileCardList items={moduleCards} />
            ) : (
              <Table
                rowKey="id"
                dataSource={recentModules}
                pagination={false}
                size="small"
                columns={[
                  { title: 'Ad', dataIndex: 'name', ellipsis: true },
                  { title: 'Marka', dataIndex: 'brand' },
                  { title: 'Model', dataIndex: 'model' },
                  {
                    title: 'Durum',
                    dataIndex: 'status',
                    render: (s: string) => <Tag color={s === 'ACTIVE' ? 'green' : 'red'}>{s}</Tag>,
                  },
                  {
                    title: 'Tarih',
                    dataIndex: 'createdDate',
                    render: (d: string) => dayjs(d, 'YYYYMMDDHHmmss').format('DD.MM.YYYY'),
                  },
                ]}
              />
            )}
          </Card>
        </Col>

        {/* Recent Analyses */}
        <Col xs={24} lg={12}>
          <Card
            title={<span style={{ fontWeight: 700, color: '#1a2744', fontSize: isMobile ? 13 : 14 }}>Son Eklenen Analizler</span>}
            style={{ borderRadius: 16, border: '1px solid #e2e8f0' }}
            styles={{ body: { padding: 0 } }}
          >
            {isMobile ? (
              <MobileCardList items={analysisCards} />
            ) : (
              <Table
                rowKey="id"
                dataSource={recentAnalyses}
                pagination={false}
                size="small"
                columns={[
                  { title: 'Ad', dataIndex: 'name', ellipsis: true },
                  { title: 'Modül', dataIndex: 'moduleName' },
                  {
                    title: 'Durum',
                    dataIndex: 'status',
                    render: (s: string) => <Tag color={s === 'ACTIVE' ? 'green' : 'red'}>{s}</Tag>,
                  },
                  {
                    title: 'Tarih',
                    dataIndex: 'createdDate',
                    render: (d: string) => dayjs(d, 'YYYYMMDDHHmmss').format('DD.MM.YYYY'),
                  },
                ]}
              />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[isMobile ? 12 : 16, isMobile ? 12 : 16]}>
        {/* Recent Tests */}
        <Col xs={24} lg={12}>
          <Card
            title={<span style={{ fontWeight: 700, color: '#1a2744', fontSize: isMobile ? 13 : 14 }}>Son Eklenen Testler</span>}
            style={{ borderRadius: 16, border: '1px solid #e2e8f0' }}
            styles={{ body: { padding: 0 } }}
          >
            {isMobile ? (
              <MobileCardList items={testCards} />
            ) : (
              <Table
                rowKey="id"
                dataSource={recentTests}
                pagination={false}
                size="small"
                columns={[
                  { title: 'Ad', dataIndex: 'name', ellipsis: true },
                  { title: 'Modül', dataIndex: 'moduleName' },
                  {
                    title: 'Durum',
                    dataIndex: 'status',
                    render: (s: string) => <Tag color={s === 'ACTIVE' ? 'green' : 'red'}>{s}</Tag>,
                  },
                  {
                    title: 'Tarih',
                    dataIndex: 'createdDate',
                    render: (d: string) => dayjs(d, 'YYYYMMDDHHmmss').format('DD.MM.YYYY'),
                  },
                ]}
              />
            )}
          </Card>
        </Col>

        {/* Recent Logins */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <span style={{ fontWeight: 700, color: '#1a2744', fontSize: isMobile ? 13 : 14 }}>
                <ClockCircleOutlined style={{ marginRight: 8 }} />
                Son Giriş Yapan Kullanıcılar
              </span>
            }
            style={{ borderRadius: 16, border: '1px solid #e2e8f0' }}
            styles={{ body: { padding: 0 } }}
          >
            {isMobile ? (
              <MobileCardList items={loginCards} statusColorMap={statusColorMap} />
            ) : (
              <Table
                rowKey="id"
                dataSource={recentUsers}
                pagination={false}
                size="small"
                columns={[
                  { title: 'Kullanıcı', dataIndex: 'username' },
                  {
                    title: 'Ad Soyad',
                    render: (_: unknown, r: User) => `${r.firstName} ${r.lastName}`,
                  },
                  {
                    title: 'Durum',
                    dataIndex: 'status',
                    render: (s: string) => <Tag color={statusColorMap[s] || 'default'}>{statusLabelMap[s] || s}</Tag>,
                  },
                  {
                    title: 'Son Giriş',
                    dataIndex: 'lastLoginDate',
                    render: (d: string | null) => d ? dayjs(d, 'YYYYMMDDHHmmss').format('DD.MM.YYYY HH:mm') : '-',
                  },
                ]}
              />
            )}
          </Card>
        </Col>
      </Row>

      <Divider style={{ margin: isMobile ? '20px 0 8px' : '28px 0 8px' }} />
      <Typography.Text style={{ color: 'rgba(138,149,168,0.5)', fontSize: 11 }}>
        Veriler anlık olarak API&apos;den çekilmektedir.
      </Typography.Text>
    </div>
  );
}
