import _ from 'lodash'
import LogicResolver from 'libs/survey/models/logic/LogicResolver'
import QuestionSerializer from 'libs/survey/models/QuestionSerializer'
import { LogicInterface, QuestionsInterface, ResultsInterface } from '../interfaces'

const DisplayLogicProcessor = {
  run (logic: LogicInterface, questions: QuestionsInterface, results: ResultsInterface): boolean {
    const qwraps = _.map(questions, q => QuestionSerializer.wrap(q, results[q.id]?.answers))
    const resolver = new LogicResolver(logic, qwraps, results)
    return resolver.resolve()
  },
}

export default DisplayLogicProcessor
