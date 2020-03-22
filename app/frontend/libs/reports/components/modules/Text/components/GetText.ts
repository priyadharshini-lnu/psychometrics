/* eslint-disable @typescript-eslint/no-explicit-any */
import _ from 'lodash'
import ResultStore from 'libs/reports/store/ResultStore'
import I18nStore from 'libs/reports/store/I18nStore'

const GetText = {
  run (module): string | null {
    if (module.props.basedOn === 'factor') {
      return fetchFactorText(module)
    }

    return fieldText(module, fetchOccupation(module))
  },
}

const fetchFactor = (module: any): any => ResultStore.results[module.assessment_id]
  .getTopFactorByRank(module.props.topPosition)

const fetchOccupation = (module: any): any => ResultStore.results[module.assessment_id]
  .getOccupationByRank(module.props.topPosition)

const fieldText = (module, factorOrOccupation): string | null => {
  if (!factorOrOccupation) { return null }
  if (module.props.basedOn === 'factor') {
    return I18nStore.tFactor(factorOrOccupation, module.props.fieldName)
  }
  return I18nStore.tOccupation(factorOrOccupation, module.props.fieldName)
}

const fetchFactorText = (module: any): string | null => {
  const factor = fetchFactor(module)
  if (!factor) { return null }
  const conditions = _.filter(module.textConditions, { factorId: factor.id })
  let conditionText = null
  for (let i = 0; i < conditions.length; i += 1) {
    conditionText = _.invoke(
      conditions[i], 'getTextByCondition', factor.meanNormScore,
      _.indexOf(module.textConditions, conditions[i]),
    )
    if (conditionText) { break }
  }
  return conditionText || fieldText(module, factor)
}

export default GetText
