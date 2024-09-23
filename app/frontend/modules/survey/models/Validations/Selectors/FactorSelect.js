import _ from 'lodash'

function find (condition) {
  return _.get(condition, ['result', 'answers'], [])
}

export default {
  Dropdown (condition) {
    return find(condition)
  },
}
