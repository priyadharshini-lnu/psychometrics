import React from 'react'
import { Button } from 'antd'
import cs from 'classnames'
import ButtonColor from '~/constants/buttonColor'
import styles from './ColoredButtonStyle.less'

interface ButtonProps {
  style?: object,
  type?: 'default' | 'primary',
  icon?: JSX.Element,
  className?: string,
  onClick?: () => void,
  disabled?: boolean,
}

interface Props extends ButtonProps {
  color: ButtonColor | 'green' | 'grey',
  children: React.ReactNode,
}

const COLORS = {
  green: '#2CBE4F',
  grey: 'grey',
}
export default function ColoredButton (props: Props) {
  const {
    children, className, color, ...passedButtonProps
  } = props
  const buttonProps = (passedButtonProps || {}) as ButtonProps

  const passedStyles = buttonProps.style || {}
  const newButtonStyles = {
    ...buttonProps, backgroundColor: COLORS[color], borderColor: COLORS[color], color: 'white',
  }

  buttonProps.style = { ...passedStyles, ...newButtonStyles }

  return (
    <Button {...buttonProps} className={cs(className, styles.coloredButton)}>
      {children}
    </Button>
  )
}
