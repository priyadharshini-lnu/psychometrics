import { Button, Space } from 'antd'
import { Bubble } from '@ant-design/x'
import {
  CopyOutlined,
} from '@ant-design/icons'
import styles from './styles.less'


export const UserMessage = ({ message }) => (
  <Bubble
    placement="end"
    classNames={{ content: styles.userBubble }}
    shape="round"
    content={message}
    footer={() => (
      <Space>
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
