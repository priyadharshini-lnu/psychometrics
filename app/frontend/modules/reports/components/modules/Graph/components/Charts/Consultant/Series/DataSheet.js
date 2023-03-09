import _ from 'lodash'

export const Functions = {
}

export default {
  series (results, column) {
    return {
      name: column,
      y: parseFloat(results.dataSheet[column]),
    }
  },
  functions: _.keys(Functions),
}
