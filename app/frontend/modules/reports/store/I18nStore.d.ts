declare class I18nStore {
  constructor()

  locales: { [key: string]: string }

  setLocale (code:string): void

  t(code, data = {}): string

  tQuestion (question, field, extraData): string

  tFilterName (filter): string

  tFactorName (factor): string

  tFactor (factor, key): string

  tModule (module, key): string

  tMilestone (module, key): string

  tOccupation (occupation, key): string

  tSavilleFactorName (assessment_id: number, factor: { name: string, id: string }): string

  exportReport(): any // eslint-disable-line  @typescript-eslint/no-explicit-any

  tTableColumns (moduleId, sourceType, key): string
}

export = new I18nStore()
