import _ from 'lodash'

class BaseType {
  constructor (scoring) {
    this.scoring = scoring
  }

  isSorted (objects) {
    if (objects.length) {
      return _.every(objects, (object) => {
        const sortedObjects = _.sortBy(object.values, data => data.index)
        return _.every(sortedObjects, (object, index, array) => index === 0 || array[index - 1].value < object.value)
      })
    }
    return false
  }

  clear (filter) {
    _.remove(this.scoring.props, filter)
  }
}

export default BaseType
