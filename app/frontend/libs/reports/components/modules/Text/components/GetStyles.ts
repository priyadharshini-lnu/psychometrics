/* eslint-disable @typescript-eslint/no-explicit-any */
import _ from 'lodash'
import ResultStore from 'libs/reports/store/ResultStore'

const GetStyles = {
  run (module: any): any {
    const factor = fetchFactor(module)
    if (!factor) { return {} }
    const conditions = _.filter(module.textConditions, { factorId: factor.id })
    let styles = {}
    for (let i = 0; i < conditions.length; i += 1) {
      styles = _.invoke(conditions[i], 'getStylesByCondition', factor.meanNormScore)
      if (styles) { break }
    }
    return styles
  },
}

const fetchFactor = (module: any): any => ResultStore.results[module.assessment_id]
  .getTopFactorByRank(module.props.topPosition)

export default GetStyles
