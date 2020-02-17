import _ from 'lodash'
import LogicResolver from 'libs/survey/models/logic/LogicResolver'
import QuestionSerializer from 'libs/survey/models/QuestionSerializer'

export default function DisplayLogicProcessor (logic, questions, results) {
  const qwraps = _.map(questions, q => QuestionSerializer.wrap(q, results[q.id]?.answers))
  const resolver = new LogicResolver(logic, qwraps, results)
  return resolver.resolve()
}
