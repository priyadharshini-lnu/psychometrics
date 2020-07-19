import _ from 'lodash'
import { Functions } from '../../Base/Series/Factor'

export default {
  series (results, columns) {
    const data = (columns || []).map(column => parseFloat(results.dataSheet[column]))
    return [{ data }]
  },

  xAxis (columns) {
    return {
      categories: columns,
    }
  },

  functions: _.keys(Functions),
}
