import {
  createContext, useContext, FC, ReactNode,
} from 'react'
import type { Template, UserIdp } from '../store'

interface IdpData {
  template: Template
  userIdp: UserIdp
}

const IdpDataContext = createContext<IdpData | null>(null)

export const IdpDataProvider: FC<{ value: IdpData; children: ReactNode }> = ({ value, children }) => (
  <IdpDataContext.Provider value={value}>{children}</IdpDataContext.Provider>
)

export const useTemplate = () => {
  const ctx = useContext(IdpDataContext)
  if (!ctx) throw new Error('useTemplate must be used within IdpDataProvider')
  return ctx.template
}

export const useUserIdp = () => {
  const ctx = useContext(IdpDataContext)
  if (!ctx) throw new Error('useUserIdp must be used within IdpDataProvider')
  return ctx.userIdp
}
