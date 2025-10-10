import _ from 'lodash'
import BaseTableTranslate from './BaseTableTranslate'

class Module extends BaseTableTranslate {
  textFields = ['title', 'text', 'strengths', 'blindspots', 'workstyles', 'label']

  exportLocales () {
    const result = {
      score: 'Score',
      strength: 'Strength',
      rankOrder: 'Rank',
      description: 'Description',
      strengthsBlindspots: 'Strengths & Blindspots',
    }

    if (this.module.props.benchmarksLabel) {
      result.benchmarksLabel = this.module.props.benchmarksLabel
    }
    if (this.module.props.currentJobProficiencyLabel) {
      result.currentJobProficiencyLabel = this.module.props.currentJobProficiencyLabel
    }
    if (this.module.props.targetJobProficiencyLabel) {
      result.targetJobProficiencyLabel = this.module.props.targetJobProficiencyLabel
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
