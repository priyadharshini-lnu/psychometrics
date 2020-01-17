import {initPages, initLinearElements, normalizeTree, nextElementId, nextParentElementId} from 'libs/survey/core/preview/FlowProcessor/helpers'

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

  expect(initPages({blocks})).toStrictEqual({1: [{questions: [1], blockId: 1, displayLogic:{}}, {questions: [2], blockId: 1}]});
});


test('simple block with question with skip_logic one page', () => {
  const blocks = [{
    id: 1,
    questions: [question(1), question(2, {skip_logic: []})]
  }]

  expect(initPages({blocks})).toStrictEqual({1: [{questions: [1, 2], blockId: 1}]});
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

  expect(initLinearElements(blocks)).toStrictEqual([{type: 'Block', props: {current: 1}, elements: []}, {type: 'Block', props: {current: 2}, elements: []}]);
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
