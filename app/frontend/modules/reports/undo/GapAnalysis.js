import Action from './Action'

export const GapAnalysisChangeChoices = (subject, object) => new Action(
  subject, '_changeStatements', '_changeStatements',
  [object.newValue, true], [object.oldValue, true], 'Change Props Question',
)

export const GapAnalysisChangeText = (subject, object) => new Action(
  subject, '_changeData', '_changeData',
  [object.newValue, true], [object.oldValue, true], 'Change Props Question',
)
