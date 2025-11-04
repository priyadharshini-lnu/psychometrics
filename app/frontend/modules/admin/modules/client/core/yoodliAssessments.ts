import * as t from 'io-ts'
import { ResourceIdentifierTR } from '~/modules/admin/core/types/resource'

export const YoodliAssessmentTR = t.type({
  id: t.string,
  name: t.string,
  productId: t.string,
  projectId: t.string,
  createdAt: t.string,
  updatedAt: t.string,
})

export type YoodliAssessment = t.TypeOf<typeof YoodliAssessmentTR>

export const YoodliAssessmentsTR = t.intersection([
  ResourceIdentifierTR,
  YoodliAssessmentTR,
])

export type YoodliAssessments = t.TypeOf<typeof YoodliAssessmentsTR>
