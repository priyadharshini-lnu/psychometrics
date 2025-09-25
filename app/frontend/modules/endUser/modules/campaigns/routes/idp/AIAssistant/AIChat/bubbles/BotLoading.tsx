import { Bubble } from '@ant-design/x'
import { BotIcon } from './BotIcon'


export const BotLoading = () => (
  <Bubble
    loading
    placement="start"
    variant="borderless"
    content="loading"
    avatar={{ icon: <BotIcon /> }}
  />
)
