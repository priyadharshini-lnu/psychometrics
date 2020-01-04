
declare class Result {
  constructor(question, answers = null, notApplicable = null)
  validate(): object[]
}

export = Result
