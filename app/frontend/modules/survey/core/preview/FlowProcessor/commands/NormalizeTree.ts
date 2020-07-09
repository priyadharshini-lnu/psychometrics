/* eslint-disable @typescript-eslint/no-explicit-any */
import _ from 'lodash'
import array from 'utils/array'
import seedrandom from 'seedrandom'
import { NormalizedTree, ElementInterface } from '../interfaces'
/*
  Normalize flow tree to list
  input [{element: {children: [{...element}]}}]
  result {'0': element, '0/0': element ...}
*/

const RANDOMIZER = 'Randomizer'

const NormalizeTree = {
  run (roots: any, seed = ''): NormalizedTree {
    const eachChild = (list, child, path: string): {[key: string]: ElementInterface} => {
      if (child.elements?.length) {
        let { elements } = child
        if (child.type === RANDOMIZER) {
          elements = _.take(array.shuffle(elements, seedrandom(seed)), child.props.number)
        }
        list = _.reduce(elements, (list, child, i) => eachChild(list, child, `${path}/${i}`), list)
      }
      return { ...list, [path]: _.omit(child, ['elements']) }
    }
    return _.reduce(roots, (list, child, i) => eachChild(list, child, `${i}`), {})
  },
}
export default NormalizeTree
