import _ from 'lodash'
import { ElementInterface, Block } from '../interfaces'

const InitLinearElements = {
  run (blocks: Block[]): ElementInterface[] {
    return _.reduce(blocks, (acc, b) => {
      if (!b.questions.length || b.deleted) { return acc }
      return [...acc, { type: 'Block', props: { current: `${b.id}` }, elements: [] }]
    }, [])
  },
}

export default InitLinearElements
