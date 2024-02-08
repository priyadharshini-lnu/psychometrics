import _ from 'lodash'

// override lodash shuffle to use seedrandom instead Math.random
// https://github.com/lodash/lodash/blob/master/shuffle.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const shuffle = (array: any[], rnd = Math.random): any[] => {
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
const joinJSXElements = (arr: any[], sep: string | JSX.Element) => {
  if (arr.length === 0) {
    return []
  }

  return arr.slice(1).reduce((xs, x) => xs.concat([sep, x]), [arr[0]])
}

export const getMenuItems = (arr: object[],
  label: string,
  key: string,
  title?: string) => {
  if (arr.length <= 0 || !arr) {
    return []
  }
  return arr.map(eachItem => (
    { label: eachItem[label], key: eachItem[key], title: title ? eachItem[title] : '' }
  ))
}

export const median = (a: number[]) => {
  const half = Math.floor(a.length / 2)
  a.sort((a, b) => a - b)
  if (a.length % 2) return a[half]
  return (a[half - 1] + a[half]) / 2.0
}


export default {
  shuffle,
  joinJSXElements,
}
