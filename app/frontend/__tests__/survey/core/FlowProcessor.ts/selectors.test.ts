import {
  getNextElementId, getChildOrNextElementId,
  getElementIdByBlockId,
} from 'libs/survey/core/preview/FlowProcessor/selectors'

const state = {
  normalizedTree: {
    0: { props: { current: '1' } },
    '0/0': {},
    '0/1': {},
    '0/1/0': { props: { current: '3' } },
    1: {},
    '1/0': {},
    '1/1': { props: { current: '2' } },
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
