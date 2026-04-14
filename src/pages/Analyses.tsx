import { useCallback, useEffect, useState } from 'react';
import { Button, Card, Col, Form, Input, message, Modal, Popconfirm, Row, Select, Space, Table, Tag, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ClearOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { TablePaginationConfig } from 'antd';
import type { SorterResult } from 'antd/es/table/interface';
import {
  getAnalyses,
  createAnalysis,
  updateAnalysis,
  deleteAnalysis,
  type Analysis,
  type AnalysisCreateRequest,
  type AnalysisUpdateRequest,
  type AnalysisListParams,
} from '../services/analysisService';
import { getModules, type Module } from '../services/moduleService';
import { useAuth } from '../context/AuthContext';

interface Filters {
  name?: string;
  status?: string;
}

export default function Analyses() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('ANALYSIS_CREATE');
  const canUpdate = hasPermission('ANALYSIS_UPDATE');
  const canDelete = hasPermission('ANALYSIS_DELETE');

  const [data, setData] = useState<Analysis[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filters, setFilters] = useState<Filters>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Analysis | null>(null);
  const [form] = Form.useForm();
  const [filterForm] = Form.useForm<Filters>();

  useEffect(() => {
    getModules({ page: 0, size: 1000 }).then((res) => setModules(res.content)).catch(() => {});
  }, []);

  const fetchData = useCallback(async (
    page = 0,
    size = 10,
    sort = `${sortField},${sortOrder}`,
    currentFilters = filters,
  ) => {
    setLoading(true);
    try {
      const params: AnalysisListParams = { page, size, sort };
      if (currentFilters.name) params.name = currentFilters.name;
      if (currentFilters.status) params.status = currentFilters.status;

      const res = await getAnalyses(params);
      setData(res.content);
      setPagination((prev) => ({
        ...prev,
        current: res.number + 1,
        pageSize: res.size,
        total: res.totalElements,
      }));
    } catch {
      message.error('Analizler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [sortField, sortOrder, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTableChange = (
    pag: TablePaginationConfig,
    _filters: Record<string, unknown>,
    sorter: SorterResult<Analysis> | SorterResult<Analysis>[],
  ) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    const newField = (s.field as string) || sortField;
    const newOrder = s.order === 'descend' ? 'desc' : 'asc';
    setSortField(newField);
    setSortOrder(newOrder);
    fetchData((pag.current ?? 1) - 1, pag.pageSize ?? 10, `${newField},${newOrder}`, filters);
  };

  const handleFilterSearch = () => {
    const values = filterForm.getFieldsValue();
    setFilters(values);
    fetchData(0, pagination.pageSize ?? 10, `${sortField},${sortOrder}`, values);
  };

  const handleFilterReset = () => {
    filterForm.resetFields();
    setFilters({});
    fetchData(0, pagination.pageSize ?? 10, `${sortField},${sortOrder}`, {});
  };

  const openCreateModal = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({ status: 'ACTIVE' });
    setModalOpen(true);
  };

  const openEditModal = (record: Analysis) => {
    setEditingRecord(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      moduleId: record.moduleId,
      note: record.note,
      status: record.status,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editingRecord) {
        await updateAnalysis(editingRecord.id, values as AnalysisUpdateRequest);
        message.success('Analiz güncellendi');
      } else {
        await createAnalysis(values as AnalysisCreateRequest);
        message.success('Analiz oluşturuldu');
      }
      setModalOpen(false);
      form.resetFields();
      setEditingRecord(null);
      fetchData((pagination.current ?? 1) - 1, pagination.pageSize ?? 10);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        message.error(axiosErr.response?.data?.message || 'İşlem başarısız');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAnalysis(id);
      message.success('Analiz silindi');
      fetchData((pagination.current ?? 1) - 1, pagination.pageSize ?? 10);
    } catch {
      message.error('Analiz silinemedi');
    }
  };

  const getSortOrder = (field: string) =>
    sortField === field ? (sortOrder === 'asc' ? 'ascend' as const : 'descend' as const) : undefined;

  const columns = [
    { title: 'Analiz Adı', dataIndex: 'name', sorter: true, sortOrder: getSortOrder('name') },
    { title: 'Açıklama', dataIndex: 'description', sorter: true, sortOrder: getSortOrder('description') },
    { title: 'Modül', dataIndex: 'moduleName', sorter: true, sortOrder: getSortOrder('moduleName') },
    { title: 'Not', dataIndex: 'note', ellipsis: true },
    {
      title: 'Durum',
      dataIndex: 'status',
      sorter: true,
      sortOrder: getSortOrder('status'),
      render: (status: string) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>{status}</Tag>
      ),
    },
    {
      title: 'Oluşturma Tarihi',
      dataIndex: 'createdDate',
      sorter: true,
      sortOrder: getSortOrder('createdDate'),
      render: (date: string) => dayjs(date, 'YYYYMMDDHHmmss').format('DD.MM.YYYY'),
    },
    ...((canUpdate || canDelete) ? [{
      title: 'İşlemler',
      render: (_: unknown, record: Analysis) => (
        <Space>
          {canUpdate && (
            <Button type="link" icon={<EditOutlined />} onClick={() => openEditModal(record)}>Düzenle</Button>
          )}
          {canDelete && (
            <Popconfirm
              title="Bu analizi silmek istediğinize emin misiniz?"
              onConfirm={() => handleDelete(record.id)}
              okText="Evet"
              cancelText="Hayır"
            >
              <Button type="link" danger icon={<DeleteOutlined />}>Sil</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    }] : []),
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>Analizler</Typography.Title>
        {canCreate && (
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            Yeni Analiz
          </Button>
        )}
      </div>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Form form={filterForm} layout="vertical">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="name" label="Analiz Adı" style={{ marginBottom: 0 }}>
                <Input placeholder="Ara..." allowClear />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="status" label="Durum" style={{ marginBottom: 0 }}>
                <Select placeholder="Tümü" allowClear>
                  <Select.Option value="ACTIVE">ACTIVE</Select.Option>
                  <Select.Option value="INACTIVE">INACTIVE</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12} style={{ display: 'flex', alignItems: 'flex-end' }}>
              <Space>
                <Button type="primary" icon={<SearchOutlined />} onClick={handleFilterSearch}>Ara</Button>
                <Button icon={<ClearOutlined />} onClick={handleFilterReset}>Temizle</Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />

      <Modal
        title={editingRecord ? 'Analiz Düzenle' : 'Yeni Analiz'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => { setModalOpen(false); form.resetFields(); setEditingRecord(null); }}
        confirmLoading={saving}
        okText={editingRecord ? 'Güncelle' : 'Oluştur'}
        cancelText="İptal"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Analiz Adı" rules={[{ required: true, message: 'Zorunlu alan' }]}>
            <Input placeholder="Örn: Fren Balata Analizi" />
          </Form.Item>
          <Form.Item name="description" label="Açıklama">
            <Input.TextArea rows={2} placeholder="Analiz açıklaması" />
          </Form.Item>
          <Form.Item name="moduleId" label="Modül" rules={[{ required: true, message: 'Zorunlu alan' }]}>
            <Select placeholder="Modül seçiniz" showSearch optionFilterProp="children">
              {modules.map((m) => (
                <Select.Option key={m.id} value={m.id}>{m.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="note" label="Not">
            <Input.TextArea rows={2} placeholder="Ek notlar" />
          </Form.Item>
          {editingRecord && (
            <Form.Item name="status" label="Durum" rules={[{ required: true, message: 'Zorunlu alan' }]}>
              <Select>
                <Select.Option value="ACTIVE">ACTIVE</Select.Option>
                <Select.Option value="INACTIVE">INACTIVE</Select.Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}
