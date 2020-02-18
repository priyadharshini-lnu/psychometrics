import _ from 'lodash'
import ConditionResolver from 'libs/survey/models/ConditionResolver'
import QuestionSerializer from 'libs/survey/models/QuestionSerializer'

const BranchProcessor = {
  run ({ questions, results }, element) {
    const qwraps = _.map(questions, q => QuestionSerializer.wrap(q, results[q.id]?.answers))
    const resolver = new ConditionResolver(element.props.conditions, qwraps, results)
    return !!resolver.resolve()
  },
}

export default BranchProcessor
