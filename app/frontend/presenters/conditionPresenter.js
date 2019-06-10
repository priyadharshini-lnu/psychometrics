const PREDICATES = {
  atleast: 'At least',
  exactly: 'Exactly',
  atmost: 'At most',
}


export default {
  getCondition ({ comparator, value }) {
    return `${PREDICATES[comparator]} ${value}`
  },

}
