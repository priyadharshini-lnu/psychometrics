import _ from 'lodash'

const { I18n } = window

export default {
  getCondition ({ comparator, value }: { comparator: string, value: string }) {
    if (_.isEmpty(value)) { return '' }
    return I18n.t(`threesixty.nomination_predicates.${comparator}`, { count: value })
  },
}
