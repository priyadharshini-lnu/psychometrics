import { useLayoutEffect, useRef, FC } from 'react'
import {
  Button, Popover, Space,
} from 'antd'
import { MinusOutlined, PlusOutlined } from '@ant-design/icons'
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
  const stepValue = step || DEFAULT_STEP
  useLayoutEffect(() => {
    htmlRef.current = document.querySelector('html')
  }, [])

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

  return (
    <>
      <Popover
        trigger={['click']}
        getPopupContainer={triggerNode => triggerNode.parentNode as HTMLElement || document.body}
        content={(
          <Space.Compact>
            <Button aria-label={I18n.t('glint.fontsize_modifier.increase_font')} onClick={increaseFontSize}>
              <PlusOutlined />
            </Button>
            <Button aria-label={I18n.t('glint.fontsize_modifier.reset_font')} onClick={setDefaultFontSize}>
              A
              <span className={styles.smallFont}>A</span>
            </Button>
            <Button aria-label={I18n.t('glint.fontsize_modifier.decrease_font')} onClick={decreaseFontSize}>
              <MinusOutlined />
            </Button>
          </Space.Compact>
        )}
      >
        <Button
          aria-label={I18n.t('glint.fontsize_modifier.change_font')}
          type="link"
          icon={<AccessibilityIcon style={{ fontSize: '1rem' }} />}
        />
      </Popover>

    </>

  )
}

const getCurrentFontSize = htmlRef => parseFloat(htmlRef.current?.style.getPropertyValue('font-size') || '1rem')
