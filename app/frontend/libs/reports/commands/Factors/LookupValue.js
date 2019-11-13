import _ from 'lodash'

// TODO (atanych): refactor within https://gitlab.com/tte-lighthouse/psychometrics/issues/59
const LookupValue = {
  call (externalScoring, sourceType, factor, type = 'float') {
    const value = externalScoring[factor] || _.get(externalScoring, [sourceType, factor])
    if (type === 'float') {
      return parseFloat(value) || 0
    }
    if (type === 'integer') {
      return parseInt(value, 10) || 0
    }
    return value
  },
}

export default LookupValue
