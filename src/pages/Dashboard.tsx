import { Card, Col, Row, Typography, Divider } from 'antd';
import { UserOutlined, CrownOutlined, SafetyOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  const statCards = [
    {
      title: 'Kullanıcılar',
      icon: <UserOutlined />,
      iconBg: '#e8f0fd',
      iconColor: '#6a8ac4',
      accentColor: '#6a8ac4',
      description: 'Sistem kullanıcıları',
    },
    {
      title: 'Roller',
      icon: <CrownOutlined />,
      iconBg: '#f5eafe',
      iconColor: '#9c6ac4',
      accentColor: '#9c6ac4',
      description: 'Tanımlı roller',
    },
    {
      title: 'Yetkiler',
      icon: <SafetyOutlined />,
      iconBg: '#fde8f0',
      iconColor: '#c4789a',
      accentColor: '#c4789a',
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
        borderBottom: '1px solid #f5d8e5',
      }}>
        <div>
          <Typography.Title level={3} style={{ margin: 0, fontWeight: 800, color: '#3d1020' }}>
            Merhaba, {user?.username}
          </Typography.Title>
          <Typography.Text style={{ fontSize: 14, color: '#c490aa' }}>
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
                border: '1px solid #f5d8e5',
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
                    color: '#4a9e6b',
                    fontSize: 12,
                    fontWeight: 600,
                    background: '#d4eedc',
                    padding: '3px 8px',
                    borderRadius: 20,
                  }}>
                    <ArrowUpOutlined style={{ fontSize: 10 }} /> Aktif
                  </div>
                </div>
                <Divider style={{ margin: '0 0 14px', borderColor: '#f5d8e5' }} />
                <div style={{ color: '#5a2a3a', fontSize: 14, fontWeight: 700 }}>{card.title}</div>
                <div style={{ color: '#c490aa', fontSize: 12, marginTop: 2 }}>{card.description}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
