import React from 'react'
import { Button as AntButton, ButtonProps } from 'antd'
import { RightOutlined } from '@ant-design/icons'
import cs from 'classnames'
import styles from './styles.less'

interface Props extends ButtonProps {
  label: string | React.ReactNode
}

export const ButtonWithArrow: React.FC<Props> = ({
  label, className, ...props
}) => (
  <AntButton className={cs(styles.btn, className)} {...props}>
    {label}
    <RightOutlined className={styles.icon} />
  </AntButton>
)
