import Icon from '~/glint/icons/AccessibleIconsAntDesign'
import Lighthouse from '../assets/LighthouseIcon.svg?react'

export const BotIcon = ({ size = 32 }) => (
  <Icon style={{ fontSize: size }} component={Lighthouse} />
)
