
import DefaultProps from 'libs/survey/constants/DefaultProps'

let id = 0

export const multipleChoice = data => ({
  id: id++,
  type: 'MultipleChoice',
  required_validation: { enabled: false },
  validation: { type: 'None', args: {} },
  choicesIds: [0, 1, 2],
  ...data,
  props: {
    ...DefaultProps.MultipleChoice,
  },
})
