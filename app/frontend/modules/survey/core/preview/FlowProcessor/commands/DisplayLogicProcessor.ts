import _ from 'lodash'
import LogicResolver from '~/modules/survey/models/logic/LogicResolver'
import QuestionSerializer from '~/modules/survey/models/QuestionSerializer'
import { LogicInterface, QuestionsInterface, ResultsInterface } from '../interfaces'

interface Context {
  questions?: QuestionsInterface
  results?: ResultsInterface
  dataSheet?: []
  subjectDataSheet?: []
  relationship?: string
  isAnonymousAssessment?: boolean
}

const DisplayLogicProcessor = {
  run (logic: LogicInterface, {
    questions = {}, results = {}, dataSheet = [], subjectDataSheet = [], relationship, isAnonymousAssessment,
  }: Context): boolean {
    const qwraps = _.map(questions, q => QuestionSerializer.wrap(q, results[q.id]?.answers))
    const resolver = new LogicResolver(logic, {
      questions: qwraps, results, dataSheet, subjectDataSheet, relationship, isAnonymousAssessment,
    })
    return resolver.resolve()
  },
}

export default DisplayLogicProcessor
