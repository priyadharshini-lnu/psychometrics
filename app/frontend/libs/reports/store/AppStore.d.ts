
declare class AppStore {
  constructor()

  init(data): void

  occupations: object

  sortedOccupations: object

  mapFactors: object

  assessments: object

  innovationStyles: object

  mapSubfactorIdsByFactor: object

  subfactors: object

  isSubfactor(factorId: number): boolean
}

export = new AppStore()
