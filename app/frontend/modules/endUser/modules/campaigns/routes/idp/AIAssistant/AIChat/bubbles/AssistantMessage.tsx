import {
  Bubble,
} from '@ant-design/x'
import { BotIcon } from './BotIcon'

export const AssistantMessage = ({ message, isCurrent }) => (
  <Bubble
    typing={isCurrent ? {
      interval: 30,
      step: 5,
      effect: 'typing',
    } : false}
    placement="start"
    variant="borderless"
    content={message}
    avatar={<BotIcon />}
  />
)
