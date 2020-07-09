import { useMedia as baseUseMedia } from 'react-use-media'

export const useMedia = (type: 'md' | 'sm') => {
  if (type === 'sm') return baseUseMedia({ minWidth: 768 })
  if (type === 'md') return baseUseMedia({ minWidth: 992 })
}
