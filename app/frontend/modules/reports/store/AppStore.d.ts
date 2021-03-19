
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
}

export = new AppStore()
