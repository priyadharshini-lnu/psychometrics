import {
  useRef, FC, useState, useEffect,
} from 'react'
import { Button, ButtonProps } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

export const FixedWidthButton: FC<ButtonProps> = ({ children, loading, ...props }) => {
  const buttonWidthRef = useRef<HTMLDivElement>(null)
  const [style, setStyle] = useState({})

  useEffect(() => {
    if (!loading) {
      setStyle({ width: buttonWidthRef.current?.offsetWidth || {} })
    }
  }, [loading])

  return (
    <Button {...props} style={style} ref={buttonWidthRef}>{loading ? <LoadingOutlined /> : children}</Button>
  )
}
