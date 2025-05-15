import React, {useRef, useState} from 'react';
import type {ActionType, ProColumns} from '@ant-design/pro-table';
import ProTable, {TableDropdown} from '@ant-design/pro-table';
import {Button, Form, Image, Input, message, Modal, Select, Space, Tag, Tooltip, Typography} from 'antd';
import {
  addUserUsingPost,
  deleteUserUsingPost,
  listUserByPageUsingPost,
  updateUserUsingPost
} from "@/services/yubi/userController";
import {DeleteOutlined, EditOutlined, UserAddOutlined} from '@ant-design/icons';

const {Text} = Typography;

const AddUserForm = ({visible, onCreate, onCancel}) => {
  const [form] = Form.useForm();
  return (
    <Modal
      open={visible}
      title={
        <Space>
          <UserAddOutlined />
          <span>添加用户</span>
        </Space>
      }
      okText="创建"
      cancelText="取消"
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            form.resetFields();
            onCreate(values);
          })
          .catch((info) => {
            console.log('Validate Failed:', info);
          });
      }}
      width={560}
    >
      <Form
        form={form}
        layout="vertical"
        name="form_in_modal"
      >
        <Form.Item
          name="userName"
          label="用户名"
          rules={[{required: true, message: '请输入用户名!'}]}
        >
          <Input placeholder="请输入用户名"/>
        </Form.Item>
        <Form.Item
          name="userAccount"
          label="用户账户"
          rules={[{required: true, message: '用户账户是必填项!'}]}
        >
          <Input placeholder="请输入用户账户"/>
        </Form.Item>
        <Form.Item
          name="userPassword"
          label="用户密码"
          rules={[
            {required: true, message: '密码是必填项!'},
            {min: 8, type: 'string', message: '长度不能小于 8'},
          ]}
        >
          <Input.Password placeholder="请输入密码"/>
        </Form.Item>
        <Form.Item
          name="userProfile"
          label="个人简介"
        >
          <Input.TextArea 
            placeholder="请输入个人简介"
            rows={4}
            maxLength={500}
            showCount
          />
        </Form.Item>
        <Form.Item
          name="userRole"
          label="角色"
          rules={[{required: true, message: '请选择角色!'}]}
        >
          <Select placeholder="请选择用户角色">
            <Select.Option value="user">普通用户</Select.Option>
            <Select.Option value="admin">管理员</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default () => {
  const actionRef = useRef<ActionType>();
  const [visible, setVisible] = useState(false);
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);

  const handleAddUser = async (values) => {
    try {
      await addUserUsingPost(values);
      setVisible(false);
      message.success('添加用户成功')
      actionRef.current?.reload();
    } catch (error) {
      message.error('添加用户失败')
      console.error('Failed to add user:', error);
    }
  };

  const handleDeleteUser = async (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个用户吗？此操作不可恢复。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteUserUsingPost({id});
          message.success('用户删除成功')
          actionRef.current?.reload();
        } catch (error) {
          message.error('删除用户失败');
        }
      }
    });
  };

  const columns: ProColumns<API.LoginUserVO>[] = [
    {
      dataIndex: 'id',
      valueType: 'indexBorder',
      width: 48,
    },
    {
      title: '用户信息',
      dataIndex: 'userName',
      copyable: true,
      render: (_, record) => (
        <Space>
          <Image 
            src={record.userAvatar} 
            width={32} 
            height={32} 
            style={{ borderRadius: '50%' }}
            preview={{
              mask: <div style={{borderRadius: '50%'}}>查看</div>
            }}
          />
          <div>
            <div>{record.userName}</div>
            <Text type="secondary" style={{fontSize: '12px'}}>{record.userAccount}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: '个人简介',
      dataIndex: 'userProfile',
      ellipsis: true,
      copyable: true,
      search: false,
      render: (text) => (
        <Tooltip title={text || '暂无简介'}>
          <Text>{text || '暂无简介'}</Text>
        </Tooltip>
      ),
    },
    {
      title: '角色',
      dataIndex: 'userRole',
      valueType: 'select',
      valueEnum: {
        user: {
          text: '普通用户',
          status: 'Default',
        },
        admin: {
          text: '管理员',
          status: 'Success',
        },
      },
      render: (_, record) => (
        <Tag color={record.userRole === 'admin' ? '#108ee9' : '#87d068'}>
          {record.userRole === 'admin' ? '管理员' : '普通用户'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      render: (text, record, _, action) => [
        <Tooltip title="编辑">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              action?.startEditable?.(record.id);
            }}
          />
        </Tooltip>,
        <Tooltip title="删除">
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteUser(record.id)}
          />
        </Tooltip>
      ],
    },
  ];

  return (
    <>
      <ProTable<API.LoginUserVO>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params = {}, sort, filter) => {
          const {current, pageSize} = params;
          const userList = await listUserByPageUsingPost({
            current,
            pageSize,
            ...params,
          });
          return {
            data: userList.data.records,
            success: true,
            total: userList.data.total,
          };
        }}
        editable={{
          type: 'multiple',
          editableKeys,
          onChange: setEditableRowKeys,
          onSave: async (key, record) => {
            await updateUserUsingPost(record);
            message.success('更新成功');
            actionRef.current?.reload();
          },
          actionRender: (row, config, dom) => [dom.save, dom.cancel],
        }}
        columnsState={{
          persistenceKey: 'pro-table-singe-demos',
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
        headerTitle="用户管理"
        toolBarRender={() => [
          <Button 
            type="primary" 
            onClick={() => setVisible(true)}
            icon={<UserAddOutlined />}
          >
            添加用户
          </Button>,
        ]}
      />
      <AddUserForm
        visible={visible}
        onCreate={handleAddUser}
        onCancel={() => setVisible(false)}
      />
    </>
  );
};
