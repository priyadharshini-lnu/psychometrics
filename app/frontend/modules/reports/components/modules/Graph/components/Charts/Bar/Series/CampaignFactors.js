import _ from 'lodash'
import AppStore from '~/modules/reports/store/AppStore'
import LookupSourceName from '~/modules/reports/commands/LookupSourceName'

export const Functions = {
}

export default {
  series (results, factors, model) {
    const colors = _.map(model.props.colors, 'color')
    return results.map((res, i) => {
      const data = (model.props.source.codes || []).map(code => ({
        name: LookupSourceName.call({}, code, 'CampaignFactors'),
        y: parseFloat(_.find(res.results.campaignFactorResults, { code })?.value, 10),
      }))
      return {
        name: res.desc || AppStore.report.getFilterNameById(res.filterId),
        color: colors[i],
        data,
      }
    })
  },
  hasLegend: true,
  functions: _.keys(Functions),
}
