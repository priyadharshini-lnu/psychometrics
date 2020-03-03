import _ from 'lodash'
import ConditionResolver from 'libs/survey/models/ConditionResolver'
import QuestionSerializer from 'libs/survey/models/QuestionSerializer'
import { ElementInterface, QuestionsInterface, ResultsInterface } from '../interfaces'

const BranchProcessor = {
  run (
    { questions, results }: { questions: QuestionsInterface; results: ResultsInterface},
    element: ElementInterface,
  ): boolean {
    const qwraps = _.map(questions, q => QuestionSerializer.wrap(q, results[q.id]?.answers))
    const resolver = new ConditionResolver(element.props.conditions, { questions: qwraps, results })
    return !!resolver.resolve()
  },
}

export default BranchProcessor
