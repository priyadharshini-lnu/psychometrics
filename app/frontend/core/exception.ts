import { create } from 'zustand'

type Exception = {
  message: string
  type: string,
  meta: any, // eslint-disable-line @typescript-eslint/no-explicit-any
} | null

export const useExceptionStore = create<{ exception: Exception, setException:(exception: Exception) => void }>(set => ({
  exception: null,
  setException: (exception: Exception) => set(() => (
    { exception })),
}))
