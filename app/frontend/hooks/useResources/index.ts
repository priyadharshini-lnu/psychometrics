import { BaseMeta } from './interfaces'
import { useResources as useResourcesFn } from './useResources'

export type UseResourceReturnType<R extends { id: string }, M extends BaseMeta> =
  ReturnType<typeof useResourcesFn<R, M>>

export const useResources = useResourcesFn
