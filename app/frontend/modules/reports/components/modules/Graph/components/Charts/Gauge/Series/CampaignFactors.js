import _ from 'lodash'

export const Functions = {
}
export default {
  series (results, code) {
    return parseFloat(_.find(results.campaignFactorResults, { code })?.value, 10)
  },
  functions: _.keys(Functions),
}
