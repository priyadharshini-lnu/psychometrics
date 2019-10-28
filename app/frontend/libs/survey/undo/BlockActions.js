import Action from './Action'

export const BlockCreate = (subject, object) => new Action(subject, 'restore', 'destroy',
  [object], [object], `Create Block ${object.name}`)

export const BlockRemove = (subject, object) => new Action(subject, 'remove', 'restore',
  [object], [object], `Remove Block ${object.name}`)

export const BlockRestore = (subject, object) => new Action(subject, 'restore', 'remove',
  [object], [object], `Restore Block ${object.name}`)

export const BlockRename = (subject, object) => new Action(subject, 'rename', 'rename',
  [object.newValue], [object.oldValue], `Rename Block ${object.oldValue} to ${object.newValue}`)

export const BlockMoveDown = (subject, object) => new Action(subject, 'moveDown', 'moveUp',
  [object], [object], 'Move Down Block')

export const BlockMoveUp = (subject, object) => new Action(subject, 'moveUp', 'moveDown',
  [object], [object], 'Move Up Block')
