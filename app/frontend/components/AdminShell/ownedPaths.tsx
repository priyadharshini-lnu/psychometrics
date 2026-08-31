import {
  FC, ReactNode, createContext, useCallback, useContext,
} from 'react'

// A stable identity so consumers that memoise on the context value do not re-run on every render.
const NONE: string[] = []

const OwnedPathsContext = createContext<string[]>(NONE)

// A prefix owns a path only at a segment boundary, so '/admin' claims '/admin/users' but never '/administration'.
export const isOwnedPath = (path: string, prefixes: string[] = []): boolean => prefixes.some((prefix) => {
  const base = prefix.replace(/\/+$/, '')
  return path === base || path.startsWith(`${base}/`)
})

/** Publishes which paths the mounting app's router can push, so links below the shell can skip a full page load. */
export const OwnedPathsProvider: FC<{ prefixes?: string[], children: ReactNode }> = ({ prefixes, children }) => (
  <OwnedPathsContext.Provider value={prefixes ?? NONE}>{children}</OwnedPathsContext.Provider>
)

/** True for a path the surrounding router owns; false everywhere else, including outside any shell. */
export const useIsOwnedPath = (): ((path?: string) => boolean) => {
  const prefixes = useContext(OwnedPathsContext)

  return useCallback((path?: string) => (path ? isOwnedPath(path, prefixes) : false), [prefixes])
}
