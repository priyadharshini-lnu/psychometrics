import * as React from 'react'
import { useMedia } from 'react-use-media'

const defaultMediaQueryContext = {
  isMobile: false,
  isTablet: false,
  isDesktop: false,
}

export const MediaQueryContext = React.createContext(defaultMediaQueryContext)

export const GlintProvider = ({ children }) => {
  const isMobile = useMedia({
    maxWidth: 480,
  })
  const isTablet = useMedia({
    minwidth: 481,
    maxWidth: 768,
  })
  const isDesktop = useMedia({
    minWidth: 1025,
  })

  return <MediaQueryContext.Provider value={{ isMobile, isTablet, isDesktop }}>{children}</MediaQueryContext.Provider>
}
