import _ from 'lodash'
import ConditionResolver from '~/modules/survey/models/ConditionResolver'
import QuestionSerializer from '~/modules/survey/models/QuestionSerializer'
import { QuestionsInterface, ResultsInterface } from '../interfaces'

export const END_OF_ASSESSMENT = 'EndOfAssessment'
export const END_OF_BLOCK = 'EndOfBlock'
export const SPECIFIC_BLOCK = 'SpecificBlock'

interface SkipLogicResult {
  type: string
  blockId?: number
}

const SkipLogicProcessor = {
  run (logic, questions: QuestionsInterface, results: ResultsInterface): SkipLogicResult | false {
    const qwraps = _.map(questions, q => QuestionSerializer.wrap(q, results[q.id]?.answers))
    const conditions = _.map(logic, cond => [{ ...cond, conditionType: 'Question' }])

    for (let i = 0; i < conditions.length; i += 1) {
      const resolver = new ConditionResolver(conditions[i], { questions: qwraps, results })
      if (resolver.resolve()) {
        switch (conditions[i][0].destination) {
          case END_OF_BLOCK:
            return { type: END_OF_BLOCK }
          case END_OF_ASSESSMENT:
            return { type: END_OF_ASSESSMENT }
          case SPECIFIC_BLOCK: {
            const blockId = +conditions[i][0].destinationBlock
            if (!blockId) { return false }
            return { type: SPECIFIC_BLOCK, blockId }
          }
          default:
            return false
        }
      }
    }
    return false
  },
}
export default SkipLogicProcessor
