import { useMedia as baseUseMedia } from 'react-use-media'

export const useMedia = (type: 'md' | 'sm' | 'max-sm' | 'max-md') => {
  if (type === 'max-sm') return baseUseMedia({ maxWidth: 768 })
  if (type === 'max-md') return baseUseMedia({ maxWidth: 992 })
  if (type === 'sm') return baseUseMedia({ minWidth: 768 })
  if (type === 'md') return baseUseMedia({ minWidth: 992 })
}
