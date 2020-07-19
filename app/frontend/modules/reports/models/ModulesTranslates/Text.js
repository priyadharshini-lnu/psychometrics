import _ from 'lodash'
import BaseTranslate from './BaseTranslate'

class Text extends BaseTranslate {
  getValueByCode (field, extraData) {
    if (field === 'text') {
      return this.module.props.text
    }
    if (/^textConditions/.test(field)) {
      if (this.module.props.textConditions[extraData.condition]) {
        return this.module.props.textConditions[extraData.condition].text
      }
      return ''
    }
    if (['numberHeader', 'textHeader'].includes(field)) {
      return this.module.props[field]
    }
  }

  exportLocales () {
    const result = {
      text: this.module.props.text,
    }
    if (this.module.props.textConditions) {
      _.each(this.module.props.textConditions, (condition, i) => {
        if (!_.isEmpty(condition.text)) {
          result[`textConditions${i + 1}`] = condition.text
        }
      })
    }
    const { numberHeader, textHeader } = this.module.props
    return { ...result, numberHeader, textHeader }
  }
}

export default Text
