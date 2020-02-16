
declare class NormResolver {
  constructor(rules, hris, questions = null, results = null)

  resolve(): {id: string}
}

export = NormResolver
