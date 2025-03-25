import _ from 'lodash'
import BaseTableTranslate from './BaseTableTranslate'

class Module extends BaseTableTranslate {
  textFields = ['name']

  exportLocales () {
    const columnTranslationKeys = super.exportTableColumnLocales()
    const result = { ...columnTranslationKeys }
    if (this.module.props.milestones) {
      _.each(this.module.props.milestones, (condition) => {
        this.textFields.forEach((field) => {
          const text = _.get(condition, field)
          if (!_.isEmpty(text)) {
            result[`milestone${condition.id}`] = text
          }
        })
      })
    }
    return result
  }
}

export default Module
