import { InputRef } from 'antd'
import React, { useRef } from 'react'

import { useTimeout } from '~/hooks/useTimeout'

export function useInputFocus (ref: React.RefObject<InputRef>, delay = 200) {
  const focus = useRef(false)
  const setFocus = (shouldFocus: boolean) => {
    focus.current = shouldFocus
  }
  useTimeout(() => {
    if (ref.current && focus.current && document.activeElement !== ref.current.input) {
      focus.current = false
      ref.current.focus()
    }
  }, delay)
  return setFocus
}
