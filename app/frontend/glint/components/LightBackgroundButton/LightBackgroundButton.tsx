import { ReactNode, FC } from 'react'
import { Button, ButtonProps } from 'antd'
import cs from 'classnames'

import styles from './LightBackgroundButton.less'

type Props = {
  children?: ReactNode
  className?: string
} & ButtonProps


export const LightBackgroundButton: FC<Props> = ({ children, className, ...props }) => (
  <Button className={cs(styles.button, className)} {...props}>{children}</Button>
)
