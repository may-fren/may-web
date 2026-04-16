import { useEffect, useState } from 'react';
import { Button, Card, message, Popconfirm, Table, Tag, Typography } from 'antd';
import { DesktopOutlined, MobileOutlined, DeleteOutlined } from '@ant-design/icons';
import { getMySessionsApi, terminateSessionApi, type UserSession } from '../services/sessionService';

export default function Settings() {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const data = await getMySessionsApi();
      setSessions(data);
    } catch {
      message.error('Oturumlar yuklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleTerminate = async (sessionId: number) => {
    try {
      await terminateSessionApi(sessionId);
      message.success('Oturum sonlandirildi');
      fetchSessions();
    } catch {
      message.error('Oturum sonlandirilamadi');
    }
  };

  const columns = [
    {
      title: 'Platform',
      dataIndex: 'platform',
      key: 'platform',
      width: 120,
      render: (platform: string) => (
        <Tag icon={platform === 'WEB' ? <DesktopOutlined /> : <MobileOutlined />}
             color={platform === 'WEB' ? 'blue' : 'green'}>
          {platform}
        </Tag>
      ),
    },
    {
      title: 'Cihaz Bilgisi',
      dataIndex: 'deviceInfo',
      key: 'deviceInfo',
      ellipsis: true,
    },
    {
      title: 'IP Adresi',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 150,
    },
    {
      title: 'Giris Tarihi',
      dataIndex: 'loginDate',
      key: 'loginDate',
      width: 160,
      render: (date: string) => {
        if (!date) return '-';
        const d = date.replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1-$2-$3 $4:$5:$6');
        return d;
      },
    },
    {
      title: 'Son Aktivite',
      dataIndex: 'lastActivityDate',
      key: 'lastActivityDate',
      width: 160,
      render: (date: string) => {
        if (!date) return '-';
        const d = date.replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1-$2-$3 $4:$5:$6');
        return d;
      },
    },
    {
      title: '',
      key: 'actions',
      width: 100,
      render: (_: unknown, record: UserSession) => (
        record.currentSession ? (
          <Tag color="processing">Bu oturum</Tag>
        ) : (
          <Popconfirm
            title="Bu oturumu sonlandirmak istediginize emin misiniz?"
            onConfirm={() => handleTerminate(record.id)}
            okText="Evet"
            cancelText="Hayir"
          >
            <Button type="link" danger icon={<DeleteOutlined />} size="small">
              Sonlandir
            </Button>
          </Popconfirm>
        )
      ),
    },
  ];

  return (
    <div>
      <Typography.Title level={3}>Ayarlar</Typography.Title>

      <Card title="Aktif Oturumlar" style={{ marginBottom: 24 }}>
        <Typography.Paragraph type="secondary">
          Hesabiniza bagli tum aktif oturumlari gorebilir ve yonetebilirsiniz.
        </Typography.Paragraph>
        <Table
          dataSource={sessions}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={false}
          size="middle"
        />
      </Card>
    </div>
  );
}
