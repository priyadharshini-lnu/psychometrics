import _ from 'lodash'
import ResultStore from '~/modules/reports/store/ResultStore'
import { getFilterName } from './Factor'

export const Functions = {}

export default {
  series (results, codes, model) {
    return results.map((result, i) => {
      let data = (codes || []).map(code => _.find(result.results.campaignFactorResults,
        { code })?.value)
      if (!ResultStore.realResults) {
        data = data.map(d => d - (i / 2)).map((d) => {
          if (d > model.props.radarMax) return model.props.radarMax
          return d
        })
      }
      return {
        data,
        name: result.desc || getFilterName(result.filterId),
      }
    })
  },
  functions: _.keys(Functions),
}
