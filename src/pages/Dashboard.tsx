import { Card, Col, Row, Typography, Divider } from 'antd';
import { UserOutlined, CrownOutlined, SafetyOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  const statCards = [
    {
      title: 'Kullanıcılar',
      icon: <UserOutlined />,
      iconBg: '#eef1f8',
      iconColor: '#1a2744',
      accentColor: '#1a2744',
      description: 'Sistem kullanıcıları',
    },
    {
      title: 'Roller',
      icon: <CrownOutlined />,
      iconBg: '#fdedef',
      iconColor: '#d41920',
      accentColor: '#d41920',
      description: 'Tanımlı roller',
    },
    {
      title: 'Yetkiler',
      icon: <SafetyOutlined />,
      iconBg: '#e8f5ee',
      iconColor: '#2e8b57',
      accentColor: '#2e8b57',
      description: 'Tanımlı yetkiler',
    },
  ];

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 28,
        paddingBottom: 24,
        borderBottom: '1px solid #e2e8f0',
      }}>
        <div>
          <Typography.Title level={3} style={{ margin: 0, fontWeight: 800, color: '#1a2744' }}>
            Merhaba, {user?.username}
          </Typography.Title>
          <Typography.Text style={{ fontSize: 14, color: '#8a95a8' }}>
            MAY yönetim paneline genel bakış
          </Typography.Text>
        </div>
      </div>

      <Row gutter={[20, 20]}>
        {statCards.map((card) => (
          <Col xs={24} sm={12} lg={8} key={card.title}>
            <Card
              style={{
                borderRadius: 16,
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                boxShadow: 'none',
              }}
              styles={{ body: { padding: 0 } }}
            >
              <div style={{ height: 4, background: card.accentColor }} />
              <div style={{ padding: '20px 20px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: card.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    color: card.iconColor,
                  }}>
                    {card.icon}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    color: '#2e8b57',
                    fontSize: 12,
                    fontWeight: 600,
                    background: '#e8f5ee',
                    padding: '3px 8px',
                    borderRadius: 20,
                  }}>
                    <ArrowUpOutlined style={{ fontSize: 10 }} /> Aktif
                  </div>
                </div>
                <Divider style={{ margin: '0 0 14px', borderColor: '#e2e8f0' }} />
                <div style={{ color: '#1a2744', fontSize: 14, fontWeight: 700 }}>{card.title}</div>
                <div style={{ color: '#8a95a8', fontSize: 12, marginTop: 2 }}>{card.description}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
