import { Divider, DividerProps } from 'antd'

type Props = DividerProps & {
  borderColor?: string
}

export const Separator = ({ borderColor = 'var(--light-grey-border)', ...props }: Props) => (
  <Divider
    {...props}
    style={{
      borderColor,
    }}
  />
)
