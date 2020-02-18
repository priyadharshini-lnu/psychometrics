/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-continue */
import _ from 'lodash'
import { getNextElementId, getElement } from '../selectors'
import BranchProcessor from './BranchProcessor'
import { ElementInterface } from '../interfaces'

const BLOCK = 'Block'
const BRANCH = 'Branch'
const EMBEDDED_DATA = 'EmbeddedData'
const END = 'EndOfAssessment'
const RANDOMIZATION = 'Randomizer'

interface BlockResult {
  element?: string;
  embeddedData: {};
}

// results
// {element: id, embeddedData: data}
// {embeddedData: data} only ed = last element or end

const ElementProcessor = {
  run (
    store, current: string | null,
  ): BlockResult {
    let element: ElementInterface | null
    let id = current
    let embeddedData = { }
    // eslint-disable-next-line no-cond-assign
    while (element = getElement(store, id)) {
      if (!element) { break }

      switch (element.type) {
        case BRANCH:
          if (BranchProcessor.run(store, element)) {
            id = `${id}/0`
            const { element, embeddedData: ed } = ElementProcessor.run(store, id)
            embeddedData = { ...embeddedData, ...ed }
            if (element) {
              return { element, embeddedData }
            }
          }
          break
        case RANDOMIZATION:
          id = `${id}/0`
          continue
        case EMBEDDED_DATA:
          embeddedData = _.reduce(
            element.props.storage, (obj, s: {key; value}) => ({ ...obj, [s.key]: s.value }),
            embeddedData,
          )
          break
        case END:
          return { embeddedData }
        case BLOCK:
          if (id) {
            return { element: id, embeddedData }
          }
          break
        default:
      }

      id = getNextElementId(store, id)
    }
    return { embeddedData }
  },
}

export default ElementProcessor
