import {
  Avatar, Button, Flex, Space,
} from 'antd'
import {
  Bubble,
} from '@ant-design/x'
import {
} from '@ant-design/icons'
import { CheckOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { BotIcon } from './BotIcon'


export const InterviewRequest = ({ message, onAction, isCurrent }) => (
  <Bubble
    variant="borderless"
    content={(
      <Flex vertical gap={12}>
        {message}
        {isCurrent && (
          <Space size={16}>
            <Button
              style={{ boxShadow: 'none' }}
              onClick={() => onAction('yes')}
              type="primary"
              size="small"
              icon={<CheckOutlined />}
            >
              Proceed
            </Button>
          </Space>
        )}
      </Flex>
    )}
    avatar={<Avatar icon={<BotIcon />} />}
  />
)
