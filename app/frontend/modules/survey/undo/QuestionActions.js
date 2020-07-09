import Action from './Action'

export const QuestionCreate = (subject, object) => new Action(subject, 'restore', 'destroy',
  [object], [object], `Create Question ${object.name}`)

export const QuestionRemove = (subject, object) => new Action(subject, 'remove', 'restore',
  [object], [object], `Remove Question ${object.name}`)

export const QuestionRestore = (subject, object) => new Action(subject, 'restore', 'remove',
  [object], [object], `Restore Question ${object.name}`)

export const QuestionRename = (subject, object) => new Action(subject, 'rename', 'rename',
  [object.newValue], [object.oldValue],
  `Rename Question ${object.oldValue} to ${object.newValue}`)

export const QuestionMoveDown = (subject, object) => new Action(subject, 'moveDown', 'moveUp',
  [object], [object], 'Move Down Question')

export const QuestionMoveUp = (subject, object) => new Action(subject, 'moveUp', 'moveDown',
  [object], [object], 'Move Up Question')

export const QuestionChangeType = (subject, object) => new Action(subject, 'changeType', 'changeType',
  [object.newType], [object.oldType], 'Change Type Question')

export const QuestionChangeProps = (subject, object) => new Action(subject, 'changeProps', 'changeProps',
  [object.newProps, true], [object.oldProps, true], 'Change Props Question')

export const QuestionChangeReqValidations = (subject, object) => new Action(subject, 'changeReqValidations',
  'changeReqValidations', [object.newProps, true], [object.oldProps, true], 'Change Validation Question')

export const QuestionChangeValidations = (subject, object) => new Action(subject, 'changeValidation',
  'changeValidation', [object.newProps, true], [object.oldProps, true], 'Change Validation Question')

export const QuestionChangeArrayProps = (subject, object) => new Action(subject, 'changeArrayProps', 'changeArrayProps',
  [object.newProps, true], [object.oldProps, true], 'Change Props Question')

export const QuestionChangeChoices = (subject, object) => new Action(subject, 'setChoices', 'setChoices',
  [object.newValue, true], [object.oldValue, true], 'Change Props Question')
