import _ from 'lodash'
import Config, { AdditionalConditions } from '../Config'
import MatrixTableConditions from './MatrixTableConditions'
import SideBySideConditions from './SideBySideConditions'
import PickGroupRankConditions from './PickGroupRankConditions'

const TEXT_FIELD_INPUTS = {
  Input: 'input',
  TextArea: 'input',
  Checkbox: 'bool',
  Select: 'input',
  MultiSelect: 'input',
  Date: 'date',
}

class AnswerManager {
  constructor (question) {
    this.question = question
    this.config = Config[question.type]
  }

  customConditionMatrixAnswers () {
    return MatrixTableConditions(this)
  }

  customConditionSideBySideAnswers () {
    return SideBySideConditions(this)
  }

  customConditionHotSpotAnswers () {
    const fields = this.config.conditions
    const result = []
    if (fields.additional[this.question.props.interactivity]) {
      _.each(fields.additional[this.question.props.interactivity], (condition) => {
        result.push(condition)
      })
    }
    return result
  }

  customConditionPickGroupRankAnswers () {
    return PickGroupRankConditions(this)
  }

  customConditionGraphicSlider () {
    const result = []
    for (let i = this.question.props.min; i <= this.question.props.max; i += 1) {
      result.push({ value: i.toString(), label: i, type: 'bool' })
    }
    return result
  }

  customConditionGapAnalysis () {
    const result = []
    const data = this.question.props.categoriesData

    let emotions = ['Very Unhappy', 'Unhappy', 'Neither Happy nor Unhappy', 'Happy', 'Very Happy']
    if (this.question.props.type !== 'Positive') emotions = _.reverse(emotions)

    _.times(this.question.props.choices, (i) => {
      const choiceText = this.question.props.choicesTexts[i] || this.config.defaultCategoryText(i + 1)
      const value = `row_${i.toString()}`

      _.times(5, (j) => {
        result.push({ value: `${value}_col_${j}`, label: `${choiceText} - ${emotions[j]}`, type: 'bool' })
      })

      _.map(data[i].texts, (text, j) => {
        result.push({
          value: `${value}_why_${j}`,
          label: `${choiceText} - ${text || this.config.defaultAnswerText(j + 1)}`,
          type: 'bool',
        })
      })
    })
    return result
  }

  customConditionTiming () {
    const fields = {
      firstClick: 'First Click',
      lastClick: 'Last Click',
      pageSubmit: 'Page Submit',
      clickCount: 'Click Count',
    }
    return _.map(fields, (label, value) => ({ value, label, type: 'input' }))
  }

  customConditionMetaInfo () {
    const fields = {
      browser: 'Browser',
      version: 'Version ',
      os: 'Operating System',
      screen: 'Screen Resolution',
      flash: 'Flash Version',
      java: 'Java Support',
      userAgent: 'User Agent',
    }
    return _.map(fields, (label, value) => ({ value, label, type: 'input' }))
  }

  customConditionCaptcha () {
    return [{ value: '0', label: this.question.props.questionText, type: 'simple' }]
  }

  customConditionStaticContent () {
    return [{ value: '0', label: this.question.props.questionText, type: 'simple' }]
  }

  customTextEntryContent () {
    return _.map(this.question.props.choicesTexts, (text, i) => {
      const input = this.question.props.formTypes && this.question.props.formTypes[i]
      return {
        value: i.toString(),
        label: text,
        type: input ? TEXT_FIELD_INPUTS[input.name] : 'input',
      }
    })
  }

  customConditionTextEntryDates () {
    return [{
      value: 'TextField',
      label: 'Date',
      type: 'date',
    }]
  }

  customConditionCampaignFactorFeedback () {
    return []
  }

  getAnswers () {
    if (!this.config || !this.config.conditions) {
      return
    }
    switch (this.question.type) {
      case 'MatrixTable':
        return this.customConditionMatrixAnswers()
      case 'SideBySide':
        return this.customConditionSideBySideAnswers()
      case 'HotSpot':
        return this.customConditionHotSpotAnswers()
      case 'PickGroupRank':
        return this.customConditionPickGroupRankAnswers()
      case 'GraphicSlider':
        return this.customConditionGraphicSlider()
      case 'GapAnalysis':
        return this.customConditionGapAnalysis()
      case 'Timing':
        return this.customConditionTiming()
      case 'MetaInfo':
        return this.customConditionMetaInfo()
      case 'Captcha':
        return this.customConditionCaptcha()
      case 'StaticContent':
        return this.customConditionStaticContent()
      case 'TextEntry': {
        if (this.question.props.type === 'Form') {
          return this.customTextEntryContent()
        }
        if (this.question.props.type === 'DateEntry' || this.question.props.type === 'DateTimeEntry') {
          return this.customConditionTextEntryDates()
        }
        break
      }
      case 'CampaignFactorFeedback': {
        return this.customConditionCampaignFactorFeedback()
      }
      default:
    }
    const fields = this.config.conditions[this.question.props.type]
    let result = []
    if (fields && fields.collection) {
      result = _.map(this.question.props[fields.collection], (field, i) => (
        { value: i.toString(), label: `${field || this.config.defaultChoiceText(i + 1)}`, type: fields.type }
      ))
    }

    if (this.question.props.notApplicable) {
      result.push(AdditionalConditions.NotApplicable)
    }

    if (fields && fields.additional) {
      _.each(fields.additional, (condition) => {
        result.push(condition)
      })
    }

    return result
  }
}

export default AnswerManager
