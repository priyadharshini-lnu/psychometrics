import { FC, ReactNode } from 'react'
import { ConfigProvider, Typography, theme } from 'antd'

// The heading's own block margins would ride it off the centre line the row's controls share.
const TITLE_THEME = { components: { Typography: { titleMarginTop: 0, titleMarginBottom: 0 } } }

export const TableTitle: FC<{ children: ReactNode }> = ({ children }) => (
  <ConfigProvider theme={TITLE_THEME}>
    <Typography.Title level={3}>{children}</Typography.Title>
  </ConfigProvider>
)

// A section label sits on its table's cell text, which antd insets by Table's cellPaddingInline - the padding token.
export const SectionTitle: FC<{ children: ReactNode }> = ({ children }) => {
  const { token } = theme.useToken()

  return (
    <div style={{ paddingInlineStart: token.padding }}>
      <TableTitle>{children}</TableTitle>
    </div>
  )
}
