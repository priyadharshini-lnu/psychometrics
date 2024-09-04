import React, { HTMLAttributes } from 'react'
import cs from 'classnames'
import styles from './BoxWithShadow.less'

interface Props extends HTMLAttributes<HTMLDivElement> {
  className?: string
  children?: React.ReactNode
}

export const BoxWithShadow: React.FC<Props> = ({
  className, children, ...props
}) => (
  <div className={cs(styles.box, className)} {...props}>
    {children}
  </div>
)
