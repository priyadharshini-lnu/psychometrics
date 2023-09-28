import {
  getNextElementId, getChildOrNextElementId,
  getElementIdByBlockId, getBlockIds, getQuestionsCount,
  getPrevBlockIds, getPrevQuestionsCount, getProgress,
  lookForEndOfAssessment, getPossibleBlocks, getPossibleQuestionsCount,
  getAllAnsweredQuestions
} from '~/modules/survey/core/preview/FlowProcessor/selectors'

const state = {
  initialized: true,
  currentPage: 0,
  allPages: {
    [Symbol.for('1')]: [{ questions: [1, 2, 3] }, { questions: [4, 5] }],
    [Symbol.for('2')]: [{ questions: [6, 7] }, { questions: [8] }],
    [Symbol.for('3')]: [{ questions: [9, 10] }],
  },
  normalizedTree: {
    0: { type: 'Block', props: { current: '1' } },
    '0/0': {},
    '0/1': {},
    '0/1/0': { type: 'Block', props: { current: '3' } },
    1: {},
    '1/0': {},
    '1/1': { type: 'Block', props: { current: '2' } },
    '1/1/0': {},
    '1/2': {},
    2: {},
  },
}


test('next element id should return valid result', () => {
  expect(getNextElementId({ ...state, currentElement: null })).toStrictEqual('0')
  expect(getNextElementId({ ...state, currentElement: '0' })).toStrictEqual('1')
  expect(getNextElementId({ ...state, currentElement: '0/0' })).toStrictEqual('0/1')
  expect(getNextElementId({ ...state, currentElement: '0/1' })).toStrictEqual('1')
  expect(getNextElementId({ ...state, currentElement: '0/1/0' })).toStrictEqual('1')
  expect(getNextElementId({ ...state, currentElement: '1' })).toStrictEqual('2')
  expect(getNextElementId({ ...state, currentElement: '1/0' })).toStrictEqual('1/1')
  expect(getNextElementId({ ...state, currentElement: '1/1' })).toStrictEqual('1/2')
  expect(getNextElementId({ ...state, currentElement: '1/1/0' })).toStrictEqual('1/2')
  expect(getNextElementId({ ...state, currentElement: '2' })).toStrictEqual(null)
  expect(getNextElementId({ normalizedTree: {}, currentElement: '0' })).toStrictEqual(null)
})

test('next child element id should return valid result', () => {
  expect(getChildOrNextElementId({ ...state, currentElement: '0' })).toStrictEqual('0/0')
  expect(getChildOrNextElementId({ ...state, currentElement: '0/0' })).toStrictEqual('0/1')
  expect(getChildOrNextElementId({ ...state, currentElement: '0/1' })).toStrictEqual('0/1/0')
  expect(getChildOrNextElementId({ ...state, currentElement: '0/1/0' })).toStrictEqual('1')
  expect(getChildOrNextElementId({ ...state, currentElement: '1' })).toStrictEqual('1/0')
  expect(getChildOrNextElementId({ ...state, currentElement: '1/0' })).toStrictEqual('1/1')
  expect(getChildOrNextElementId({ ...state, currentElement: '1/1' })).toStrictEqual('1/1/0')
  expect(getChildOrNextElementId({ ...state, currentElement: '1/1/0' })).toStrictEqual('1/2')
  expect(getChildOrNextElementId({ ...state, currentElement: '2' })).toStrictEqual(null)
  expect(getChildOrNextElementId({ normalizedTree: {}, currentElement: '0' })).toStrictEqual(null)
})


test('select element Id by block Id', () => {
  expect(getElementIdByBlockId(state, 1)).toStrictEqual('0')
  expect(getElementIdByBlockId(state, 2)).toStrictEqual('1/1')
  expect(getElementIdByBlockId(state, 3)).toStrictEqual('0/1/0')
})


test('select block ids', () => {
  expect(getBlockIds(state)).toStrictEqual(['1', '3', '2'])
})

test('getPrevBlockIds', () => {
  expect(getPrevBlockIds({ ...state, currentElement: '1' })).toStrictEqual(['1', '3'])
  expect(getPrevBlockIds({ ...state, currentElement: '1/1' })).toStrictEqual(['1', '3'])
  expect(getPrevBlockIds({ ...state, currentElement: '1/1', currentPage: 1 })).toStrictEqual(['1', '3', '2'])
  expect(getPrevBlockIds({ ...state, currentElement: '2' })).toStrictEqual(['1', '3', '2'])
})

