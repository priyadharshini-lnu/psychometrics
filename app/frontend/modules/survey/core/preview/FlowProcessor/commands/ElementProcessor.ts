/* eslint-disable no-continue */
import _ from 'lodash'
import { setIn, merge } from '~/utils/immutable'
import { getNextElementId, getElement } from '../selectors'
import BranchProcessor from './BranchProcessor'
import { ElementInterface, EndOfAssessmentElementProps } from '../interfaces'

const BLOCK = 'Block'
const GROUP = 'Group'
const BRANCH = 'Branch'
const EMBEDDED_DATA = 'EmbeddedData'
const END = 'EndOfAssessment'
const RANDOMIZATION = 'Randomizer'

interface BlockResult {
  element?: string | null;
  embeddedData: {};
  endOfAssessmentElementProps?: EndOfAssessmentElementProps
}

// results
// {element: id, embeddedData: data}
// {embeddedData: data} only ed = last element or end

const ElementProcessor = {
  run (
    store, current: string | null,
  ): BlockResult {
    let element: ElementInterface
    let result = { element: current, embeddedData: {} }
    // eslint-disable-next-line no-cond-assign
    while (element = getElement(store, result.element)) {
      if (!element) { break }

      switch (element.type) {
        case BRANCH:
          if (BranchProcessor.run(store, element)) {
            result = setIn(result, 'element', `${result.element}/0`)
            const { element, embeddedData, endOfAssessmentElementProps } = ElementProcessor.run(store, result.element)
            if (!element) { return { element, embeddedData, endOfAssessmentElementProps } }

            result = merge(result, { element, embeddedData: { ...result.embeddedData, ...embeddedData } })
            if (element) {
              return result
            }
          }
          break
        case GROUP:
          result = setIn(result, 'element', `${result.element}/0`)
          continue
        case RANDOMIZATION:
          result = setIn(result, 'element', `${result.element}/0`)
          continue
        case EMBEDDED_DATA:
          result = setIn(result, 'embeddedData', _.reduce(
            element.props.storage, (obj, s: {key; value}) => ({ ...obj, [s.key]: s.value }),
            result.embeddedData,
          ))
          break
        case END:
          return {
            embeddedData: result.embeddedData,
            endOfAssessmentElementProps: element.props,
          }
        case BLOCK:
          if (!store.blocks[element.props.current || '']
            || (store.blocks[element.props.current || ''] && store.blocks[element.props.current || ''].deleted)
          ) {
            break
          }
          if (result.element) {
            return result
          }
          break
        default:
      }

      result = setIn(result, 'element', getNextElementId(store, result.element))
    }
    return { embeddedData: result.embeddedData }
  },
}

export default ElementProcessor
