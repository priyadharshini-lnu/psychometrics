import _ from 'lodash'

export default {
  DragAndDrop (condition) {
    // Build search predicate
    const predicate = {}

    // Parse row and column
    const row = condition.answer.match(/row_(\d+)/)
    const choice = row && +row[1]

    // Filling search predicate
    if (choice !== null) predicate.choice = choice

    // Search answer
    const answer = _.find(condition.result.answers, predicate)
    return answer && (+answer.value + 1)
  },
}
