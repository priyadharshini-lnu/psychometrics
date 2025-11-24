import {
  Bubble,
} from '@ant-design/x'
import Icon from '@ant-design/icons'
import Lighthouse from '../assets/LighthouseIcon.svg?react'

export const AssistantMessage = ({ message, isCurrent }) => (
  <Bubble
    typing={isCurrent ? { step: 5 } : false}
    placement="start"
    variant="borderless"
    content={message}
    avatar={{ icon: <Icon style={{ fontSize: 32 }} component={Lighthouse} /> }}
  />
)
