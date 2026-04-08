/* eslint-disable @typescript-eslint/no-explicit-any */
import _ from 'lodash'
import BlockModel from '~/modules/survey/models/Block'
import QuestionModel from '~/modules/survey/models/Question'

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
