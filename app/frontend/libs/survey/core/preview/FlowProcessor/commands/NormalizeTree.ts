import _ from 'lodash'
import shuffle from 'utils/shuffle'
import seedrandom from 'seedrandom'
import { NormalizedTree } from '../interfaces'
/*
  Normalize flow tree to list
  input [{element: {children: [{...element}]}}]
  result {'0': element, '0/0': element ...}
*/

const RANDOMIZER = 'Randomizer'

const NormalizeTree = {
  run (roots, seed = ''): NormalizedTree {
    const eachChild = (list, child, path: string) => {
      if (child.elements?.length) {
        let { elements } = child
        if (child.type === RANDOMIZER) {
          elements = _.take(shuffle(elements, seedrandom(seed)), child.props.number)
        }
        list = _.reduce(elements, (list, child, i) => eachChild(list, child, `${path}/${i}`), list)
      }
      return { ...list, [path]: _.omit(child, ['elements']) }
    }
    return _.reduce(roots, (list, child, i) => eachChild(list, child, `${i}`), {})
  },
}
export default NormalizeTree
