import React, { useRef, useState } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Form, Input, message, Modal, Select, Space, Tag, Tooltip, Typography } from 'antd';
import {
  deleteChartUsingPost,
  listChartByPageUsingPost,
  updateChartUsingPost,
} from "@/services/yubi/chartController";
import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';

const { Text } = Typography;
const { TextArea } = Input;

const ChartPreviewModal = ({ visible, chart, onCancel }) => {
  const chartOption = chart ? JSON.parse(chart.genChart || '{}') : {};
  
  return (
    <Modal
      open={visible}
      title="图表预览"
      width={800}
      footer={null}
      onCancel={onCancel}
    >
      <div style={{ minHeight: '400px' }}>
        <ReactECharts option={chartOption} style={{ height: '400px' }} />
      </div>
      <div style={{ marginTop: '20px' }}>
        <Text strong>分析目标：</Text>
        <div>{chart?.goal}</div>
        <Text strong style={{ marginTop: '10px', display: 'block' }}>分析结论：</Text>
        <div>{chart?.genResult || '暂无分析结论'}</div>
      </div>
    </Modal>
  );
};

const EditChartModal = ({ visible, chart, onCancel, onOk }) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (chart) {
      form.setFieldsValue({
        name: chart.name,
        goal: chart.goal,
        chartType: chart.chartType,
      });
    }
  }, [chart]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onOk(values);
      form.resetFields();
    } catch (error) {
      message.error('表单验证失败');
    }
  };

  return (
    <Modal
      open={visible}
      title="修改图表"
      okText="保存"
      cancelText="取消"
      onCancel={onCancel}
      onOk={handleOk}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="name"
          label="图表名称"
          rules={[{ required: true, message: '请输入图表名称' }]}
        >
          <Input placeholder="请输入图表名称" />
        </Form.Item>
        <Form.Item
          name="goal"
          label="分析目标"
          rules={[{ required: true, message: '请输入分析目标' }]}
        >
          <TextArea rows={4} placeholder="请输入分析目标" />
        </Form.Item>
        <Form.Item
          name="chartType"
          label="图表类型"
          rules={[{ required: true, message: '请选择图表类型' }]}
        >
          <Select>
            <Select.Option value="line">折线图</Select.Option>
            <Select.Option value="bar">柱状图</Select.Option>
            <Select.Option value="pie">饼图</Select.Option>
            <Select.Option value="scatter">散点图</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default () => {
  const actionRef = useRef<ActionType>();
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentChart, setCurrentChart] = useState<API.Chart>();

  const handlePreview = (record: API.Chart) => {
    setCurrentChart(record);
    setPreviewModalVisible(true);
  };

  const handleEdit = (record: API.Chart) => {
    setCurrentChart(record);
    setEditModalVisible(true);
  };

  const handleEditSubmit = async (values: any) => {
    if (!currentChart) return;
    try {
      await updateChartUsingPost({
        id: currentChart.id,
        ...values,
      });
      message.success('修改成功');
      setEditModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      message.error('修改失败');
    }
  };

  const handleDeleteChart = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个图表吗？此操作不可恢复。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteChartUsingPost({ id });
          message.success('删除成功');
          actionRef.current?.reload();
        } catch (error) {
          message.error('删除失败');
        }
      }
    });
  };

  const columns: ProColumns<API.Chart>[] = [
    {
      title: '序号',
      dataIndex: 'id',
      valueType: 'indexBorder',
      width: 48,
    },
    {
      title: '图表名称',
      dataIndex: 'name',
      copyable: true,
      ellipsis: true,
      tip: '名称过长会自动收缩',
    },
    {
      title: '分析目标',
      dataIndex: 'goal',
      ellipsis: true,
    },
    {
      title: '图表类型',
      dataIndex: 'chartType',
      valueType: 'select',
      valueEnum: {
        line: { text: '折线图' },
        bar: { text: '柱状图' },
        pie: { text: '饼图' },
        scatter: { text: '散点图' },
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueEnum: {
        wait: {
          text: '等待生成',
          status: 'default',
        },
        running: {
          text: '生成中',
          status: 'processing',
        },
        succeed: {
          text: '已生成',
          status: 'success',
        },
        failed: {
          text: '生成失败',
          status: 'error',
        },
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      valueType: 'dateTime',
      sorter: true,
    },
    {
      title: '创建者',
      dataIndex: 'userId',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => [
        <Tooltip title="预览">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handlePreview(record)}
          />
        </Tooltip>,
        <Tooltip title="编辑">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
        </Tooltip>,
        <Tooltip title="删除">
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteChart(record.id)}
          />
        </Tooltip>,
      ],
    },
  ];

  return (
    <>
      <ProTable<API.Chart>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params = {}, sort, filter) => {
          const { current, pageSize, ...restParams } = params;
          const sortField = Object.keys(sort || {})[0];
          const sortOrder = (sort || {})[sortField];
          
          const chartList = await listChartByPageUsingPost({
            current,
            pageSize,
            sortField,
            sortOrder: sortOrder === 'ascend' ? 'asc' : 'desc',
            ...restParams,
          });
          
          return {
            data: chartList.data.records,
            success: true,
            total: chartList.data.total,
          };
        }}
        columnsState={{
          persistenceKey: 'chart-manage-table',
          persistenceType: 'localStorage',
        }}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        pagination={{
          pageSize: 10,
          showQuickJumper: true,
        }}
        dateFormatter="string"
        headerTitle="图表管理"
      />
      <ChartPreviewModal
        visible={previewModalVisible}
        chart={currentChart}
        onCancel={() => {
          setPreviewModalVisible(false);
          setCurrentChart(undefined);
        }}
      />
      <EditChartModal
        visible={editModalVisible}
        chart={currentChart}
        onCancel={() => {
          setEditModalVisible(false);
          setCurrentChart(undefined);
        }}
        onOk={handleEditSubmit}
      />
    </>
  );
};