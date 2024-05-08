import { useMedia as baseUseMedia } from 'use-media'
import { useWindowSize } from '~/hooks/useWindowSize'

export const useMedia = (type: 'md' | 'sm' | 'max-sm' | 'max-md') => {
  if (type === 'max-sm') return baseUseMedia({ maxWidth: 768 })
  if (type === 'max-md') return baseUseMedia({ maxWidth: 992 })
  if (type === 'sm') return baseUseMedia({ minWidth: 768 })
  if (type === 'md') return baseUseMedia({ minWidth: 992 })
  return baseUseMedia({ minWidth: 992 })
}

export const useWindowInnerSize = (element: HTMLElement) => useWindowSize((width, height) => {
  const vw = width * 0.01
  const vh = height * 0.01
  element.style.setProperty('--vh', `${vh}px`)
  element.style.setProperty('--vw', `${vw}px`)
})
