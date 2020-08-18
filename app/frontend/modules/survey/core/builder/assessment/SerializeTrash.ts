/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import _ from 'lodash'
import BlockModel from 'modules/survey/models/Block'
import QuestionModel from 'modules/survey/models/Question'

interface AssessmentInterface {
  id: number
  name: string
  flow: {}
  norm_rules: []
  enable_back: boolean
  enable_progress: boolean
}

const SerializeTrash = {
  run (items: any): any {
    return _.reduce(items, (trash, item) => {
      if (item.model.isNew) { return trash }
      const deletedItem = item.type === 'block'
        ? ({
          model: BlockModel.prototype.toJSON.call(item.model),
          type: item.type,
          permanent_remove: item.model.permanentRemove,
        })
        : ({
          model: QuestionModel.prototype.toJSON.call(item.model),
          type: item.type,
          permanent_remove: item.model.permanentRemove,
        })
      return [...trash, deletedItem]
    }, [])
  },
}

export default SerializeTrash
