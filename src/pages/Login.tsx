import { useState } from 'react';
import { Button, Form, Input, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const errorMsg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      message.error(errorMsg || 'Kullanıcı adı veya şifre hatalı!');
    } finally {
      setLoading(false);
    }
  };

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
              Hoşgeldiniz
            </Typography.Title>
            <Typography.Text style={{ color: '#8a95a8', fontSize: 14 }}>
              Devam etmek için giriş yapın
            </Typography.Text>
          </div>

          <Form onFinish={onFinish} autoComplete="off" size="large" layout="vertical">
            <Form.Item
              name="username"
              label={<span style={{ color: '#1a2744', fontWeight: 600 }}>Kullanıcı Adı</span>}
              rules={[{ required: true, message: 'Kullanıcı adı gerekli' }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#d41920' }} />}
                placeholder="Kullanıcı adınızı girin"
                style={{ height: 48, borderRadius: 12 }}
              />
            </Form.Item>
            <Form.Item
              name="password"
              label={<span style={{ color: '#1a2744', fontWeight: 600 }}>Şifre</span>}
              rules={[{ required: true, message: 'Şifre gerekli' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#d41920' }} />}
                placeholder="Şifrenizi girin"
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
                Giriş Yap
              </Button>
            </Form.Item>
          </Form>
        </div>

        {/* Footer */}
        <Typography.Text style={{ color: 'rgba(138,149,168,0.6)', fontSize: 12, display: 'block', marginTop: 24 }}>
          MAY v1.0
        </Typography.Text>
      </div>
    </div>
  );
}
