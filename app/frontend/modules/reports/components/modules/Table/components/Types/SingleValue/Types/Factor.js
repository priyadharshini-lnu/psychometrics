import React from 'react'
import _ from 'lodash'
import I18nStore from 'rb/store/I18nStore'
import ResultStore from 'rb/store/ResultStore'
import AppStore from 'rb/store/AppStore'
import styles from '../styles.scss'

const VALUES = [[28.69, 55.51, 62.7], [49.3, 46.24, 66.52], [36.03, 47.8, 47.19]]

export default function Factor ({ model, filters }) {
  const getFactorMap = () => {
    const assessment = AppStore.getAssessmentById(model.assessment_id)
    const dimensionId = assessment && assessment.dimensionId
    return _.keyBy(AppStore.factors[dimensionId], f => f.id)
  }

  const getResults = () => {
    const factorMap = getFactorMap()
    const { factorIds } = model.props
    if (!ResultStore.realResults) {
      return factorIds.map((id, index) => {
        const factor = factorMap[id]
        const valuesPull = VALUES[index % VALUES.length]
        const values = _.times(filters.length, i => valuesPull[i % valuesPull.length])
        return { name: I18nStore.tFactor(factor, 'name'), values }
      })
    }

    return factorIds.map((id) => {
      const factor = factorMap[id]
      const values = filters.map((filter) => {
        const scoring = _.get(ResultStore, [
          'results',
          model.assessment_id,
          'resultsByFilter',
          filter.id,
          'scoring',
          id,
        ])
        if (!scoring) return '-'

        return _.round(_.meanBy(scoring.results, res => res.getValue()), 2)
      })
      return { name: I18nStore.tFactor(factor, 'name'), values }
    })
  }

  if (!filters.length) return null

  const results = getResults()
  return (
    <div className={styles.table}>
      <table>
        <thead>
          <tr>
            <td className={styles.label}>{I18nStore.t('reports.modules.single_value.factor_name')}</td>
            {filters.map(filter => (
              <td key={filter.id} className={styles.label}>
                {I18nStore.tFilterName(filter)}
              </td>
            ))}
          </tr>
        </thead>
        <tbody>
          {results.map(result => (
            <tr key={result.name}>
              <td>{result.name}</td>
              {result.values.map((value, index) => (
                <td key={index}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
