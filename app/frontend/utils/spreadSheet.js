import _ from 'lodash'

const spreadSheet = {
  getFreeRowIndex (entities) {
    if (_.isEmpty(entities)) return 0

    const keys = _.keys(entities)
      .map(key => parseInt(key, 10))
      .sort()

    /* eslint-disable */
    for (const [index, key] of keys.entries()) {
      if (index !== key) return index
    }
    /* eslint-enable */
    return keys.length
  },
}

export default spreadSheet
