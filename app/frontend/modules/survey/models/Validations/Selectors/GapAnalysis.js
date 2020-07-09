import _ from 'lodash'

function main (condition) {
  const predicate = {}
  const row = condition.answer.match(/row_(\d+)/)
  const col = condition.answer.match(/col_(\d+)/)
  const why = condition.answer.match(/why_(\d+)/)
  const choice = row && +row[1]
  const scale = col && +col[1]
  const value = why && +why[1]

  if (choice !== null) predicate.choice = choice
  if (scale !== null) predicate.scale = scale

  const answer = _.find(condition.result.answers, predicate)

  if (value) {
    return _.some(answer.values, i => (+i === value))
  }
  return answer
}

export default {
  Positive: main,
  Negative: main,
}
