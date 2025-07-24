import React, {
  createContext, useContext, ReactNode,
} from 'react'

interface I18n {
  t: (key: string, ...params) => string;
}

const I18nContext = createContext<I18n | undefined>(undefined)

export const useI18n = (): I18n => {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useRecording must be used within a I18nProvider')
  }
  return context
}

interface I18nProviderProps {
  I18n: I18n;
  children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ I18n, children }) => (
  <I18nContext.Provider value={I18n}>
    {children}
  </I18nContext.Provider>
)
