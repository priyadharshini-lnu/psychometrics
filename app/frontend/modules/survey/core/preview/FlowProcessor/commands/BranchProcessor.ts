import _ from 'lodash'
import ConditionResolver from '~/modules/survey/models/ConditionResolver'
import QuestionSerializer from '~/modules/survey/models/QuestionSerializer'
import { ElementInterface, QuestionsInterface, ResultsInterface } from '../interfaces'

const BranchProcessor = {
  run (
    store: {
      questions: QuestionsInterface
      results: ResultsInterface
      dataSheet: { [key: string]: object }
      subjectDataSheet: { [key: string]: object }
      relationship: string,
      isAnonymousAssessment: boolean,
    },
    element: ElementInterface,
  ): boolean {
    const {
      questions, results, dataSheet, subjectDataSheet, relationship, isAnonymousAssessment,
    } = store
    const qwraps = _.map(questions, q => QuestionSerializer.wrap(q, results[q.id]?.answers))
    const resolver = new ConditionResolver(
      element.props.conditions,
      {
        questions: qwraps, results, dataSheet, subjectDataSheet, relationship, isAnonymousAssessment,
      },
    )
    return !!resolver.resolve()
  },
}

export default BranchProcessor
