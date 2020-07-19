import { createSelector } from 'reselect'
import _ from 'lodash'
import AppStore from 'rb/store/AppStore'

const getAvatarLetters = ({ name }, filters) => {
  const words = _.words(name)

  if (words.length > 1) {
    return _.take(words, 2)
      .map(word => word[0])
      .join('')
  }
  if (_.some(filters, f => f.avatarLetters === name[0])) {
    return _.take(name, 2).join('')
  }
  return name[0]
}

const lookupAndEnhanceFilters = createSelector(
  ({ filterIds }) => filterIds,
  ({ colors }) => colors,
  (filterIds, colors) => {
    const filters = filterIds.map(filterId => _.find(
      AppStore.report.filters, { id: filterId },
    )).filter(f => !_.isEmpty(f))

    return filters.reduce((result, filter, index) => {
      const avatarLetters = getAvatarLetters(filter, result)
      return [...result, { ...filter, color: colors[index % colors.length].color, avatarLetters }]
    }, [])
  },
)

export default lookupAndEnhanceFilters
