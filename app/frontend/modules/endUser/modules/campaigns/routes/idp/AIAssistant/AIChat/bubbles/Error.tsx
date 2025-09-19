import {
  Bubble,
} from '@ant-design/x'
import Icon, {
} from '@ant-design/icons'
import Lighthouse from '../assets/LighthouseIcon.svg?react'
import styles from './styles.less'


export const Error = ({ message, isCurrent }) => (
  <Bubble
    typing={isCurrent ? false : { step: 5 }}
    placement="start"
    variant="borderless"
    content={message}
    classNames={{ content: styles.errorBubble }}
    avatar={{ icon: <Icon style={{ fontSize: 32 }} component={Lighthouse} /> }}
  />
)
