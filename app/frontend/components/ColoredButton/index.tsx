import React from 'react'
import { Button } from 'antd'
import ButtonColor from 'constants/buttonColor'
import cs from 'classnames'
import styles from './ColoredButtonStyle.scss'

interface ButtonProps {
  style?: object,
  type?: 'default' | 'primary',
  icon?: JSX.Element,
  className?: string,
  onClick?: () => void,
  disabled?: boolean,
}

interface Props extends ButtonProps {
  color: ButtonColor,
  children: React.ReactNode,
}

export default function ColoredButton (props: Props) {
  const {
    color, children, className, ...passedButtonProps
  } = props
  const buttonProps = (passedButtonProps || {}) as ButtonProps

  const passedStyles = buttonProps.style || {}
  const newButtonStyles = {
    ...buttonProps, backgroundColor: color, borderColor: color, color: 'white',
  }

  buttonProps.style = { ...passedStyles, ...newButtonStyles }

  return (
    <Button {...buttonProps} className={cs(className, styles.coloredButton)}>
      {children}
    </Button>
  )
}
