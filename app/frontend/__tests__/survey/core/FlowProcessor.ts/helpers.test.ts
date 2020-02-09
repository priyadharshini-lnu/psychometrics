import {
  initPages, initLinearElements, normalizeTree, nextElementId, nextParentElementId,
  randomSequesnce, randomInt, shuffle, randomizeBlockQuestions
} from 'libs/survey/core/preview/FlowProcessor/helpers'
import _ from 'lodash'
import seedrandom from 'seedrandom'

const question = (id, data = {}) => ({id, ...data})

test('empty blocks', () => {
  expect(initPages({blocks: []})).toStrictEqual({});
});

test('simple block with one page', () => {
  const blocks = [{
    id: 1,
    questions: [question(1), question(2)]
  }]

  expect(initPages({blocks})).toStrictEqual({1: [{questions: [1,2], blockId: 1}]});
});

test('simple block with page_break', () => {
  const blocks = [{
    id: 1,
    questions: [question(1), question(2, {type: 'PageBreak'}), question(3)]
  }]

  expect(initPages({blocks})).toStrictEqual({1: [{questions: [1], blockId: 1}, {questions: [3], blockId: 1}]});
});

test('simple block with question with display_logic', () => {
  const blocks = [{
    id: 1,
    questions: [question(1), question(2, {display_logic: {}})]
  }]

  expect(initPages({blocks})).toStrictEqual({1: [{questions: [1], blockId: 1}, {questions: [2], blockId: 1}]});
});


test('simple block with question with display_logic and a question after', () => {
  const blocks = [{
    id: 1,
    questions: [question(1), question(2, { display_logic: {} }), question(3)]
  }]

  expect(initPages({ blocks })).toStrictEqual({
    1: [{ questions: [1], blockId: 1 }, { questions: [2, 3], blockId: 1 }]
  });
});

test('simple block with question with skip_logic one page', () => {
  const blocks = [{
    id: 1,
    questions: [question(1), question(2, {skip_logic: []})]
  }]

  expect(initPages({blocks})).toStrictEqual({1: [{questions: [1, 2], blockId: 1}]});
});


test('simple block with question with skip_logic and display logic', () => {
  const blocks = [{
    id: 1,
    questions: [question(1), question(2, {skip_logic: []}), question(3, {display_logic: {test: 1}})]
  }]

  expect(initPages({blocks})).toStrictEqual({1: [{questions: [1, 2], blockId: 1}, {questions: [3],  blockId: 1}]});
});

test('simple block with question with skip_logic two pages', () => {
  const blocks = [{
    id: 1,
    questions: [question(1), question(2, {skip_logic: [1]}), question(3)]
  }]

  expect(initPages({blocks})).toStrictEqual({1: [{questions: [1, 2], blockId: 1, skipLogic: [1]}, {questions: [3], blockId: 1}]});
});


test('simple two blocks', () => {
  const blocks = [{
    id: 1,
    questions: [question(1), question(2), question(3)]
  },
  {
    id: 2,
    questions: [question(4), question(5)]
  }]

  expect(initPages({blocks})).toStrictEqual({1: [{questions: [1, 2,3], blockId: 1}], 2: [{questions: [4,5], blockId: 2}]});
});


test('empty linear elements', () => {
  expect(initLinearElements([])).toStrictEqual([]);
});


test('linear block elements', () => {
  const blocks = [{
    id: 1,
    questions: [question(1), question(2), question(3)]
  },
  {
    id: 2,
    questions: [question(4), question(5)]
  }]

  expect(initLinearElements(blocks)).toStrictEqual([{type: 'Block', props: {current: '1'}, elements: []}, {type: 'Block', props: {current: '2'}, elements: []}]);
});


test('normalize empty tree to empty list', () => {
  const tree = []

  expect(normalizeTree(tree)).toStrictEqual({});
})

test('normalize tree with one child', () => {
  const tree = [{
    type: "Branch",
    elements: []
  }]

  expect(normalizeTree(tree)).toStrictEqual({ '0': { "type": "Branch" }});
})


test('normalize tree with two level child', () => {
  const tree = [{
    type: "Branch",
    elements: [
      { "type": "Block", "elements": [], "props": { "current": "1810" } }
    ]
  }]

  expect(normalizeTree(tree)).toStrictEqual({
    '0': { "type": "Branch" },
    '0/0': { "type": "Block", "props": { "current": "1810" } },
  });
})


