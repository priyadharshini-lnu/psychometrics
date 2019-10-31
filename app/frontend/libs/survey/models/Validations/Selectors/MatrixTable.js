import _ from 'lodash'

function buildPredicate (condition) {
  const predicate = { value: true }
  const row = condition.answer.match(/row_(\d+)/)
  const col = condition.answer.match(/col_(\d+)/)
  const choice = row && +row[1]
  const scale = col && +col[1]
  if (choice !== null) predicate.choice = choice
  if (scale !== null) predicate.scale = scale
  return _.find(condition.result.answers, predicate)
}

export default {
  Likert: buildPredicate,

  Bipolar: buildPredicate,

  Profile: buildPredicate,

  MaxDiff: buildPredicate,
}
