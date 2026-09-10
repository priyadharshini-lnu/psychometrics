import * as t from 'io-ts'
import { FactorTR, Score } from '~/modules/admin/modules/campaigns/core/combinedScoring'

export const GroupedFactorTR = t.intersection([
  FactorTR,
  t.type({
    code: t.union([t.string, t.null]),
    position: t.number,
    campaignFactorGroupId: t.union([t.number, t.null]),
  }),
])

export const FactorGroupTR = t.type({
  id: t.string,
  name: t.string,
  position: t.number,
})

export type GroupedFactor = t.TypeOf<typeof GroupedFactorTR>
export type FactorGroup = t.TypeOf<typeof FactorGroupTR>

export interface AssessorInfo {
  id: string
  firstName: string
  lastName: string
  email: string
  index: number
}

export interface AssessmentColumnGroup {
  id: string
  name: string
  evaluatorIds: string[]
}

export interface ScoringRow {
  key: string
  isGroup: boolean
  label: string
  code?: string | null
  factorId?: string
  factor?: GroupedFactor
  children?: ScoringRow[]
}

export const buildAssessors = (scores: Score[]): AssessorInfo[] => {
  const uniqueEvaluators = new Map<string, Score['evaluator']>()
  scores.forEach((score) => {
    if (!uniqueEvaluators.has(score.evaluator.id)) {
      uniqueEvaluators.set(score.evaluator.id, score.evaluator)
    }
  })

  return [...uniqueEvaluators.values()]
    .sort((a, b) => a.email.localeCompare(b.email))
    .map((evaluator, position) => ({
      id: evaluator.id,
      firstName: evaluator.firstName,
      lastName: evaluator.lastName,
      email: evaluator.email,
      index: position + 1,
    }))
}

export const buildScoresLookup = (scores: Score[]): Map<string, Map<string, Score>> => {
  const lookup = new Map<string, Map<string, Score>>()
  scores.forEach((score) => {
    const assessmentScores = lookup.get(score.assessment.id) ?? new Map<string, Score>()
    if (!lookup.has(score.assessment.id)) {
      lookup.set(score.assessment.id, assessmentScores)
    }
    assessmentScores.set(score.evaluator.id, score)
  })
  return lookup
}

export const buildAssessmentGroups = (scores: Score[]): AssessmentColumnGroup[] => {
  const groups: AssessmentColumnGroup[] = []
  scores.forEach((score) => {
    const existing = groups.find(group => group.id === score.assessment.id)
    if (existing) {
      if (!existing.evaluatorIds.includes(score.evaluator.id)) {
        existing.evaluatorIds.push(score.evaluator.id)
      }
    } else {
      groups.push({
        id: score.assessment.id,
        name: score.assessment.name,
        evaluatorIds: [score.evaluator.id],
      })
    }
  })

  return groups.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
}

export const buildScoringRows = (groups: FactorGroup[], factors: GroupedFactor[]): ScoringRow[] => {
  const factorsByGroup = new Map<string, GroupedFactor[]>()
  const ungrouped: GroupedFactor[] = []

  factors.forEach((factor) => {
    const groupId = factor.campaignFactorGroupId !== null ? String(factor.campaignFactorGroupId) : null
    if (groupId && groups.some(group => group.id === groupId)) {
      const bucket = factorsByGroup.get(groupId) ?? []
      bucket.push(factor)
      factorsByGroup.set(groupId, bucket)
    } else {
      ungrouped.push(factor)
    }
  })

  const toIndicatorRow = (factor: GroupedFactor): ScoringRow => ({
    key: factor.id,
    isGroup: false,
    label: factor.name,
    code: factor.code,
    factorId: factor.factorId,
    factor,
  })

  const sortByPosition = (list: GroupedFactor[]) => [...list].sort((a, b) => a.position - b.position)

  const groupedRows: ScoringRow[] = [...groups]
    .sort((a, b) => a.position - b.position)
    .filter(group => (factorsByGroup.get(group.id)?.length ?? 0) > 0)
    .map(group => ({
      key: `group-${group.id}`,
      isGroup: true,
      label: group.name,
      children: sortByPosition(factorsByGroup.get(group.id) ?? []).map(toIndicatorRow),
    }))

  if (ungrouped.length > 0) {
    groupedRows.push(...sortByPosition(ungrouped).map(toIndicatorRow))
  }

  return groupedRows
}

export const collectGroupKeys = (rows: ScoringRow[]): string[] => (
  rows.filter(row => row.isGroup).map(row => row.key)
)
