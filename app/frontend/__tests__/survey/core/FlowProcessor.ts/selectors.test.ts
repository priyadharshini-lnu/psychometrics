import {nextElementIdSelector} from 'libs/survey/core/preview/FlowProcessor/selectors'

const state = {
  normalizedTree: {
    '0': {},
    '0/0': {},
    '0/1': {},
    '0/1/0': {},
    '1': {},
    '1/0': {},
    '1/1': {},
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
