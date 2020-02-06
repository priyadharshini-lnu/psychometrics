import _ from 'lodash'

// TODO (atanych): refactor within https://gitlab.com/tte-lighthouse/psychometrics/issues/59
const LookupValue = {
  call (externalScoring, sourceType, factor, type = 'float') {
    const value = this.actualValue(externalScoring, sourceType, factor)
    if (type === 'float') {
      return parseFloat(value) || 0
    }
    if (type === 'integer') {
      return parseInt(value, 10) || 0
    }
    return value
  },
  actualValue (externalScoring, sourceType, factor) {
    return externalScoring[factor] || _.get(externalScoring, [sourceType, factor])
  },
  getValueOrNaN (externalScoring, sourceType, factor, type) {
    const value = this.actualValue(externalScoring, sourceType, factor)
    if (_.isNil(value)) { return NaN }

    return this.call(externalScoring, sourceType, factor, type)
  },
}

export default LookupValue
