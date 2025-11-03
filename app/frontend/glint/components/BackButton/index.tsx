import { Button, ButtonProps } from 'antd'
import {
  ArrowLeftOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'

type Props = ButtonProps & {
  onPrev?: () => void
}

const { I18n } = window

export const BackButton = ({ onPrev, ...props }:Props) => (
  <Button
    {...props}
    type="text"
    icon={<ArrowLeftOutlined />}
    onClick={onPrev}
    aria-label={I18n.t('idp.go_to_previous_step')}
  />
)
