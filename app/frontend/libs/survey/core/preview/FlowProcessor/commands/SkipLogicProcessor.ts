import _ from 'lodash'
import ConditionResolver from 'libs/survey/models/ConditionResolver'
import QuestionSerializer from 'libs/survey/models/QuestionSerializer'

export const END_OF_ASSESSMENT = 'EndOfAssessment'
export const END_OF_BLOCK = 'EndOfBlock'
export const SPECIFIC_BLOCK = 'SpecificBlock'

const SkipLogicProcessor = {
  run (logic, questions, results) {
    const qwraps = _.map(questions, q => QuestionSerializer.wrap(q, results[q.id]?.answers))
    const conditions = _.map(logic, (cond) => {
      cond.conditionType = 'Question'
      return [cond]
    })

    for (let i = 0; i < conditions.length; i += 1) {
      const resolver = new ConditionResolver(conditions[i], qwraps, results)
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
