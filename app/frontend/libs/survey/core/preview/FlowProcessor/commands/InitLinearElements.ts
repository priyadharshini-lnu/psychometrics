import _ from 'lodash'
import { ElementInterface } from '../interfaces'

const InitLinearElements = {
  run (blocks): ElementInterface[] {
    return _.map(blocks, b => ({
      type: 'Block', props: { current: `${b.id}` }, elements: [],
    }))
  },
}

export default InitLinearElements
