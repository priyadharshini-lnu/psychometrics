import _ from 'lodash'

function parseConditions (condition) {
  // Parse row and column
  const c = condition.answer.match(/c_(\d+)/)
  const row = condition.answer.match(/row_(\d+)/)
  const col = condition.answer.match(/col_(\d+)/)
  const scale = c && +c[1]
  const choice = row && +row[1]
  const index = col && +col[1]
  return { scale, choice, index }
}

export default {
  Main (condition) {
    // Build search predicate
    const parsed = parseConditions(condition)
    const predicate = _.pick(parsed, ['scale', 'choice'])

    if (condition.answer.match(/count/)) {
      if (parsed.index !== null) predicate.values = [{ index: parsed.index, value: true }]
      const answers = _.filter(condition.result.answers, predicate)
      return answers && answers.length
    }
    const answer = _.find(condition.result.answers, predicate)
    const value = answer && _.find(answer.values, { index: parsed.index })
    return value && value.value
  },
}
