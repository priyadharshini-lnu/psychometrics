import { Bubble } from '@ant-design/x'
import { Avatar } from 'antd'
import { BotIcon } from './BotIcon'


export const BotLoading = () => (
  <Bubble
    loading
    placement="start"
    variant="borderless"
    content="loading"
    avatar={<Avatar icon={<BotIcon />} />}
  />
)
