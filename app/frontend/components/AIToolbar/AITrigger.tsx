import React from 'react'
import { createPortal } from 'react-dom'
import { Button } from 'antd'
import { AIEditorIcon } from '~/glint/icons'
import { useStablePosition } from './useStablePosition'
import styles from './styles.less'

interface AITriggerProps {
 container: HTMLElement
 withSpellchecker?: boolean
}

const ICON_WIDTH = 36
const ICON_HEIGHT = 32

const AITrigger: React.FC<AITriggerProps> = ({ container, withSpellchecker }) => {
  const { buttonRef, targetRef } = useStablePosition(container, withSpellchecker)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const target = targetRef.current
    if (!target) return

    target.focus()

    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      (target as HTMLInputElement).select()
    } else {
      const range = document.createRange()
      range.selectNodeContents(target)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
    }
  }


  return createPortal(
    <div
      ref={buttonRef}
      className={styles.aiTriggerBtn}
    >
      <Button
        type="text"
        onMouseDown={e => e.preventDefault()}
        onClick={handleClick}
        icon={<AIEditorIcon height={ICON_HEIGHT} width={ICON_WIDTH} />}
      />
    </div>,
    document.body,
  )
}


export default React.memo(AITrigger)
