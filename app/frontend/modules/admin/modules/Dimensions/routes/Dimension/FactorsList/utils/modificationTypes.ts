import { Factor } from '~/modules/admin/modules/campaigns/core/factors'

export const MODIFICATION_TYPE = {
  CREATE: 1,
  UPDATE: 2,
  DESTROY: 3,
} as const

export type ModificationType = typeof MODIFICATION_TYPE[keyof typeof MODIFICATION_TYPE]

export interface SubFactorBase {
  id?: string | number
  subFactorId?: string | number
  factorsSubFactorId?: string | number
  [key: string]: unknown
}

export interface SubFactorWithModificationType extends SubFactorBase {
  modificationType: ModificationType
}

export function addModificationTypes (
  currentSubFactors: Factor[],
  originalSubFactors: Factor[],
): SubFactorWithModificationType[] {
  const current = currentSubFactors || []
  const original = (originalSubFactors || []) as SubFactorBase[]

  const result: SubFactorWithModificationType[] = []

  // Process current sub-factors
  current.forEach((subFactor: Factor) => {
    const sf = subFactor as SubFactorBase
    const { id } = sf

    if (!id) {
      // No ID means it's a new record
      result.push({
        ...sf,
        modificationType: MODIFICATION_TYPE.CREATE,
      })
    } else {
      // Has ID means it's an update
      result.push({
        ...sf,
        modificationType: MODIFICATION_TYPE.UPDATE,
      })
    }
  })

  original.forEach((originalSubFactor) => {
    const { id } = originalSubFactor
    if (!id) return

    const existsInCurrent = current.some((f: Factor) => f.id === id)

    if (!existsInCurrent) {
      // This sub-factor was deleted
      result.push({
        ...originalSubFactor,
        modificationType: MODIFICATION_TYPE.DESTROY,
      })
    }
  })

  return result
}
