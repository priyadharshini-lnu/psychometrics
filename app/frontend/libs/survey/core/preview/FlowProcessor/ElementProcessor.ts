/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-continue */
import _ from 'lodash'
import { nextElementIdSelector, elementSelector } from './selectors'
import BranchProcessor from './types/Branch'
import { setEmbededData } from './actions'

const BLOCK = 'Block'
const BRANCH = 'Branch'
const EMBEDDED_DATA = 'EmbeddedData'
const END = 'EndOfAssessment'
const RANDOMIZATION = 'Randomizer'

interface BlockResult {
  element: string;
}

// results
// {element: id}
// {end: true}
// null - last element

export default function ElementProcessor (
  store, current: string | null = null,
  dispatch: (...args: any[]) => any = (...args: any[]) => {},
): BlockResult | null {
  let element
  let id = current

  // eslint-disable-next-line no-cond-assign
  while (element = elementSelector(store, id)) {
    if (!element) { break }

    if (element.type === BRANCH) {
      if (BranchProcessor(store, element)) {
        id = `${id}/0`
        const result = ElementProcessor(store, id)
        if (result) {
          return result
        }
        id = nextElementIdSelector(store, id)
        continue
      } else {
        id = nextElementIdSelector(store, id)
        continue
      }
    }

    if (element.type === RANDOMIZATION) {
      id = `${id}/0`
      continue
    }

    if (element.type === EMBEDDED_DATA) {
      const data = _.reduce(element.props.storage, (obj, s: {key: string; value: string}) => {
        obj[s.key] = s.value
        return obj
      }, {})
      dispatch(setEmbededData(data))
      id = nextElementIdSelector(store, id)
      continue
    }

    if (element.type === END) { return null }

    if (id && element.type === BLOCK) {
      return { element: id }
    }

    id = nextElementIdSelector(store, id)
  }
  return null
}
