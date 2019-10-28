import Action from './Action'

export const ChangeScalePoints = (subject, object) => new Action(subject, '_changeScalePoints', '_changeScalePoints',
  [object.newValue, true], [object.oldValue, true], 'Change Scale Points')

export const ChangeLabels = (subject, object) => new Action(subject, '_changeLabels', '_changeLabels',
  [object.newValue, true], [object.oldValue, true], 'Change Labels')

export const ChangeChoices = (subject, object) => new Action(subject, '_changeChoices', '_changeChoices',
  [object.newValue, true], [object.oldValue, true], 'Change Choices')

export const ChangeCollection = (subject, object) => new Action(subject, '_changeCollection', '_changeCollection',
  [object.newValue, true], [object.oldValue, true], 'Change')
