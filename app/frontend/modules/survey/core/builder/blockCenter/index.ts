import { denormalize } from 'normalizr'
import _ from 'lodash'
import { createReducer } from '~/utils/redux'
import { setIn } from '~/utils/immutable'
import { Block as BlockInterface } from '~/modules/survey/core/preview/FlowProcessor/interfaces'
import QuestionWrapper from '~/modules/survey/models/QuestionSerializer'
import BlockWrapper from '~/modules/survey/models/BlockSerializer'
import { blocks } from '~/modules/survey/store/schema'
import { QuestionSerializer, BlockSerializer } from '../assessment/SerializeAssessment'

export const SAVE = 'survey/block_center/SAVE'
const SAVE_REQUEST = 'survey/block_center/SAVE_REQUEST'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const save = (block: BlockInterface, builder: any) => {
  const denormolizedBlock = denormalize([block.id], [blocks], builder)[0]

  const data = BlockSerializer(BlockWrapper.wrap(denormolizedBlock))
  data.questions = _.reduce(builder.questions, (questions, questionModel) => {
    const question = QuestionSerializer({
      ...QuestionWrapper.wrap(questionModel),
      deletedAt: questionModel.deleted ? new Date() : undefined,
      blockId: block.id,
    })
    return [...questions, question]
  }, [])

  return {
    type: SAVE,
    request: {
      method: 'PUT',
      url: `/administration/templates/blocks/${denormolizedBlock.id}`,
      body: { block: data },
      camelize: false,
      decamelize: false,
    },
  }
}

export const defaultState = {
  saving: false,
}

const HANDLERS = {
  [SAVE_REQUEST]: state => setIn(state, ['saving'], true),
  [SAVE]: state => setIn(state, ['saving'], false),
}

export default createReducer(HANDLERS, defaultState)
