import _ from 'lodash'

// eslint-disable-next-line import/prefer-default-export
export const relationshipWithoutSelf = relationships => _.filter(relationships, r => _.lowerCase(r.name) !== 'self')
