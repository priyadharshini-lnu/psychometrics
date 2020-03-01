import _ from 'lodash'
import { ElementInterface, Block } from '../interfaces'

const InitLinearElements = {
  run (blocks: Block[]): ElementInterface[] {
    return _.map(blocks, b => ({
      type: 'Block', props: { current: `${b.id}` }, elements: [],
    }))
  },
}

export default InitLinearElements
