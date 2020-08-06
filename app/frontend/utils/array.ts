import _ from 'lodash'

// override lodash shuffle to use seedrandom instead Math.random
// https://github.com/lodash/lodash/blob/master/shuffle.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const shuffle = (array: any[], rnd = Math.random): any[] => {
  const length = array == null ? 0 : array.length
  if (!length) {
    return []
  }
  let index = -1
  const lastIndex = length - 1
  const result = _.clone(array)
  // eslint-disable-next-line no-plusplus
  while (++index < length) {
    const rand = index + Math.floor(rnd() * (lastIndex - index + 1))
    const value = result[rand]
    result[rand] = result[index]
    result[index] = value
  }
  return result
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const joinJSXElements = (arr: any[], sep: string) => {
  if (arr.length === 0) {
    return []
  }

  return arr.slice(1).reduce((xs, x) => xs.concat([sep, x]), [arr[0]])
}

export default {
  shuffle,
  joinJSXElements,
}
