/* eslint-disable @typescript-eslint/no-explicit-any */

declare class NormResolver {
  constructor(rules, hris, questions: any = null, results: any = null)

  resolve(): {id: string}
}

export = NormResolver
