import _ from 'lodash'
import {
  shuffle
} from 'utils/shuffle'
import seedrandom from 'seedrandom'

describe('seedrandom', () => {
  test('random returns the same numbers for seed', () => {
    Math.random = seedrandom('test')
    const x = Math.random()
    Math.random = seedrandom('test')
    const y = Math.random()
    expect(x).toBe(y)
  })

  test('shuffe with the same seed should return the same result', () => {
    const arr = [1, 2, 3, 4, 5]

    const arr1 = shuffle(arr, seedrandom('test'))
    const arr2 = shuffle(arr, seedrandom('test'))
    expect(arr1).toStrictEqual(arr2)
  })

  test('shuffe with a different seed the same seed should return the same result', () => {
    const arr = [1, 2, 3, 4, 5]

    const arr1 = shuffle(arr, seedrandom('test'))
    const arr2 = shuffle(arr, seedrandom('test'))
    expect(arr1).toStrictEqual(arr2)
  })
})
