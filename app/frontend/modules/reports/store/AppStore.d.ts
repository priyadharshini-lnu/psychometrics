import { Assessment } from '~/modules/reports/core/interfaces/Assessment'

declare class AppStore {
  constructor()

  init(data): void

  occupations: object

  sortedOccupations: object

  mapFactors: object

  factors: object

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assessments: { [key: string]: any}[]

  innovationStyles: object

  mapSubfactorIdsByFactor: object

  subfactors: object

  isSubfactor(factorId: number): boolean

  factorsByAssessmentId(assessmentId: number): object[]

  getAssessmentById(assessmentId: number): Assessment

  report: {
    getFilterNameById(id: string): string
    filters: Array<{
      id: number
      assessmentId: number
      name: string
      minRequiredResponses: number
    }>
    dataSheetColumns: Array<{type: string, name: string}>
    campaignFactors: Array<{type: string, name: string}>
  }
}

export = new AppStore()
