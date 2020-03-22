
declare class I18nStore {
  constructor()

  t(code, data): string

  tQuestion (question, field, extraData): string

  tFilterName (filter): string

  tFactorName (factor): string

  tFactor (factor, key): string

  tOccupation (occupation, key): string
}

export = new I18nStore()
