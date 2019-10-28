import Action from './Action'

export const SideBySideChangeGroup = (subject, object) => new Action(subject, '_changeLabel', '_changeLabel',
  [...object.newValue, true], [...object.oldValue, true], 'Change Props Question')

export const SideBySideChangeAnswer = (subject, object) => new Action(subject, '_changeAnswer', '_changeAnswer',
  [...object.newValue, true], [...object.oldValue, true], 'Change Props Question')
