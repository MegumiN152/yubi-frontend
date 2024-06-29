import {
  deleteChartUsingPOST,
  listMyChartByPageUsingPOST,
  retryGenChartUsingPOST
} from '@/services/yubi/chartController';
import { useModel } from '@@/exports';
import {Avatar, Button, Card, Divider, Form, Input, List, message, Result, Select} from 'antd';
import ReactECharts from 'echarts-for-react';
import React, { useEffect, useState, useRef } from 'react';
import Search from "antd/es/input/Search";
import {useForm} from "antd/es/form/Form";
import { Modal } from 'antd/lib';
import {ExclamationCircleOutlined} from "@ant-design/icons";

/**
 * 我的图表页面
 * @constructor
 */
const MyChartPage: React.FC = () => {
  const [form] = useForm();
  const initSearchParams = {
    current: 1,
    pageSize: 4,
    sortField: 'createTime',
    sortOrder: 'desc',
  };

  const [searchParams, setSearchParams] = useState<API.ChartQueryRequest>({ ...initSearchParams });
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState ?? {};
  const [chartList, setChartList] = useState<API.Chart[]>();
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [modalVisible, setModalVisible] = useState(false);// 使用 useRef 存储定时器ID
  const [selectedItem, setSelectedItem] = useState<API.Chart | null>(null);
  const { confirm } = Modal;
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await listMyChartByPageUsingPOST(searchParams);
      if (res.data) {
        setChartList(res.data.records ?? []);
        setTotal(res.data.total ?? 0);
        // 隐藏图表的 title
        if (res.data.records) {
          res.data.records.forEach(data => {
            if (data.status === 'succeed') {
              const chartOption = JSON.parse(data.genChart ?? '{}');
              chartOption.title = undefined;
              data.genChart = JSON.stringify(chartOption);
            }
          })
        }
      } else {
        message.error('获取我的图表失败');
      }
    } catch (e: any) {
      message.error('获取我的图表失败，' + e.message);
    }
    setLoading(false);
  };
  //删除图表
  // 修改删除函数，增加确认框逻辑
  const deleteChart = async (id:number) => {
    let deleteRequest:API.DeleteRequest = {id: id};
    try {
      confirm({
        title: '确定要删除这个图表吗？',
        icon: <ExclamationCircleOutlined />,
        content: '删除后将无法恢复，请确认。',
        okText: '确认',
        cancelText: '取消',
        async  onOk() {
          // 用户点击确认删除时执行的操作
          try {
            const res = await deleteChartUsingPOST(deleteRequest);
            if(res.data === true){
              loadData()
            }else{
              message.error("删除图表失败，请重试！")
            }
          } catch (e) {
            message.error("删除图表失败" + e.message)
          }
        },
        onCancel() {
          // 用户取消删除时执行的操作
          console.log('取消删除');
        },
      });
    } catch (e) {
      message.error("删除图表失败" + e.message)
    }
  }

  const handleOpenModal = (item: API.Chart) => {
    setSelectedItem(item);
    setModalVisible(true);
    // 设置表单字段的值
    form.setFieldsValue({
      id: item.id,
      name: item.name,
      goal: item.goal,
      chartType: item.chartType,
      chartData: item.chartData,
    });
  };
  const handleCancelModal = () => {
    setModalVisible(false);
  };
  const handleSubmit = async (values: any) => {
    setModalVisible(false);
    console.log(values);

    try {
      const res = await retryGenChartUsingPOST(values);
      if (!res?.data) {
        message.error('分析失败,' + `${res.message}`);
      } else {
        message.success('正在重新生成，稍后请在我的图表页面刷新查看');
      }
    } catch (e: any) {
      message.error('分析失败，' + e.message);
    }
  };

  const startAutoRefresh = () => {
    stopAutoRefresh();  // 启动前先停止之前的定时器
    const interval = setInterval(loadData, 5000); // 每5秒刷新一次
    refreshIntervalRef.current = interval;
  };

  const stopAutoRefresh = () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  };

  useEffect(() => {
    loadData();
    startAutoRefresh(); // 开始自动刷新

    return () => {
      stopAutoRefresh(); // 清除定时器
    };
  }, [searchParams]);

  return (
    <div className="my-chart-page">
      <div>
        <Search placeholder="请输入图表名称" enterButton loading={loading} onSearch={(value) => {
          // 设置搜索条件
          setSearchParams({
            ...initSearchParams,
            name: value,
          })
        }}/>
        <Button onClick={loadData} style={{ marginLeft: 16 }} loading={loading}>刷新</Button>
        <Button onClick={startAutoRefresh} style={{ marginLeft: 8 }}>开始自动刷新</Button>
        <Button onClick={stopAutoRefresh} style={{ marginLeft: 8 }}>停止自动刷新</Button>
      </div>
      <div className="margin-16" />
      <Modal
        title="表单"
        visible={modalVisible}
        onCancel={handleCancelModal}
        footer={[
          <Button key="cancel" onClick={handleCancelModal}>取消</Button>,
          <Button key="submit" type="primary" onClick={() => { form.submit(); }}>重新生成</Button>,
        ]}
      >
        {selectedItem && (
          <Form form={form} onFinish={handleSubmit}>
            <Form.Item label="图表id" name="id" initialValue={selectedItem.id}>
              <Input />
            </Form.Item>
            <Form.Item label="图表名称" name="name" initialValue={selectedItem.name}>
              <Input />
            </Form.Item>
            <Form.Item label="分析目标" name="goal" initialValue={selectedItem.goal}>
              <Input />
            </Form.Item>
            <Form.Item label="原始数据" name="chartType" initialValue={selectedItem.chartType}>
              <Select
                placeholder="请选择图表类型"
                onChange={(value) => form.setFieldsValue({ chartType: value })}
              >
                <Select.Option value="折线图">折线图</Select.Option>
                <Select.Option value="柱状图">柱状图</Select.Option>
                <Select.Option value="堆叠图">堆叠图</Select.Option>
                <Select.Option value="饼图">饼图</Select.Option>
                <Select.Option value="雷达图">雷达图</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="原始数据" name="chartData" initialValue={selectedItem.chartData}>
                  <textarea
                    rows={15}
                    cols={50}
                  />
            </Form.Item>
          </Form>
        )}
      </Modal>

      <List
        grid={{
          gutter: 16,
          xs: 1,
          sm: 1,
          md: 1,
          lg: 2,
          xl: 2,
          xxl: 2,
        }}
        pagination={{
          onChange: (page, pageSize) => {
            setSearchParams({
              ...searchParams,
              current: page,
              pageSize,
            })
          },
          current: searchParams.current,
          pageSize: searchParams.pageSize,
          total: total,
        }}
        loading={loading}
        dataSource={chartList}
        renderItem={(item) => (
          <List.Item key={item.id}>
            <Card style={{width: '100%'}}>
              <List.Item.Meta
                avatar={<Avatar src={currentUser && currentUser.userAvatar}/>}
                title={item.name}
                description={
                  <div style={{display: "flex", justifyContent: "space-between"}}>
                    <div>{item.chartType ? '图表类型' + item.chartType : undefined}</div>
                    <div>{item.createTime}</div>
                    <div style={{marginTop: 1}}>
                      <Button type="primary"  onClick={() => {
                      deleteChart(item.id)
                    }}>删除</Button></div>
                  </div>
                }
              />
              <>
                {
                  item.status === 'wait' && <>
                    <Result
                      status="warning"
                      title="待生成"
                      subTitle={item.execMessage ?? '当前图表生成队列繁忙，请耐心等候'}
                    />
                  </>
                }
                {
                  item.status === 'running' && <>
                    <Result
                      status="info"
                      title="图表生成中"
                      subTitle={item.execMessage}
                    />
                  </>
                }
                {
                  item.status === 'succeed' && <>
                    <div style={{marginBottom: 16}}/>
                    <p>{'分析目标：' + item.goal}</p>
                    <div style={{marginBottom: 16}}/>
                    <ReactECharts option={item.genChart && JSON.parse(item.genChart)}/>
                    <Divider>结论</Divider>
                    <div>{item.genResult}</div>
                    <div style={{marginLeft: 540}}>
                      <Button type="primary" onClick={() => handleOpenModal(item)}>修改诉求</Button>
                    </div>
                  </>
                }
                {
                  item.status === 'failed' && <>
                    <Result
                      status="error"
                      title="图表生成失败"
                      subTitle={item.execMessage}
                    />
                  </>
                }
              </>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default MyChartPage