test('getQuestionsCount', () => {
  expect(getQuestionsCount(state, getBlockIds(state))).toStrictEqual(10)
})

test('getPrevQuestionsCount', () => {
  expect(getPrevQuestionsCount({ ...state, currentElement: '0' })).toStrictEqual(0)
  expect(getPrevQuestionsCount({ ...state, currentElement: '0', currentPage: 1 })).toStrictEqual(3)
  expect(getPrevQuestionsCount({ ...state, currentElement: '1' })).toStrictEqual(7)
  expect(getPrevQuestionsCount({ ...state, currentElement: '1/1' })).toStrictEqual(7)
  expect(getPrevQuestionsCount({ ...state, currentElement: '1/1', currentPage: 1 })).toStrictEqual(9)
  expect(getPrevQuestionsCount({ ...state, currentElement: '2' })).toStrictEqual(10)
})


test('getProgress', () => {
  expect(getProgress({ ...state, currentElement: '0' })).toStrictEqual(0)
  expect(getProgress({ ...state, currentElement: '0/1/0' })).toStrictEqual(50)
  expect(getProgress({ ...state, currentElement: '2' })).toStrictEqual(100)
  expect(getProgress({ ...state, currentElement: '1/1', currentPage: 1 })).toStrictEqual(90)
})


describe('getProgress with multiple block pages', () => {
  const state = {
    initialized: true,
    currentPage: 0,
    allPages: {
      [Symbol.for('1')]: [{ questions: [1, 2, 3] }, { questions: [4, 5] }],
      [Symbol.for('2')]: [{ questions: [6, 7] }, { questions: [8] }, { questions: [11] }],
      [Symbol.for('3')]: [{ questions: [9, 10] }],
    },
    normalizedTree: {
      0: { type: 'Block', props: { current: '1' } },
      '0/0': {},
      '0/1': {},
      '0/1/0': { type: 'Block', props: { current: '3' } },
      1: {},
      '1/0': {},
      '1/1': { type: 'Block', props: { current: '2' } },
      '1/1/0': {},
      '1/2': {},
      2: {},
    },
  }

  test('getProgress', () => {
    expect(getProgress({ initialized: true, allPages: {}, normalizedTree: {} })).toStrictEqual(0)
    expect(getProgress({ ...state, allPages: {} })).toStrictEqual(0)
    expect(getProgress({ ...state, currentElement: '0' })).toStrictEqual(0)
    expect(getProgress({ ...state, currentElement: '0/1/0' })).toStrictEqual(45)
    expect(getProgress({ ...state, currentElement: '1/1', currentPage: 1 })).toStrictEqual(82)
    expect(getProgress({ ...state, currentElement: '1/1', currentPage: 2 })).toStrictEqual(91)
    expect(getProgress({ ...state, currentElement: '2' })).toStrictEqual(100)
  })
})


describe('lookForEndOfAssessment  ', () => {
  const state = {
    currentPage: 0,
    normalizedTree: {
      0: { type: 'Block', props: { current: '1' } },
      '0/0': {},
      '0/1': {},
      '0/1/0': { type: 'Block', props: { current: '3' } },
      '0/1/1': { type: 'EndOfAssessment' },
      1: {},
      '1/0': {},
      '1/1': { type: 'Block', props: { current: '2' } },
      '1/2': { type: 'EndOfAssessment' },
      2: {},
      '2/0': {},
      3: { type: 'EndOfAssessment' },
    },
  }

  test('lookForEndOfAssessment  ', () => {
    expect(lookForEndOfAssessment('0', { normalizedTree: {} })).toStrictEqual(null)
    expect(lookForEndOfAssessment('0/1', state)).toStrictEqual(null)
    expect(lookForEndOfAssessment('0/1/0', state)).toStrictEqual('0/1/1')
    expect(lookForEndOfAssessment('1', state)).toStrictEqual('3')
    expect(lookForEndOfAssessment('1/0', state)).toStrictEqual('1/2')
    expect(lookForEndOfAssessment('1/1', state)).toStrictEqual('1/2')
    expect(lookForEndOfAssessment('2', state)).toStrictEqual('3')
    expect(lookForEndOfAssessment('2/0', state)).toStrictEqual(null)
    expect(lookForEndOfAssessment('0', state)).toStrictEqual('3')
  })
})


