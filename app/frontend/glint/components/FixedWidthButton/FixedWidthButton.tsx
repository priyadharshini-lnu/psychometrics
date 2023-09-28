import { useRef, FC } from 'react'
import { Button, ButtonProps } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

export const FixedWidthButton: FC<ButtonProps> = ({ children, loading, ...props }) => {
  const buttonWidthRef = useRef<HTMLDivElement>(null)
  const styles = buttonWidthRef.current ? { width: buttonWidthRef.current.offsetWidth } : {}

  return (
    <Button {...props} style={styles} ref={buttonWidthRef}>{loading ? <LoadingOutlined /> : children}</Button>
  )
}
