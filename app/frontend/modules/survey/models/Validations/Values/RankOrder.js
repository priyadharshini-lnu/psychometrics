import _ from 'lodash'

function findAnswerValue (condition) {
  // Build search predicate
  const predicate = { index: +condition.answer }

  // Search answer
  const answer = _.find(condition.result.answers, predicate)
  return answer && (+answer.value + 1)
}

export default {
  DragAndDrop: findAnswerValue,

  RadioButtons: findAnswerValue,

  SelectBox: findAnswerValue,

  TextBox: findAnswerValue,
}
