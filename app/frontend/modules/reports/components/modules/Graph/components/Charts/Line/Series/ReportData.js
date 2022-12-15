import _ from 'lodash'
import { Functions } from '../../Base/Series/Factor'

export default {
  series (results, columns) {
    const data = (columns || []).map(column => parseFloat(results.reportData[column]))
    return [{ data }]
  },

  xAxis (columns, module) {
    const configData = module.props.source.reportDataColumns
    return {
      categories: columns.map(c => (configData.find(d => d.value === c) || {}).label),
    }
  },

  functions: _.keys(Functions),
}
