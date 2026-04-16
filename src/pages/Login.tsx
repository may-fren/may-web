import { useState } from 'react';
import { Button, Form, Input, message, Modal, Table, Tag, Typography } from 'antd';
import { UserOutlined, LockOutlined, DesktopOutlined, MobileOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, sessionLimitInfo, clearSessionLimit, forceLogin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [forceLoading, setForceLoading] = useState(false);

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
      if (!sessionLimitInfo) {
        navigate('/dashboard', { replace: true });
      }
    } catch (err: unknown) {
      const errorMsg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : undefined;
      message.error(errorMsg || 'Kullanici adi veya sifre hatali!');
    } finally {
      setLoading(false);
    }
  };

  const handleForceLogin = async () => {
    setForceLoading(true);
    try {
      await forceLogin();
      navigate('/dashboard', { replace: true });
    } catch {
      message.error('Giris yapilamadi. Lutfen tekrar deneyin.');
    } finally {
      setForceLoading(false);
    }
  };

  const sessionColumns = [
    {
      title: 'Platform',
      dataIndex: 'platform',
      key: 'platform',
      render: (platform: string) => (
        <Tag icon={platform === 'WEB' ? <DesktopOutlined /> : <MobileOutlined />}
             color={platform === 'WEB' ? 'blue' : 'green'}>
          {platform}
        </Tag>
      ),
    },
    {
      title: 'IP Adresi',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
    },
    {
      title: 'Cihaz',
      dataIndex: 'deviceInfo',
      key: 'deviceInfo',
      ellipsis: true,
      width: 200,
    },
  ];

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#f3f5f9',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        textAlign: 'center',
      }}>
        {/* Logo */}
        <img
          src="/may-logo.png"
          alt="MAY Fren Sistemleri"
          style={{ height: 100, marginBottom: 12 }}
        />
        <div style={{ marginBottom: 48 }} />

        {/* Form Card */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: '36px 32px',
          boxShadow: '0 2px 12px rgba(26,39,68,0.08)',
        }}>
          <div style={{ marginBottom: 28, textAlign: 'center' }}>
            <Typography.Title level={3} style={{ margin: 0, fontWeight: 700, color: '#1a2744' }}>
              Hosgeldiniz
            </Typography.Title>
            <Typography.Text style={{ color: '#8a95a8', fontSize: 14 }}>
              Devam etmek icin giris yapin
            </Typography.Text>
          </div>

          <Form onFinish={onFinish} autoComplete="off" size="large" layout="vertical">
            <Form.Item
              name="username"
              label={<span style={{ color: '#1a2744', fontWeight: 600 }}>Kullanici Adi</span>}
              rules={[{ required: true, message: 'Kullanici adi gerekli' }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#d41920' }} />}
                placeholder="Kullanici adinizi girin"
                style={{ height: 48, borderRadius: 12 }}
              />
            </Form.Item>
            <Form.Item
              name="password"
              label={<span style={{ color: '#1a2744', fontWeight: 600 }}>Sifre</span>}
              rules={[{ required: true, message: 'Sifre gerekli' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#d41920' }} />}
                placeholder="Sifrenizi girin"
                style={{ height: 48, borderRadius: 12 }}
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={loading}
                style={{
                  height: 52,
                  fontWeight: 700,
                  fontSize: 16,
                  borderRadius: 14,
                  letterSpacing: 0.3,
                }}
              >
                Giris Yap
              </Button>
            </Form.Item>
          </Form>
        </div>

        {/* Footer */}
        <Typography.Text style={{ color: 'rgba(138,149,168,0.6)', fontSize: 12, display: 'block', marginTop: 24 }}>
          MAY v1.0
        </Typography.Text>
      </div>

      {/* Session Limit Modal */}
      <Modal
        title="Aktif Oturum Limiti"
        open={!!sessionLimitInfo}
        onCancel={clearSessionLimit}
        footer={[
          <Button key="cancel" onClick={clearSessionLimit}>
            Vazgec
          </Button>,
          <Button key="force" type="primary" danger loading={forceLoading} onClick={handleForceLogin}>
            Mevcut Oturumu Kapat ve Giris Yap
          </Button>,
        ]}
        width={560}
      >
        <Typography.Paragraph>
          Bu platformda zaten aktif bir oturumunuz var. Devam ederseniz mevcut oturum sonlandirilacaktir.
        </Typography.Paragraph>
        {sessionLimitInfo && (
          <Table
            dataSource={sessionLimitInfo.activeSessions}
            columns={sessionColumns}
            rowKey="id"
            pagination={false}
            size="small"
          />
        )}
      </Modal>
    </div>
  );
}
