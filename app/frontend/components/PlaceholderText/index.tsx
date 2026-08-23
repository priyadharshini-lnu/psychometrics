import { FC, ReactNode } from 'react'
import { Typography, theme } from 'antd'

interface Props {
  children: ReactNode
}

export const PlaceholderText: FC<Props> = ({ children }) => {
  const { token } = theme.useToken()

  return <Typography.Text style={{ color: token.colorTextTertiary }}>{children}</Typography.Text>
}
