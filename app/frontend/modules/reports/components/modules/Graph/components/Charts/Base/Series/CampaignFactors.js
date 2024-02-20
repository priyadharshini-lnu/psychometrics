import _ from 'lodash'
import LookupSourceName from '~/modules/reports/commands/LookupSourceName'

export const Functions = {
}

export default {
  series (results, factors, model) {
    const data = (model.props.source.codes || []).map(code => ({
      name: LookupSourceName.call({}, code, 'CampaignFactors'),
      y: parseFloat(_.find(results.campaignFactorResults, { code })?.value, 10),
    }))

    return [{
      colorByPoint: true,
      data,
    }]
  },
  functions: _.keys(Functions),
}
