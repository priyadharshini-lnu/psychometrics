
import {
  Space,
} from 'antd'

import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'
import styles from './styles.less'

const Portal = ({ children }) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  return mounted ? createPortal(children, document.body) : null
}

type BottomSheetProps = {
  isOpen: boolean
  children: React.ReactNode
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  children,
  isOpen,
}) => {
  if (!isOpen) return null
  return (
    <Portal>
      <Space className={styles.bottomSheetParent}>
        {children}
      </Space>
    </Portal>
  )
}
