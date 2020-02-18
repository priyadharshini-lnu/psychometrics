import _ from 'lodash'
import shuffle from 'utils/shuffle'
import seedrandom from 'seedrandom'
import { NormalizedTree } from '../interfaces'
/*
  Normalize flow tree to list
  input [{element: {children: [{...element}]}}]
  result {'0': element, '0/0': element ...}
*/

const NormalizeTree = {
  run (roots, seed = ''): NormalizedTree {
    const isRandomizer = ({ type, props }) => (type === 'Randomizer' ? { count: props.number } : null)

    const eachChild = (list, child, path: string, randomize: {count: number} | null = null) => {
      if (child?.elements?.length) {
        let { elements } = child
        if (randomize) {
          elements = _.take(shuffle(elements, seedrandom(seed)), randomize.count)
        }
        list = _.reduce(elements, (list, child, i) => eachChild(list, child, `${path}/${i}`, isRandomizer(child)), list)
      }
      return { ...list, [path]: _.omit(child, ['elements']) }
    }
    return _.reduce(roots, (list, child, i) => eachChild(list, child, `${i}`, isRandomizer(child)), {})
  },
}
export default NormalizeTree
