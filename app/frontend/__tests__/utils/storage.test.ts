import _ from 'lodash'
import {
  setItem,
  getItem,
} from '~/utils/storage'
const realDateNow = Date.now
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000

describe('storage', () => {
  test('empty storage should return null', () => {
    expect(getItem('test', 'token')).toBe(null)
  })

  test('setItem should encrypt and save data', () => {
    setItem('test', {data: 'test'}, 'token', TWENTY_FOUR_HOURS)
    const data = getItem('test', 'token')
    expect(localStorage.getItem('test')).toContain('value')
    expect(data).toStrictEqual({data: 'test'})
  })

  test('getItem should decrypt data', () => {
    const data = getItem('test', 'token')
    expect(data).toStrictEqual({data: 'test'})
  })

  test('getItem should not decrypt data with wrong token', () => {
    const wrong = getItem('test', 'wrong_token')
    const data = getItem('test', 'token')
    expect(wrong).toStrictEqual(null)
    expect(data).toStrictEqual({data: 'test'})
  })
})


describe('remove expired data', () => {
  beforeAll(() => {
    setItem('result_1', {data: 'test1'}, 'token', TWENTY_FOUR_HOURS)
    Date.now = () => {
      return 1586775246413
    }
    setItem('result_2', {data: 'test2'}, 'token', TWENTY_FOUR_HOURS)
    setItem('result_3', {data: 'test3'}, 'token', TWENTY_FOUR_HOURS)
    Date.now = realDateNow
  })

  test('expired data should be removed from storage', () => {
    expect(getItem('result_1', 'token')).toStrictEqual({data: 'test1'})
    expect(getItem('result_2', 'token')).toBe(null)
    expect(getItem('result_3', 'token')).toBe(null)
  })
})


describe('do not remove data without expire time', () => {
  beforeAll(() => {
    setItem('result_1', {data: 'test1'}, 'token')
    setItem('result_2', {data: 'test2'}, 'token')
    setItem('result_3', {data: 'test3'}, 'token')
  })

  test('expired data should be removed from storage', () => {
    expect(getItem('result_1', 'token')).toStrictEqual({data: 'test1'})
    expect(getItem('result_2', 'token')).toStrictEqual({data: 'test2'})
    expect(getItem('result_3', 'token')).toStrictEqual({data: 'test3'})
  })
})
