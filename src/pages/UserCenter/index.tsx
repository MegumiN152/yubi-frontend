import {getLoginUserUsingGet, updateMyUserUsingPost, uploadAvatarUsingPost} from '@/services/yubi/userController';
import {Avatar, Button, Card, Form, Input, message, Modal, Upload} from 'antd';
import {useEffect, useState} from 'react';
import {useModel} from "@@/exports";
import {UploadOutlined} from '@ant-design/icons';

const UserCenter = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setModalVisible] = useState(false);
  const [userData, setUserData] = useState<API.BaseResponseLoginUserVO_>();
  const {initialState} = useModel('@@initialState');
  const {currentUser} = initialState ?? {};
  const [avatarUrl, setAvatarUrl] = useState<string>();

  const fetchData = async () => {
    try {
      const [userRes] = await Promise.all([
        getLoginUserUsingGet(),
      ]);
      if (userRes.data) {
        setUserData(userRes);
      } else {
        message.error(userRes.message);
      }
    } catch (e) {
      message.error('获取信息失败');
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  /**
   * 签到逻辑
   */

  const handleEditProfile = () => {
    setModalVisible(true);
    form.setFieldsValue({userName: userData?.data?.userName});
    form.setFieldsValue({userRole: userData?.data?.userRole});
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', currentUser?.id.toString() || '');
      
      const res = await uploadAvatarUsingPost({}, formData);
      if (res.data) {
        setAvatarUrl(res.data);
        message.success('头像上传成功！');
        await fetchData(); // 刷新用户数据
      } else {
        message.error(res.message || '上传失败');
      }
    } catch (e) {
      message.error('头像上传失败');
    }
  };

  const handleSaveProfile = async () => {
    try {
      const values = await form.validateFields();
      const updatedUserInfo: API.UserUpdateMyRequest = {
        userName: values.userName,
        userProfile: values.userProfile,
      };
      const updateUserInfo = await updateMyUserUsingPost(updatedUserInfo);

      if (updateUserInfo.data) {
        message.success('保存成功！');
        setModalVisible(false);
        await fetchData(); // 刷新用户数据
      } else {
        message.error(updateUserInfo.message);
      }
    } catch (e) {
      message.error('信息保存失败');
    }
  };

  return (
    <div style={{ 
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      height: '100vh',
      padding: '40px',
    }}>
      <Card style={{
        width: '600px',
        textAlign: 'center',
        padding: 30,
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <div style={{ marginBottom: 24 }}>
          <Upload
            showUploadList={false}
            beforeUpload={(file) => {
              handleAvatarUpload(file);
              return false;
            }}
          >
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <Avatar 
                size={120} 
                src={userData?.data?.userAvatar}
                style={{ cursor: 'pointer' }}
              />
              <div style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                background: '#fff',
                borderRadius: '50%',
                padding: 4,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}>
                <UploadOutlined />
              </div>
            </div>
          </Upload>
        </div>
        <h2 style={{ fontSize: 28, margin: '16px 0' }}>{userData?.data?.userName}</h2>
        <p style={{ color: '#666', marginBottom: 12 }}>角色: {userData?.data?.userRole}</p>
        <p style={{ 
          color: '#666', 
          marginBottom: 24,
          padding: '0 40px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}>
          {userData?.data?.userProfile || '这个人很懒，还没有填写个人简介~'}
        </p>
        <Button type="primary" size="large" onClick={handleEditProfile}>
          编辑个人信息
        </Button>
      </Card>

      <Modal
        title="编辑个人信息"
        open={isModalVisible}
        onOk={handleSaveProfile}
        onCancel={() => setModalVisible(false)}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item 
            label="昵称" 
            name="userName"
            rules={[{ required: true, message: '请输入昵称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item 
            label="个人简介" 
            name="userProfile"
          >
            <Input.TextArea rows={4} placeholder="请输入个人简介" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
export default UserCenter;
