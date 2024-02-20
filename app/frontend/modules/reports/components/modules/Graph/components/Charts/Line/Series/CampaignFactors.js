import _ from 'lodash'
import { Functions } from '../../Base/Series/Factor'
import LookupSourceName from '~/modules/reports/commands/LookupSourceName'

export default {
  series (results, codes) {
    const data = (codes || []).map(code => parseFloat(_.find(results.campaignFactorResults, { code })?.value, 10))
    return [{ data }]
  },

  xAxis (codes) {
    return {
      categories: (codes || []).map(code => LookupSourceName.call({}, code, 'CampaignFactors')),
    }
  },

  functions: _.keys(Functions),
}
