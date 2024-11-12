import { Questions, QuestionError } from '~/modules/survey/core/preview/FlowProcessor/interfaces.ts'

declare class Result {
  constructor(question, answers = null, notApplicable = null, results = {},
    answeredQuestions?: Questions[] = null, richTextEditorAnswerWordCount)

  validate(): QuestionError[]
}

export = Result