describe('getPossibleBlocks', () => {
  const state = {
    initialized: true,
    currentPage: 0,
    allPages: {
      [Symbol.for('1')]: [{ questions: [1, 2, 3] }, { questions: [4, 5] }],
      [Symbol.for('2')]: [{ questions: [6, 7] }, { questions: [8] }, { questions: [11] }],
      [Symbol.for('3')]: [{ questions: [9, 10] }],
      [Symbol.for('4')]: [{ questions: [12, 13] }],
    },
    normalizedTree: {
      0: { type: 'Block', props: { current: '1' } },
      '0/0': { props: {} },
      '0/1': { props: {} },
      '0/1/0': { props: {} },
      '0/1/1': { type: 'Block', props: { current: '3' } },
      '0/1/2': { type: 'EndOfAssessment' },
      1: { props: {} },
      '1/0': { props: {} },
      '1/1': { type: 'Block', props: { current: '2' } },
      '1/2': { type: 'EndOfAssessment' },
      2: { props: {} },
      '2/0': { type: 'Block', props: { current: '4' } },
      3: { type: 'EndOfAssessment' },
      4: { type: 'Block', props: { current: '5' } },
    },
  }

  test('getPossibleBlocks', () => {
    expect(getPossibleBlocks({ ...state, normalizedTree: {}, currentElement: '0' })).toStrictEqual([])
    expect(getPossibleBlocks({ ...state, currentElement: '0', currentPage: 1 })).toStrictEqual(['1', '3', '2', '4'])
    expect(getPossibleBlocks({ ...state, currentElement: '0/0' })).toStrictEqual(['3', '2', '4'])
    expect(getPossibleBlocks({ ...state, currentElement: '0/1/0' })).toStrictEqual(['3'])
    expect(getPossibleBlocks({ ...state, currentElement: '1' })).toStrictEqual(['2', '4'])
    expect(getPossibleBlocks({ ...state, currentElement: '1/0' })).toStrictEqual(['2'])
    expect(getPossibleBlocks({ ...state, currentElement: '2' })).toStrictEqual(['4'])
    expect(getPossibleBlocks({ ...state, currentElement: '2/0' })).toStrictEqual(['4'])
  })

  describe('getPossibleQuestionsCount top end', () => {
    expect(getPossibleQuestionsCount({ normalizedTree: {}, allPages: {} })).toStrictEqual(0)
    expect(getPossibleQuestionsCount({ ...state, currentElement: '0' })).toStrictEqual(13)
    expect(getPossibleQuestionsCount({ ...state, currentElement: '0' })).toStrictEqual(13)
    expect(getPrevQuestionsCount({ ...state, currentElement: '0', currentPage: 1 })).toStrictEqual(3)
    expect(getPossibleQuestionsCount({ ...state, currentElement: '0', currentPage: 1 })).toStrictEqual(10)
    expect(getPrevQuestionsCount({ ...state, currentElement: '0/0' })).toStrictEqual(5)
    expect(getPossibleQuestionsCount({ ...state, currentElement: '0/0' })).toStrictEqual(8)
    expect(getPrevQuestionsCount({ ...state, currentElement: '1' })).toStrictEqual(7)
    expect(getPossibleQuestionsCount({ ...state, currentElement: '1' })).toStrictEqual(6)
  })


  describe('getPossibleQuestionsCount top end with pages', () => {
    expect(getPrevQuestionsCount({ ...state, currentElement: '0', currentPage: 1 })).toStrictEqual(3)
    expect(getPrevQuestionsCount({ ...state, currentElement: '1/1', currentPage: 0 })).toStrictEqual(7)
    expect(getPrevQuestionsCount({ ...state, currentElement: '1/1', currentPage: 1 })).toStrictEqual(9)
    expect(getPrevQuestionsCount({ ...state, currentElement: '1/1', currentPage: 2 })).toStrictEqual(10)
    expect(getPrevQuestionsCount({ ...state, currentElement: '2', currentPage: 0 })).toStrictEqual(11)
    expect(getPossibleQuestionsCount({ ...state, currentElement: '0', currentPage: 1 })).toStrictEqual(10)
    expect(getPossibleQuestionsCount({ ...state, currentElement: '1/1', currentPage: 0 })).toStrictEqual(4)
    expect(getPossibleQuestionsCount({ ...state, currentElement: '1/1', currentPage: 1 })).toStrictEqual(2)
    expect(getPossibleQuestionsCount({ ...state, currentElement: '1/1', currentPage: 2 })).toStrictEqual(1)
    expect(getPossibleQuestionsCount({ ...state, currentElement: '2', currentPage: 0 })).toStrictEqual(2)
  })



  describe('getPossibleQuestionsCount with branch end', () => {
    expect(getPrevQuestionsCount({ ...state, currentElement: '0/1/1' })).toStrictEqual(5)
    expect(getPossibleQuestionsCount({ ...state, currentElement: '0/1/1' })).toStrictEqual(2)

    expect(getPrevQuestionsCount({ ...state, currentElement: '1/0' })).toStrictEqual(7)
    expect(getPossibleQuestionsCount({ ...state, currentElement: '1/0' })).toStrictEqual(4)

    expect(getPrevQuestionsCount({ ...state, currentElement: '2' })).toStrictEqual(11)
    expect(getPossibleQuestionsCount({ ...state, currentElement: '2' })).toStrictEqual(2)
  })

  describe('getProgress with ends', () => {
    expect(getProgress({ ...state, currentElement: '0' })).toStrictEqual(0)
    expect(getProgress({ ...state, currentElement: '0/1/0' })).toStrictEqual(71)
    expect(getProgress({ ...state, currentElement: '1/1' })).toStrictEqual(64)
    expect(getProgress({ ...state, currentElement: '2' })).toStrictEqual(85)
    expect(getProgress({ ...state, currentElement: '1/1', currentPage: 1 })).toStrictEqual(82)
    expect(getProgress({ ...state, currentElement: '1/1', currentPage: 2 })).toStrictEqual(91)
    expect(getProgress({ ...state, currentElement: '3' })).toStrictEqual(100)
  })
})



