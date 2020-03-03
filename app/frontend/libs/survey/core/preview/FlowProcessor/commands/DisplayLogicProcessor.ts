import _ from 'lodash'
import LogicResolver from 'libs/survey/models/logic/LogicResolver'
import QuestionSerializer from 'libs/survey/models/QuestionSerializer'
import { LogicInterface, QuestionsInterface, ResultsInterface } from '../interfaces'

interface Context {
  questions?: QuestionsInterface
  results?: ResultsInterface
  dataSheet?: []
  relationship?: string
}

const DisplayLogicProcessor = {
  run (logic: LogicInterface, {
    questions = {}, results = {}, dataSheet = [], relationship,
  }: Context): boolean {
    const qwraps = _.map(questions, q => QuestionSerializer.wrap(q, results[q.id]?.answers))
    const resolver = new LogicResolver(logic, {
      questions: qwraps, results, dataSheet, relationship,
    })
    return resolver.resolve()
  },
}

export default DisplayLogicProcessor
