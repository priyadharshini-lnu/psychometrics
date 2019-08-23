import _ from 'lodash'

// eslint-disable-next-line import/prefer-default-export
export const relationshipWithoutSelf = (relationships, options) => {
  if (_.get(options, 'participants.subject.limitRelationshipThatSubjectCanSelect')) {
    return _.filter(relationships, r => (options.participants.subject.canSelectRelationships[r.id]
                && _.lowerCase(r.name) !== 'self'))
  }
  return _.filter(relationships, r => _.lowerCase(r.name) !== 'self')
}
