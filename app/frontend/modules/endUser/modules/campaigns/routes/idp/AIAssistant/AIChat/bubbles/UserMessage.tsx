import { Button, Space, Typography } from 'antd'
import { Bubble } from '@ant-design/x'
import {
  CopyOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import styles from './styles.less'


export const UserMessage = ({ message, error = null }) => (
  <Bubble
    placement="end"
    classNames={{ content: styles.userBubble }}
    styles={{
      content: { maxWidth: '80%' },
      footer: {
        maxWidth: '80%',
      },
    }}
    shape="round"
    content={message}
    footer={() => (
      <Space align="start">
        {error && (
          <Space align="start">
            <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
            <Typography.Text type="danger">
              {error}
            </Typography.Text>
          </Space>
        )}
        <Button
          color="primary"
          variant="text"
          size="small"
          icon={<CopyOutlined />}
        />
      </Space>
    )}
  />
)
