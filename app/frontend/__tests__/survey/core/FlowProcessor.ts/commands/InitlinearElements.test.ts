import InitLinearElements from 'libs/survey/core/preview/FlowProcessor/commands/InitLinearElements'
import _ from 'lodash'

const question = (id, data = {}) => ({ id, ...data })


test('empty linear elements', () => {
  expect(InitLinearElements.run([])).toStrictEqual([])
})


test('linear block elements', () => {
  const blocks = [{
    id: 1,
    questions: [question(1), question(2), question(3)],
  },
  {
    id: 2,
    questions: [question(4), question(5)],
  }]

  expect(InitLinearElements.run(blocks)).toStrictEqual([{ type: 'Block', props: { current: '1' }, elements: [] }, { type: 'Block', props: { current: '2' }, elements: [] }])
})
