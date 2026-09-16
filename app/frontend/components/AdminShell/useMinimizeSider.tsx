import {
  FC, ReactNode, createContext, useContext, useEffect, useState,
} from 'react'

type ContextValue = {
  minimized: boolean
  register: (minimized: boolean) => void
}

const MinimizeSiderContext = createContext<ContextValue>({ minimized: false, register: () => {} })

// A page publishes this while mounted so the rail starts collapsed for the duration, without touching
// the user's own saved collapse preference (see useSiderCollapsed) - restored once the page unmounts.
export const MinimizeSiderProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [minimized, setMinimized] = useState(false)

  return (
    <MinimizeSiderContext.Provider value={{ minimized, register: setMinimized }}>
      {children}
    </MinimizeSiderContext.Provider>
  )
}

export const useIsSiderMinimized = () => useContext(MinimizeSiderContext).minimized

/** Force the rail to start collapsed for as long as the calling route is mounted. */
export const useMinimizeSider = () => {
  const { register } = useContext(MinimizeSiderContext)

  useEffect(() => {
    register(true)
    return () => register(false)
  }, [register])
}
