import {
  Bubble,
} from '@ant-design/x'
import Icon from '@ant-design/icons'
import Lighthouse from '../assets/LighthouseIcon.svg?react'

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
    avatar={<Icon style={{ fontSize: 32 }} component={Lighthouse} />}
  />
)
