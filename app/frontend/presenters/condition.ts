import _ from 'lodash'

const PREDICATES = {
  atleast: 'At least',
  exactly: 'Exactly',
  atmost: 'At most',
}


export default {
  getCondition ({ comparator, value }: { comparator: string, value: string }) {
    if (_.isEmpty(value)) { return '' }
    return `${PREDICATES[comparator]} ${value}`
  },

}
