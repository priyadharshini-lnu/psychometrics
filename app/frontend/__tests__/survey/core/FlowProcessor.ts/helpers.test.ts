import {initPages, initLinearElements} from 'libs/survey/core/preview/FlowProcessor/helpers'

const question = (id, data = {}) => ({id, ...data})

test('empty blocks', () => {
  expect(initPages({blocks: []})).toStrictEqual({});
});

test('simple block with one page', () => {
  const blocks = [{
    id: 1,
    questions: [question(1), question(2)]
  }]

  expect(initPages({blocks})).toStrictEqual({1: [{questions: [1,2], blockId: 1, errors: []}]});
});

test('simple block with page_break', () => {
  const blocks = [{
    id: 1,
    questions: [question(1), question(2, {type: 'PageBreak'}), question(3)]
  }]

  expect(initPages({blocks})).toStrictEqual({1: [{questions: [1], blockId: 1, errors: []}, {questions: [3], blockId: 1, errors: []}]});
});

test('simple block with question with display_logic', () => {
  const blocks = [{
    id: 1,
    questions: [question(1), question(2, {display_logic: {}})]
  }]

  expect(initPages({blocks})).toStrictEqual({1: [{questions: [1], blockId: 1, errors: []}, {questions: [2], blockId: 1, errors: []}]});
});


test('simple block with question with skip_logic one page', () => {
  const blocks = [{
    id: 1,
    questions: [question(1), question(2, {skip_logic: []})]
  }]

  expect(initPages({blocks})).toStrictEqual({1: [{questions: [1, 2], blockId: 1, errors: []}]});
});

test('simple block with question with skip_logic two pages', () => {
  const blocks = [{
    id: 1,
    questions: [question(1), question(2, {skip_logic: [1]}), question(3)]
  }]

  expect(initPages({blocks})).toStrictEqual({1: [{questions: [1, 2], blockId: 1, errors: []}, {questions: [3], blockId: 1, errors: []}]});
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

  expect(initPages({blocks})).toStrictEqual({1: [{questions: [1, 2,3], blockId: 1, errors: []}], 2: [{questions: [4,5], blockId: 2, errors: []}]});
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
