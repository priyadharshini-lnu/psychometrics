import _ from 'lodash'

export default {
  Main (condition) {
    // Build search predicate
    const predicate = {}

    // Parse row and column
    const c = condition.answer.match(/c_(\d+)/)
    const row = condition.answer.match(/row_(\d+)/)
    const col = condition.answer.match(/col_(\d+)/)
    const scale = c && +c[1]
    const choice = row && +row[1]
    const index = col && +col[1]

    // Filling search predicate
    if (scale !== null) predicate.scale = scale
    if (choice !== null) predicate.choice = choice
    if (index !== null) predicate.values = [{ index, value: true }]

    // Search answer
    const answers = _.find(condition.result.answers, predicate)
    return answers && answers.values[0] && answers.values[0].value
  },
}