describe('getPossibleBlocks with truly datasheet condition', () => {
  const state = {
    initialized: true,
    currentPage: 0,
    dataSheetColumns: [
      { name: 'x', type: 'Number' }
    ],
    dataSheet: {
      x: 1,
    },
    allPages: {
      [Symbol.for('1')]: [{ questions: [1, 2, 3] }, { questions: [4, 5] }],
      [Symbol.for('2')]: [{ questions: [6, 7] }, { questions: [8] }, { questions: [11] }],
      [Symbol.for('3')]: [{ questions: [9, 10] }],
      [Symbol.for('4')]: [{ questions: [12, 13] }],
    },
    normalizedTree: {
      0: { type: 'Block', props: { current: '1' } },
      '0/0': { props: {} },
      '0/1': { props: {} },
      '0/1/0': { props: {} },
      '0/1/1': { type: 'Block', props: { current: '3' } },
      '1': {
        type: 'Branch', props: {
          conditions: [{
            conditionType: "DataSheet",
            field: "x",
            predicate: "EqualTo",
            value: "1",
          }]
        }
      },
      '1/0': { props: {} },
      '1/1': { type: 'Block', props: { current: '2' } },
      '1/2': { type: 'EndOfAssessment' },
      2: { props: {} },
      '2/0': { type: 'Block', props: { current: '4' } },
      3: { type: 'EndOfAssessment' },
      4: { type: 'Block', props: { current: '5' } },
    },
  }

  test('getPossibleBlocks', () => {
    expect(getPossibleBlocks({ ...state, normalizedTree: {}, currentElement: '0' })).toStrictEqual([])
    expect(getPossibleBlocks({ ...state, currentElement: '0', currentPage: 1 })).toStrictEqual(['1', '3', '2', '4'])
    expect(getPossibleBlocks({ ...state, currentElement: '0/0' })).toStrictEqual(['3', '2', '4'])
    expect(getPossibleBlocks({ ...state, currentElement: '0/1/0' })).toStrictEqual(['3', '2', '4'])
    expect(getPossibleBlocks({ ...state, currentElement: '0/1/0' })).toStrictEqual(['3', '2', '4'])
    expect(getPossibleBlocks({ ...state, currentElement: '1' })).toStrictEqual(['2', '4'])
    expect(getPossibleBlocks({ ...state, currentElement: '1/0' })).toStrictEqual(['2'])
    expect(getPossibleBlocks({ ...state, currentElement: '2' })).toStrictEqual(['4'])
    expect(getPossibleBlocks({ ...state, currentElement: '2/0' })).toStrictEqual(['4'])
  })
})

