import { useState, useMemo, useCallback } from 'react'

export interface StableActions<T extends object> {
  set: <K extends keyof T>(key: K, value: T[K]) => void;
  setAll: (newMap: T) => void;
  remove: <K extends keyof T>(key: K) => void
  reset: () => void;
}

export interface Actions<T extends object> extends StableActions<T> {
  get: <K extends keyof T>(key: K) => T[K];
}

// This is a bug in eslint which is fixed in the latest version
const useMap = <T extends object>(initialMap: T = {} as T): [T, Actions<T>] => {
  const [map, set] = useState<T>(initialMap)

  const stableActions = useMemo<StableActions<T>>(
    () => ({
      set: (key, entry) => {
        set(prevMap => ({
          ...prevMap,
          [key]: entry,
        }))
      },
      setAll: (newMap: T) => {
        set(newMap)
      },
      remove: (key) => {
        set((prevMap) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [key]: omit, ...rest } = prevMap
          return rest as T
        })
      },
      reset: () => set(initialMap),
    }),
    [set],
  )

  const utils = {
    get: useCallback(key => map[key], [map]),
    ...stableActions,
  } as Actions<T>

  return [map, utils]
}

export default useMap
