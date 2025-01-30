
import { create } from 'zustand'


export const EXTEND_SESSION = 'user/extend-session'
export const extendSession = () => ({
  type: EXTEND_SESSION,
  request: {
    url: '/extend_session',
    loader: true,
    method: 'POST',
  },
})

interface LocalStorageState {
    nextTimeout: string | null;
    setNextTimeoutValue: (value: string | null) => void;
  }

export const useLocalStorageStore = create<LocalStorageState>(set => ({
  nextTimeout: null,
  setNextTimeoutValue: value => set({ nextTimeout: value }),
}))
