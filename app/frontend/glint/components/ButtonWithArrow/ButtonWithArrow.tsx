import React from 'react'
import { Button as AntButton, ButtonProps } from 'antd'
import cs from 'classnames'
import styles from './styles.less'
import { DirectionalArrowIcon } from '~/glint'

interface Props extends ButtonProps {
  label: string | React.ReactNode
}

export const ButtonWithArrow: React.FC<Props> = ({
  label, className, ...props
}) => (
  <AntButton className={cs(styles.btn, className)} {...props}>
    <div>{label}</div>
    <DirectionalArrowIcon className={styles.icon} />
  </AntButton>
)
