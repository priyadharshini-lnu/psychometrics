import {
  useLayoutEffect, useRef, FC, useState,
} from 'react'
import {
  Button, Popover, Space,
} from 'antd'
import { MinusOutlined, PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { AccessibilityIcon } from '~/glint/icons'
import styles from './FontSizeModifier.less'

const DEFAULT_STEP = 0.125
const MAX_REM_UNITS = 1.5
const MIN_REM_UNITS = 0.75

const { I18n } = window

type Props = {
  step?: number
}

export const FontsizeModifier:FC<Props> = ({ step }) => {
  const htmlRef = useRef<HTMLHtmlElement|null>(null)
  const [open, setOpen] = useState(false)
  const stepValue = step || DEFAULT_STEP
  useLayoutEffect(() => {
    htmlRef.current = document.querySelector('html')
    document.addEventListener('keyup', keyUphandler)

    return () => {
      document.removeEventListener('keyup', keyUphandler)
    }
  }, [open])

  const keyUphandler = (e) => {
    if (e.code === 'Escape' && open) {
      setOpen(false)
    }
  }

  const increaseFontSize = () => {
    const newFontSize = getCurrentFontSize(htmlRef) + stepValue

    if (newFontSize <= MAX_REM_UNITS) {
      htmlRef.current?.style.setProperty('font-size', `${newFontSize}rem`)
    }
  }

  const decreaseFontSize = () => {
    const newFontSize = getCurrentFontSize(htmlRef) - stepValue

    if (newFontSize >= MIN_REM_UNITS) {
      htmlRef.current?.style.setProperty('font-size', `${newFontSize}rem`)
    }
  }

  const setDefaultFontSize = () => {
    if (getCurrentFontSize(htmlRef) !== 1) {
      htmlRef.current?.style.setProperty('font-size', '1rem')
    }
  }

  const handleBlur = (e) => {
    if (!(e.relatedTarget?.dataset?.buttonId === 'font-modifier')) {
      setOpen(false)
    }
  }

  return (
    <>
      <Popover
        trigger="click"
        open={open}
        getPopupContainer={triggerNode => triggerNode.parentNode as HTMLElement || document.body}
        content={(
          <Space.Compact onBlur={handleBlur}>
            <Button
              data-button-id="font-modifier"
              aria-label={I18n.t('glint.fontsize_modifier.increase_font')}
              onClick={increaseFontSize}
            >
              <PlusOutlined />
            </Button>
            <Button
              data-button-id="font-modifier"
              aria-label={I18n.t('glint.fontsize_modifier.reset_font')}
              onClick={setDefaultFontSize}
            >
              A
              <span className={styles.smallFont}>A</span>
            </Button>
            <Button
              data-button-id="font-modifier"
              aria-label={I18n.t('glint.fontsize_modifier.decrease_font')}
              onClick={decreaseFontSize}
            >
              <MinusOutlined />
            </Button>
          </Space.Compact>
        )}
      >
        <Button
          data-button-id="font-modifier"
          aria-label={I18n.t('glint.fontsize_modifier.change_font')}
          type="link"
          icon={<AccessibilityIcon />}
          styles={{ icon: { verticalAlign: 'bottom' } }}
          onClick={() => setOpen(!open)}
          onBlur={handleBlur}
          aria-expanded={open}
        />
      </Popover>
    </>
  )
}

const getCurrentFontSize = htmlRef => parseFloat(htmlRef.current?.style.getPropertyValue('font-size') || '1rem')
