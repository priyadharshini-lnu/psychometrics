import { QuestionError } from '~/modules/survey/core/preview/FlowProcessor/interfaces.ts'

declare class Result {
  constructor(question, answers = null, notApplicable = null)

  validate(): QuestionError[]
}

export = Result