describe('getPossibleBlocks with falsy datasheet condition', () => {
  const state = {
    initialized: true,
    currentPage: 0,
    dataSheetColumns: [
      { name: 'x', type: 'Number' }
    ],
    dataSheet: {
      x: 2,
    },
    allPages: {
      [Symbol.for('1')]: [{ questions: [1, 2, 3] }, { questions: [4, 5] }],
      [Symbol.for('2')]: [{ questions: [6, 7] }, { questions: [8] }, { questions: [11] }],
      [Symbol.for('3')]: [{ questions: [9, 10] }],
      [Symbol.for('4')]: [{ questions: [12, 13] }],
    },
    normalizedTree: {
      0: { type: 'Block', props: { current: '1' } },
      '0/0': { props: {} },
      '0/1': { props: {} },
      '0/1/0': { props: {} },
      '0/1/1': { type: 'Block', props: { current: '3' } },
      '1': {
        type: 'Branch', props: {
          conditions: [{
            conditionType: "DataSheet",
            field: "x",
            predicate: "EqualTo",
            value: "1",
          }]
        }
      },
      '1/0': { props: {} },
      '1/1': { type: 'Block', props: { current: '2' } },
      '1/2': { type: 'EndOfAssessment' },
      2: { props: {} },
      '2/0': { type: 'Block', props: { current: '4' } },
      3: { type: 'EndOfAssessment' },
      4: { type: 'Block', props: { current: '5' } },
    },
  }

  test('getPossibleBlocks', () => {
    expect(getPossibleBlocks({ ...state, normalizedTree: {}, currentElement: '0' })).toStrictEqual([])
    expect(getPossibleBlocks({ ...state, currentElement: '0', currentPage: 1 })).toStrictEqual(['1', '3', '4'])
    expect(getPossibleBlocks({ ...state, currentElement: '0/0' })).toStrictEqual(['3', '4'])
    expect(getPossibleBlocks({ ...state, currentElement: '0/1/0' })).toStrictEqual(['3', '4'])
    expect(getPossibleBlocks({ ...state, currentElement: '0/1/0' })).toStrictEqual(['3', '4'])
    expect(getPossibleBlocks({ ...state, currentElement: '1' })).toStrictEqual(['4'])
    expect(getPossibleBlocks({ ...state, currentElement: '2' })).toStrictEqual(['4'])
    expect(getPossibleBlocks({ ...state, currentElement: '2/0' })).toStrictEqual(['4'])
  })
})


test('getAllAnsweredQuestions', () => {
  const state = {
    allPages: {
      [Symbol.for('1')]: [{questions: [1, 2]}, {questions: [3, 4]}],
      [Symbol.for('3')]: [{questions: [11, 12]}, {questions: [9, 10]}],
      [Symbol.for('2')]: [{questions: [5, 6]}, {questions: [7, 8]}],
    },
    questions: {
      1: {id: 1},
      2: {id: 2},
      4: {id: 4},
      3: {id: 3},
      5: {id: 5},
      6: {id: 6},
      7: {id: 7},
      8: {id: 8},
      9: {id: 9},
      10: {id: 10},
      11: {id: 11},
      12: {id: 12},
    },
    results: {
      1: true,
      2: true,
      4: true,
      3: true,
      5: true,
      6: true,
      7: true,
      8: true,
      9: true,
      10: true,
      11: true,
      12: true,
    }
  }
  expect(true).toBe(true)

  expect(getAllAnsweredQuestions(state)).toStrictEqual([
    {id: 1}, {id: 2}, {id: 3}, {id: 4},
    {id: 11}, {id: 12}, {id: 9}, {id: 10},
    {id: 5}, {id: 6}, {id: 7}, {id: 8},
  ])
})
