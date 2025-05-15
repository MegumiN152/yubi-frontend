import {GithubOutlined} from '@ant-design/icons';
import {DefaultFooter} from '@ant-design/pro-components';
import '@umijs/max';
import React from 'react';

const Footer: React.FC = () => {
  const defaultMessage = 'EL PSY CONGROO';
  const currentYear = new Date().getFullYear();
  return (
    <DefaultFooter
      style={{
        background: 'none',
      }}
      copyright={`${currentYear} ${defaultMessage}`}
      links={[
        {
          key: '赣ICP备2024038109号',
          title: '赣ICP备2024038109号',
          href: 'https://beian.miit.gov.cn/',
          blankTarget: true,
        },
        {
          key: 'github',
          title: <GithubOutlined/>,
          href: 'https://github.com/MegumiN152',
          blankTarget: true,
        },
        {
          key: 'GBC智能 BI',
          title: 'GBC智能 BI',
          href: 'https://github.com/MegumiN152',
          blankTarget: true,
        },
      ]}
    />
  );
};
export default Footer;
