import _ from 'lodash'
import { CampaignFactorResults } from './interfaces'

export default {
  run: (
    from: number,
    to: number,
    campaignFactorResults: CampaignFactorResults,
    campaignFactorCodes: string[],
    minValue = -Infinity,
    maxValue = Infinity,
  ) => {
    const factors = campaignFactorResults.filter(cf => campaignFactorCodes
      .includes(cf.code)).map(factor => ({
      code: factor.code,
      value: parseFloat(factor.value as string),
      name: factor.name,
      description: factor.description,
    }))

    const sorted = _.orderBy(factors, ['value'])

    return _(sorted)
      .filter(factor => _.inRange(factor.value, minValue, maxValue))
      .filter((factor, index) => index + 1 >= from && index < to)
      .value()
  },
}
