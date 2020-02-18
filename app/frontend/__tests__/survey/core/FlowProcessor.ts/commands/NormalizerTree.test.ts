
import NormalizeTree from 'libs/survey/core/preview/FlowProcessor/commands/NormalizeTree'

test('normalize empty tree to empty list', () => {
  const tree = []

  expect(NormalizeTree.run(tree)).toStrictEqual({})
})

test('normalize tree with one child', () => {
  const tree = [{
    type: 'Branch',
    elements: [],
  }]

  expect(NormalizeTree.run(tree)).toStrictEqual({ 0: { type: 'Branch' } })
})


test('normalize tree with two level child', () => {
  const tree = [{
    type: 'Branch',
    elements: [
      { type: 'Block', elements: [], props: { current: '1810' } },
    ],
  }]

  expect(NormalizeTree.run(tree)).toStrictEqual({
    0: { type: 'Branch' },
    '0/0': { type: 'Block', props: { current: '1810' } },
  })
})


test('normalize tree with two roots', () => {
  const tree = [
    { type: 'Block', elements: [], props: { current: '1' } },
    { type: 'Block', elements: [], props: { current: '2' } },
  ]

  expect(NormalizeTree.run(tree)).toStrictEqual({
    0: { type: 'Block', props: { current: '1' } },
    1: { type: 'Block', props: { current: '2' } },
  })
})


test('normalize tree with random block', () => {
  const tree = [
    {
      type: 'Randomizer',
      elements: [
        { type: 'Block', elements: [], props: { current: '1' } },
        { type: 'Block', elements: [], props: { current: '2' } },
      ],
      props: { number: 1 },
    },
  ]

  expect(NormalizeTree.run(tree, 'test')).toStrictEqual({
    0: { type: 'Randomizer', props: { number: 1 } },
    '0/0': { type: 'Block', props: { current: '2' } },
  })
  expect(NormalizeTree.run(tree, 'testt')).toStrictEqual({ // seed to generate different result
    0: { type: 'Randomizer', props: { number: 1 } },
    '0/0': { type: 'Block', props: { current: '1' } },
  })
})


test('normalize tree with random block two elements', () => {
  const tree = [
    {
      type: 'Randomizer',
      elements: [
        { type: 'Block', elements: [], props: { current: '1' } },
        { type: 'Block', elements: [], props: { current: '2' } },
      ],
      props: { number: 2 },
    },
  ]

  expect(NormalizeTree.run(tree, 'test')).toStrictEqual({
    0: { type: 'Randomizer', props: { number: 2 } },
    '0/0': { type: 'Block', props: { current: '2' } },
    '0/1': { type: 'Block', props: { current: '1' } },
  })
})


test('normalize tree with many roots and children', () => {
  const tree = [
    {
      type: 'Branch',
      elements: [
        { type: 'Block', elements: [], props: { current: '1' } },
        { type: 'Block', elements: [], props: { current: '2' } },
      ],
    },
    {
      type: 'Branch',
      elements: [
        { type: 'Block', elements: [], props: { current: '3' } },
        {
          type: 'Branch',
          elements: [
            { type: 'Block', elements: [], props: { current: '4' } },
          ],
        },
      ],
    },
  ]

  expect(NormalizeTree.run(tree)).toStrictEqual({
    0: { type: 'Branch' },
    '0/0': { type: 'Block', props: { current: '1' } },
    '0/1': { type: 'Block', props: { current: '2' } },
    1: { type: 'Branch' },
    '1/0': { type: 'Block', props: { current: '3' } },
    '1/1': { type: 'Branch' },
    '1/1/0': { type: 'Block', props: { current: '4' } },
  })
})
