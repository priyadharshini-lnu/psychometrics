import {
  FC, ReactNode, createContext, useContext, useEffect, useMemo, useState,
} from 'react'
import { useDispatch } from 'react-redux'
import type { AppShellNav } from '@thetalententerprise/glint'
import { openSubmenu } from '~/modules/admin/core/ui/menu'

export type Subnav = {
  items: AppShellNav['items']
  selectedKeys?: string[]
}

type ContextValue = {
  subnav: Subnav | null
  register: (subnav: Subnav | null) => void
}

const SubnavContext = createContext<ContextValue>({ subnav: null, register: () => {} })

// A section publishes its own nav here; the shell renders it in the rail instead of the main menu.
export const SubnavProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [subnav, setSubnav] = useState<Subnav | null>(null)
  const dispatch = useDispatch()
  const hasSubnav = subnav != null
  const value = useMemo(() => ({ subnav, register: setSubnav }), [subnav])

  // A section that publishes a nav takes the rail, so a cold load lands on it rather than the main menu.
  useEffect(() => {
    if (hasSubnav) dispatch(openSubmenu())
  }, [hasSubnav, dispatch])

  return <SubnavContext.Provider value={value}>{children}</SubnavContext.Provider>
}

export const useSubnav = () => useContext(SubnavContext).subnav

/** Publish a section's nav for as long as the calling route is mounted. */
export const useRegisterSubnav = (items: AppShellNav['items'], selectedKeys?: string[]) => {
  const { register } = useContext(SubnavContext)
  const key = JSON.stringify(selectedKeys)

  useEffect(() => {
    register({ items, selectedKeys })
    return () => register(null)
  }, [key, items?.length])
}
