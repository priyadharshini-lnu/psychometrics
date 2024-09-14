// TODO: remove portals after implementing all pages in react
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { DefaultAntThemeWrapper } from '~/glint'
import { MainMenuInternal } from './MainMenu'

export const Portal = ({ Component, container, ...props }) => {
  const [innerHtmlEmptied, setInnerHtmlEmptied] = useState(false)
  useEffect(() => {
    if (!innerHtmlEmptied) {
      container.innerHTML = ''
      setInnerHtmlEmptied(true)
    }
  }, [innerHtmlEmptied])
  if (!innerHtmlEmptied) return null
  return createPortal(<Component {...props} />, container)
}

export const PortalMenu = () => {
  const node = document.getElementById('main_menu')

  return (
    <DefaultAntThemeWrapper>
      <Portal Component={MainMenuInternal} container={node} />
    </DefaultAntThemeWrapper>
  )
}
