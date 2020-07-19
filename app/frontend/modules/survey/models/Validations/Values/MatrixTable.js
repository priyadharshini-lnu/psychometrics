import _ from 'lodash'

function findAnswerValue (condition) {
  // Build search predicate
  const predicate = {}

  // Parse row and column
  const row = condition.answer.match(/row_(\d+)/)
  const col = condition.answer.match(/col_(\d+)/)
  const choice = row && +row[1]
  const scale = col && +col[1]

  // Filling search predicate
  if (choice !== null) predicate.choice = choice
  if (scale !== null) predicate.scale = scale

  // If it count condition
  if (condition.answer.match(/count/)) {
    predicate.value = true
    // Search answers
    const answers = _.filter(condition.result.answers, predicate)
    return answers && answers.length
  }

  // Search answer
  const answer = _.find(condition.result.answers, predicate)
  return answer && answer.value
}

export default {
  Likert: findAnswerValue,

  Bipolar: findAnswerValue,

  RankOrder: findAnswerValue,

  ConstantSum: findAnswerValue,

  TextEntry: findAnswerValue,

  MaxDiff: findAnswerValue,
}
