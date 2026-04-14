import { useCallback, useEffect, useState } from 'react';
import { Button, Card, Col, Form, Input, InputNumber, message, Modal, Popconfirm, Row, Select, Space, Table, Tag, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ClearOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { TablePaginationConfig } from 'antd';
import type { SorterResult } from 'antd/es/table/interface';
import {
  getModules,
  createModule,
  updateModule,
  deleteModule,
  type Module,
  type ModuleCreateRequest,
  type ModuleUpdateRequest,
  type ModuleListParams,
} from '../services/moduleService';
import { useAuth } from '../context/AuthContext';

interface Filters {
  name?: string;
  brand?: string;
  status?: string;
}

export default function Modules() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('MODULE_CREATE');
  const canUpdate = hasPermission('MODULE_UPDATE');
  const canDelete = hasPermission('MODULE_DELETE');

  const [data, setData] = useState<Module[]>([]);
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
  const [editingRecord, setEditingRecord] = useState<Module | null>(null);
  const [form] = Form.useForm();
  const [filterForm] = Form.useForm<Filters>();

  const fetchData = useCallback(async (
    page = 0,
    size = 10,
    sort = `${sortField},${sortOrder}`,
    currentFilters = filters,
  ) => {
    setLoading(true);
    try {
      const params: ModuleListParams = { page, size, sort };
      if (currentFilters.name) params.name = currentFilters.name;
      if (currentFilters.brand) params.brand = currentFilters.brand;
      if (currentFilters.status) params.status = currentFilters.status;

      const res = await getModules(params);
      setData(res.content);
      setPagination((prev) => ({
        ...prev,
        current: res.number + 1,
        pageSize: res.size,
        total: res.totalElements,
      }));
    } catch {
      message.error('Modüller yüklenirken hata oluştu');
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
    sorter: SorterResult<Module> | SorterResult<Module>[],
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

  const openEditModal = (record: Module) => {
    setEditingRecord(record);
    form.setFieldsValue({
      name: record.name,
      brand: record.brand,
      model: record.model,
      year: record.year,
      code: record.code,
      status: record.status,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editingRecord) {
        await updateModule(editingRecord.id, values as ModuleUpdateRequest);
        message.success('Modül güncellendi');
      } else {
        await createModule(values as ModuleCreateRequest);
        message.success('Modül oluşturuldu');
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
      await deleteModule(id);
      message.success('Modül silindi');
      fetchData((pagination.current ?? 1) - 1, pagination.pageSize ?? 10);
    } catch {
      message.error('Modül silinemedi');
    }
  };

  const getSortOrder = (field: string) =>
    sortField === field ? (sortOrder === 'asc' ? 'ascend' as const : 'descend' as const) : undefined;

  const columns = [
    { title: 'Modül Adı', dataIndex: 'name', sorter: true, sortOrder: getSortOrder('name') },
    { title: 'Marka', dataIndex: 'brand', sorter: true, sortOrder: getSortOrder('brand') },
    { title: 'Model', dataIndex: 'model', sorter: true, sortOrder: getSortOrder('model') },
    { title: 'Yıl', dataIndex: 'year', sorter: true, sortOrder: getSortOrder('year') },
    { title: 'Kod', dataIndex: 'code', sorter: true, sortOrder: getSortOrder('code') },
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
      render: (_: unknown, record: Module) => (
        <Space>
          {canUpdate && (
            <Button type="link" icon={<EditOutlined />} onClick={() => openEditModal(record)}>Düzenle</Button>
          )}
          {canDelete && (
            <Popconfirm
              title="Bu modülü silmek istediğinize emin misiniz?"
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
        <Typography.Title level={3} style={{ margin: 0 }}>Modüller</Typography.Title>
        {canCreate && (
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            Yeni Modül
          </Button>
        )}
      </div>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Form form={filterForm} layout="vertical">
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="name" label="Modül Adı" style={{ marginBottom: 0 }}>
                <Input placeholder="Ara..." allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="brand" label="Marka" style={{ marginBottom: 0 }}>
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
            <Col span={8} style={{ display: 'flex', alignItems: 'flex-end' }}>
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
        title={editingRecord ? 'Modül Düzenle' : 'Yeni Modül'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => { setModalOpen(false); form.resetFields(); setEditingRecord(null); }}
        confirmLoading={saving}
        okText={editingRecord ? 'Güncelle' : 'Oluştur'}
        cancelText="İptal"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Modül Adı" rules={[{ required: true, message: 'Zorunlu alan' }]}>
            <Input placeholder="Örn: Fren Modülü A" />
          </Form.Item>
          <Form.Item name="brand" label="Marka" rules={[{ required: true, message: 'Zorunlu alan' }]}>
            <Input placeholder="Örn: MAY" />
          </Form.Item>
          <Form.Item name="model" label="Model" rules={[{ required: true, message: 'Zorunlu alan' }]}>
            <Input placeholder="Örn: BM-500" />
          </Form.Item>
          <Form.Item name="year" label="Yıl">
            <InputNumber style={{ width: '100%' }} placeholder="Örn: 2024" />
          </Form.Item>
          <Form.Item name="code" label="Kod" rules={[{ required: true, message: 'Zorunlu alan' }]}>
            <Input placeholder="Örn: MOD-001" />
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
