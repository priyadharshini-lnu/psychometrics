import _ from 'lodash'
import BaseTableTranslate from './BaseTableTranslate'

class Module extends BaseTableTranslate {
  textFields = ['strengths', 'blindspots']

  exportLocales () {
    const result = {
      strengths: 'Strengths',
      blindspots: 'Blindspots',
    }
    if (this.module.props.textConditions) {
      _.each(this.module.props.textConditions, (condition, i) => {
        this.textFields.forEach((field) => {
          const text = _.get(condition, field)
          if (!_.isEmpty(text)) {
            result[`textConditions${_.capitalize(field)}${i + 1}`] = text
          }
        })
      })
    }
    return result
  }
}

export default Module
