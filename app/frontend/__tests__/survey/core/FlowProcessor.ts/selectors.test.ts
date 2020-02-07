import {
  nextElementIdSelector, childOrNextElementIdSelector,
  selectElementIdByBlockId
} from 'libs/survey/core/preview/FlowProcessor/selectors'

const state = {
  normalizedTree: {
    '0': {props: {current: '1'}},
    '0/0': {},
    '0/1': {},
    '0/1/0': {props: {current: '3'}},
    '1': {},
    '1/0': {},
    '1/1': {props: {current: '2'}},
    '1/1/0': {},
    '1/2': {},
    '2': {},
  }
}


test('next element id should return valid result', () => {
  expect(nextElementIdSelector({...state, currentElement: '0'})).toStrictEqual('1')
  expect(nextElementIdSelector({...state, currentElement: '0/0'})).toStrictEqual('0/1')
  expect(nextElementIdSelector({...state, currentElement: '0/1'})).toStrictEqual('1')
  expect(nextElementIdSelector({...state, currentElement: '0/1/0'})).toStrictEqual('1')
  expect(nextElementIdSelector({...state, currentElement: '1'})).toStrictEqual('2')
  expect(nextElementIdSelector({...state, currentElement: '1/0'})).toStrictEqual('1/1')
  expect(nextElementIdSelector({...state, currentElement: '1/1'})).toStrictEqual('1/2')
  expect(nextElementIdSelector({...state, currentElement: '1/1/0'})).toStrictEqual('1/2')
  expect(nextElementIdSelector({...state, currentElement: '2'})).toStrictEqual(null)
  expect(nextElementIdSelector({normalizedTree: {}, currentElement: '0'})).toStrictEqual(null)
})

test('next child element id should return valid result', () => {
  expect(childOrNextElementIdSelector({...state, currentElement: '0'})).toStrictEqual('0/0')
  expect(childOrNextElementIdSelector({...state, currentElement: '0/0'})).toStrictEqual('0/1')
  expect(childOrNextElementIdSelector({...state, currentElement: '0/1'})).toStrictEqual('0/1/0')
  expect(childOrNextElementIdSelector({...state, currentElement: '0/1/0'})).toStrictEqual('1')
  expect(childOrNextElementIdSelector({...state, currentElement: '1'})).toStrictEqual('1/0')
  expect(childOrNextElementIdSelector({...state, currentElement: '1/0'})).toStrictEqual('1/1')
  expect(childOrNextElementIdSelector({...state, currentElement: '1/1'})).toStrictEqual('1/1/0')
  expect(childOrNextElementIdSelector({...state, currentElement: '1/1/0'})).toStrictEqual('1/2')
  expect(childOrNextElementIdSelector({...state, currentElement: '2'})).toStrictEqual(null)
  expect(childOrNextElementIdSelector({normalizedTree: {}, currentElement: '0'})).toStrictEqual(null)
})


test('select element Id by block Id', () => {
  expect(selectElementIdByBlockId(state, 1)).toStrictEqual('0')
  expect(selectElementIdByBlockId(state, 2)).toStrictEqual('1/1')
  expect(selectElementIdByBlockId(state, 3)).toStrictEqual('0/1/0')

})
