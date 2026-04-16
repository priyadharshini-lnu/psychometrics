import {
  GlobalOutlined, WifiOutlined, VideoCameraOutlined, AudioOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { CHECKS } from './common'

export const CheckStepImage = ({ checkType }) => {
  if (checkType === CHECKS.browser) {
    return <GlobalOutlined style={{ fontSize: '1rem', color: 'var(--ant-primary-color)' }} />
  }
  if (checkType === CHECKS.network) {
    return <WifiOutlined style={{ fontSize: '1rem', color: 'var(--ant-primary-color)' }} />
  }
  if (checkType === CHECKS.video) {
    return <VideoCameraOutlined style={{ fontSize: '1rem', color: 'var(--ant-primary-color)' }} />
  }
  if (checkType === CHECKS.audio) {
    return <AudioOutlined style={{ fontSize: '1rem', color: 'var(--ant-primary-color)' }} />
  }
  return null
}
