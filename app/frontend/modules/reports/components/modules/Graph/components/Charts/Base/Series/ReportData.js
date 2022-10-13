import _ from 'lodash'

export const Functions = {
}

export default {
  series (results, factors, model) {
    const data = (model.props.source.reportDataColumns || []).map(column => ({
      name: column.value,
      y: parseFloat(results.reportData[column.value]),
    }))

    return [{
      colorByPoint: true,
      data,
    }]
  },
  functions: _.keys(Functions),
}
