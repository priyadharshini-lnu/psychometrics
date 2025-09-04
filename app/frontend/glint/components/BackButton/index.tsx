import { Button, ButtonProps } from 'antd'
import {
  ArrowLeftOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'

type Props = ButtonProps & {
  onPrev?: () => void
}

export const BackButton = ({ onPrev, ...props }:Props) => (
  <Button
    {...props}
    type="text"
    icon={<ArrowLeftOutlined />}
    onClick={onPrev}
  />
)
