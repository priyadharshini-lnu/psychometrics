import { Sender } from '@ant-design/x'
import {
  SendOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'

export const CustomSender = ({
  ...props
}) => {
  const suffix = (_, info) => {
    const { SendButton } = info.components
    return (
      <SendButton
        icon={<SendOutlined style={{ fontSize: '1.25rem' }} />}
        type="text"
        shape="square"
        style={{
          color: 'var(--ant-primary-color)',
        }}
      />
    )
  }
  return (
    <Sender
      {...props}
      suffix={suffix}
    />
  )
}
