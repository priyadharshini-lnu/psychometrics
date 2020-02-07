import _ from 'lodash'
import ConditionResolver from 'libs/survey/models/ConditionResolver'
import QuestionSerializer from 'libs/survey/models/QuestionSerializer'

export default function BranchProcessor ({questions, results}, element) {
  const qwraps = _.map(questions, q => QuestionSerializer.wrap(q, results[q.id]))
  const resolver = new ConditionResolver(element.props.conditions, qwraps, results)
  if (resolver.resolve()) {
    return true
  }

  return false
}
