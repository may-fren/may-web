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
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sol: Marka paneli */}
      <div style={{
        width: '44%',
        background: 'linear-gradient(160deg, #0e1a30 0%, #1a2744 40%, #2d4470 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px 52px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Dekoratif daireler */}
        <div style={{
          position: 'absolute', width: 500, height: 500, borderRadius: '50%',
          background: 'rgba(212,25,32,0.06)', top: -180, right: -200,
        }} />
        <div style={{
          position: 'absolute', width: 320, height: 320, borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)', bottom: -100, left: -120,
        }} />
        <div style={{
          position: 'absolute', width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(212,25,32,0.04)', bottom: 180, right: -60,
        }} />

        {/* Kırmızı dekoratif çizgi */}
        <div style={{
          position: 'absolute',
          bottom: 120,
          left: 0,
          right: 0,
          height: 3,
          background: 'linear-gradient(90deg, transparent, #d41920, transparent)',
          opacity: 0.4,
        }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <img src="/logo-white.svg" alt="MAY" style={{ height: 64 }} />
        </div>

        {/* Orta: Slogan */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Typography.Text style={{
            color: 'rgba(255,255,255,0.70)',
            fontSize: 16,
            lineHeight: 1.7,
            display: 'block',
          }}>
            Güvenliğinizin Sembolü
          </Typography.Text>

          {/* Özellik listesi */}
          <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['Kullanıcı yönetimi', 'Rol tabanlı erişim kontrolü', 'Yetki yönetimi'].map((f) => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: 'rgba(212,25,32,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, color: '#fff', flexShrink: 0,
                }}>✓</div>
                <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alt */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Typography.Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>
            © 2025 MAY Fren Sistemleri. Tüm hakları saklıdır.
          </Typography.Text>
        </div>
      </div>

      {/* Sağ: Form paneli */}
      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f3f5f9',
        padding: '48px 40px',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div style={{ marginBottom: 36 }}>
            <Typography.Title level={2} style={{ margin: 0, fontWeight: 800, color: '#1a2744' }}>
              Tekrar hoş geldiniz
            </Typography.Title>
            <Typography.Text style={{ color: '#8a95a8', fontSize: 15 }}>
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
                style={{ height: 48, borderRadius: 10 }}
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
                style={{ height: 48, borderRadius: 10 }}
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
                  height: 50,
                  fontWeight: 700,
                  fontSize: 16,
                  borderRadius: 12,
                  letterSpacing: 0.3,
                }}
              >
                Giriş Yap
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
}
