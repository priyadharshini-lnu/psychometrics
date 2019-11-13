import _ from 'lodash'

function findAnswerValue (condition) {
  // Build search predicate
  const predicate = { index: +condition.answer }

  // Search answer
  const answer = _.find(condition.result.answers, predicate)
  return answer && +answer.value
}

export default {
  Bar: findAnswerValue,

  Slider: findAnswerValue,

  Star: findAnswerValue,
}