test('normalize tree with two roots', () => {
  const tree = [
    { "type": "Block", "elements": [], "props": { "current": "1" } },
    { "type": "Block", "elements": [], "props": { "current": "2" } }
  ]

  expect(normalizeTree(tree)).toStrictEqual({
    '0': { "type": "Block", "props": { "current": "1" } },
    '1': { "type": "Block", "props": { "current": "2" } },
  });
})


test('normalize tree with many roots and children', () => {
  const tree = [
    {
      type: 'Branch', elements: [
        { "type": "Block", "elements": [], "props": { "current": "1" } },
        { "type": "Block", "elements": [], "props": { "current": "2" } }
      ]
    },
    {
      type: 'Branch', elements: [
        { "type": "Block", "elements": [], "props": { "current": "3" } },
        { type: 'Branch', elements: [
          { "type": "Block", "elements": [], "props": { "current": "4" } }
        ]}
      ]
    }
  ]

  expect(normalizeTree(tree)).toStrictEqual({
    '0': { "type": "Branch" },
    '0/0': { "type": "Block", "props": { "current": "1" } },
    '0/1': { "type": "Block", "props": { "current": "2" } },
    '1': { "type": "Branch" },
    '1/0': { "type": "Block", "props": { "current": "3" } },
    '1/1': { "type": "Branch" },
    '1/1/0': { "type": "Block", "props": { "current": "4" } },
  });
})


test('next element should retorn valid id', () => {
  expect(nextElementId('0/0/0')).toStrictEqual('0/0/1');
  expect(nextElementId('0/0/1')).toStrictEqual('0/0/2');
  expect(nextElementId('0/1')).toStrictEqual('0/2');
  expect(nextElementId('1')).toStrictEqual('2');
  expect(nextElementId('0/1/1')).toStrictEqual('0/1/2');
})


test('next parent element should retorn valid id', () => {
  expect(nextParentElementId('0/0/0')).toStrictEqual('0/1');
  expect(nextParentElementId('0/0/1')).toStrictEqual('0/1');
  expect(nextParentElementId('0/1')).toStrictEqual('1');
  expect(nextParentElementId('1')).toStrictEqual(null);
  expect(nextParentElementId('0/1/1')).toStrictEqual('0/2');
})

test('randomizeBlockQuestions should return valid resuls', () => {
  const pages = [
    {questions: [1,2,3]},
    {questions: [4,5]}
  ]

  expect(randomizeBlockQuestions(undefined, pages, 'test')).toStrictEqual(pages)
  expect(randomizeBlockQuestions({type: 'No'}, pages, 'test')).toStrictEqual(pages)
  expect(randomizeBlockQuestions({type: 'All'}, pages, 'test')).toStrictEqual([{questions: [5, 3, 1]}, {questions: [4, 2]}])
  expect(randomizeBlockQuestions({type: 'Some', questions: 2}, pages, 'test')).toStrictEqual([{questions: [5, 3]}])
  expect(randomizeBlockQuestions({type: 'Some', questions: 4}, pages, 'test')).toStrictEqual([{questions: [5, 3, 1]}, {questions: [4]}])
})

describe('seedrandom', () => {
  test('random returns the same numbers for seed', () => {
    Math.random = seedrandom('test')
    let x = Math.random()
    Math.random = seedrandom('test')
    let y = Math.random()
    expect(x).toBe(y)
  })

  test('shuffe with the same seed should return the same result', () => {
    const arr = [1,2,3,4,5]

    const arr1 = shuffle(arr, seedrandom('test'))
    const arr2 = shuffle(arr, seedrandom('test'))
    expect(arr1).toStrictEqual(arr2)
  })

  test('shuffe with a different seed the same seed should return the same result', () => {
    const arr = [1,2,3,4,5]

    const arr1 = shuffle(arr, seedrandom('test'))
    const arr2 = shuffle(arr, seedrandom('test'))
    expect(arr1).toStrictEqual(arr2)
  })


  test('randomSequesnce should return the same values for same seed', () => {
    let rnd = seedrandom('test')
    const arr = randomSequesnce(5, rnd)
    rnd = seedrandom('test')
    const arr2 = randomSequesnce(5, rnd)
    expect(arr).toStrictEqual(arr2)
  })


  test('randomInt should return the same values for same seed', () => {
    let rnd = seedrandom('test')
    const x = randomInt(1, 10, rnd)
    rnd = seedrandom('test')
    const y = randomInt(1, 10, rnd)
    expect(x).toBe(y)
  })

})
