const PREDICATES = {
  at_least: 'At least',
}


export default {
  getCondition ({ predicate, value }) {
    return `${PREDICATES[predicate]} ${value}`
  },

}
