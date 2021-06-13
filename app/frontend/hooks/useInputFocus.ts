import { Input } from 'antd'
import { useTimeout } from 'hooks/useTimeout'
import React, { useRef } from 'react'

export function useInputFocus (ref: React.RefObject<Input>, delay = 200) {
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
