import { Space, Typography } from 'antd'
import { Bubble } from '@ant-design/x'
import {
  ExclamationCircleOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import styles from './styles.less'


export const UserMessage = ({ message, error = null }) => (
  <Bubble
    placement="end"
    classNames={{ content: styles.userBubble }}
    styles={{
      body: { maxWidth: '80%' },
      footer: {
        maxWidth: '80%',
        marginTop: 0,
      },
    }}
    shape="round"
    content={message}
    footerPlacement="outer-start"
    footer={() => (
      <>
        {error && (
          <Space align="start">
            <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
            <Typography.Text type="danger">
              {error}
            </Typography.Text>
          </Space>
        )}
      </>
    )}
  />
)
