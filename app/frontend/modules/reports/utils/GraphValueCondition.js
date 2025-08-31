import _ from 'lodash'
import { GRAPH_CONDITION_TYPES } from '~/modules/reports/consts/Report'

const checkCondition = (condition, score) => {
  const value = parseFloat(condition.props.value)
  const parsedScore = parseFloat(score)

  if (isNaN(value) || isNaN(parsedScore)) { return false }

  switch (condition.props.predicate) {
    case 'EqualTo':
      return parsedScore === value
    case 'NotEqualTo':
      return parsedScore !== value
    case 'GreaterThan':
      return parsedScore > value
    case 'GreaterThanOrEqual':
      return parsedScore >= value
    case 'LessThan':
      return parsedScore < value
    case 'LessThanOrEqual':
      return parsedScore <= value
    default:
      throw new Error(`unknown predicate: ${condition.props.predicate}`)
  }
}

const getColorByCondition = (conditionObj, score) => {
  if (conditionObj.conditions.length === 0) {
    return null
  }
  let result = true
  _.each(conditionObj.conditions, (condition) => {
    if (condition.props.prefix === 'Or') {
      result = result || checkCondition(condition, score)
    } else {
      result = result && checkCondition(condition, score)
    }
  })
  return result ? conditionObj.color : null
}

export const getColorForGraphValue = (graphValueConditions, val) => {
  if (graphValueConditions?.length) {
    for (let i = 0; i < graphValueConditions.length; i += 1) {
      const conditionObj = graphValueConditions[i]
      const resultColor = getColorByCondition(conditionObj, val)
      if (resultColor) {
        return resultColor
      }
    }
    return null
  }
  return null
}

export const isGraphValueCondition = type => type === GRAPH_CONDITION_TYPES.GRAPH_VALUE
