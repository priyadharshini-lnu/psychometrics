import { Typography, Progress, Space } from 'antd'
import { FC, useEffect, useState } from 'react'

interface Props {
  text: string
  onDestroy?: () => void
  timeout?: number
}

export const SelfDestroyText: FC<Props> = ({
  text, onDestroy, timeout = 10,
}) => {
  const [storedText, setText] = useState(text)
  const [countdown, setCountdown] = useState(timeout)

  useEffect(() => {
    if (countdown < 0) { return }

    const id = setTimeout(() => {
      if (countdown <= 0) {
        setText('')
        onDestroy && onDestroy()
      }
      setCountdown(countdown - 1)
    }, 1000)

    return () => {
      clearTimeout(id)
    }
  }, [countdown])

  return (
    storedText ? (
      <Space>
        <Typography.Text copyable={{ onCopy () { setCountdown(0) } }}>
          {storedText}
        </Typography.Text>
        {countdown ? (
          <Progress
            showInfo={false}
            type="circle"
            percent={countdown * (100 / timeout) - 1}
            size={14}
          />
        ) : ''}
      </Space>
    ) : null
  )
}
