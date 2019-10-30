import _ from 'lodash'

export const Functions = {
}

export default {
  series (results, factors, model) {
    const data = (model.props.source.columns || []).map(column => ({
      name: column,
      y: parseFloat(results.dataSheet[column]),
    }))

    return [{
      colorByPoint: true,
      data,
    }]
  },
  functions: _.keys(Functions),
}
