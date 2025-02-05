import { FC, ComponentType, useRef } from 'react'
import { Button, ButtonProps } from 'antd'

type ScrollBehavior = {
  behavior: string, block: string
}

type Props = {
  Component: ComponentType<object>
  scrollBehavior?: ScrollBehavior
  onFocus?: (e)=>void
  onMouseDown?: (e)=>void
}

export const ScrollToViewOnFocus:FC<Props> = ({ Component, scrollBehavior = {}, ...componentProps }) => {
  const defaultScrollBehavior = { behavior: 'smooth', block: 'center' }
  const focusSourceRef = useRef<string | null>(null)

  const { onFocus, onMouseDown } = componentProps
  const handleFocus = (e) => {
    if (e.target && focusSourceRef.current !== 'pointer') {
      e.target.scrollIntoView({ ...defaultScrollBehavior, ...scrollBehavior })
    }
    onFocus && onFocus(e)
  }

  // to make sure scroll to view happens only when focused through keyboard and not through mouse/cursor
  const handleMouseDown = (e) => {
    focusSourceRef.current = 'pointer'
    onMouseDown && onMouseDown(e)
  }

  return (
    <Component onMouseDown={handleMouseDown} onFocus={handleFocus} {...componentProps} />
  )
}


export const ScrollToViewOnFocusButton:FC<ButtonProps & Pick<Props, 'scrollBehavior'>> = props => (
  <ScrollToViewOnFocus Component={Button} {...props} />)
