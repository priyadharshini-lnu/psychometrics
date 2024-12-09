import { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import I18nStore from '~/modules/reports/store/I18nStore'
import store from '~/modules/reports/store/PropertyPanelStore'
import Formats from './formats'

export default class MultipleChoice extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    question: PropTypes.object.isRequired,
    result: PropTypes.any,
    isReal: PropTypes.bool,
    preview: PropTypes.bool,
  }

  componentDidMount () {
    this.listener = store.addListener('change', () => this.forceUpdate())
  }

  componentWillUnmount () {
    this.listener.remove()
  }

  getValues () {
    const { result, question } = this.props
    // TODO (atanych): implement convenient engine to preset default values for preview

    if (!result) {
      return question.props.choicesTexts.map((_, i) => I18nStore.tQuestion(
        question, `choicesTexts${i + 1}`, { choice: i },
      ))
    }

    let results = result.filter(r => r.value !== undefined)
    if (question.type === 'RankOrder') {
      results = _.sortBy(results, r => parseInt(r.value, 10))
    }

    return results.map(
      r => I18nStore.tQuestion(question, `choicesTexts${r.index + 1}`, { choice: r.index }),
    )
  }

  getDescriptionList () {
    const { result, question } = this.props

    if (!result) {
      return _.times(question.props.choices, i => I18nStore.tQuestion(
        question, `descriptionTexts${i + 1}`, { choice: i },
      ))
    }

    let results = result.filter(r => r.value !== undefined)
    if (question.type === 'RankOrder') {
      results = _.sortBy(results, r => parseInt(r.value, 10))
    }

    return results.map(
      r => I18nStore.tQuestion(question, `descriptionTexts${r.index + 1}`, { choice: r.index }),
    )
  }

  update = () => {
    const { model } = this.props
    model.update()
    this.forceUpdate()
  }

  render () {
    const {
      model,
      model: { props: { format } },
      isReal,
      result,
      preview,
    } = this.props
    if (isReal && !result) { return null }

    const values = this.getValues()
    const descriptionList = this.getDescriptionList()

    const FormatComponent = Formats[format] || Formats.CommaSeparated
    return (
      <FormatComponent
        update={this.update}
        model={model}
        values={values}
        descriptionList={descriptionList}
        preview={preview}
      />
    )
  }
}


export const MultipleChoiceResult = (props) => {
  const getValues = () => {
    const { result, question } = props

    if (!result) {
      return question.props.choicesTexts.map((_, i) => I18nStore.tQuestion(
        question, `choicesTexts${i + 1}`, { choice: i },
      ))
    }

    let results = result.filter(r => r.value !== undefined)
    if (question.type === 'RankOrder') {
      results = _.sortBy(results, r => parseInt(r.value, 10))
    }

    return results.map(
      r => I18nStore.tQuestion(question, `choicesTexts${r.index + 1}`, { choice: r.index }),
    )
  }
  return getValues().join(', ')
}
