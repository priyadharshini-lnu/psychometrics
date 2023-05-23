/* eslint-disable react/destructuring-assignment */
import _ from 'lodash'
import { Component } from 'react'
import PropTypes from 'prop-types'
import Select from 'react-select'
import * as QuestionPresenter from '~/modules/reports/presenters/QuestionPresenter'
import { getValue } from '~/modules/reports/presenters/ReactSelectPresenter'
import ResponseTextByQuestionType from '../ResponseTextByQuestionType'

const VALID_QUESTIONS = _.keys(ResponseTextByQuestionType)
const FORMATS = [{
  label: 'Comma Separated',
  value: 'CommaSeparated',
}, {
  label: 'Bulleted List',
  value: 'BulletedList',
}, {
  label: 'Numbered List',
  value: 'NumberedList',
}]

export default class ResponseText extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    onChangeModelIn: PropTypes.func.isRequired,
  }

  onChangeQuestion = ({ value }) => this.props.onChangeModelIn(['props', 'question'], value)

  onChangeFormat = ({ currentTarget: { value } }) => this.props.onChangeModelIn(['props', 'format'], value)

  onChangeTextEntryFormAnswerIndex = e => this.props.onChangeModelIn(['props', 'answerIndex'], e.currentTarget.value)

  onChangeCheckbox = ({ currentTarget: { checked } }, name) => {
    this.props.onChangeModelIn(['props', name], checked)
    this.forceUpdate()
  }

  // TODO (atanych): should be added memoization. e.g. https://github.com/reduxjs/reselect
  getFilteredQuestions () {
    const { questions } = this.props
    const filteredQuestions = _.filter(
      questions, question => VALID_QUESTIONS.includes(question.type),
    )
    return filteredQuestions.map(question => ({ label: QuestionPresenter.getName(question), value: question.id }))
  }

  lookupQuestionById = (id) => {
    const { questions } = this.props
    return questions[id]
  }

  renderFormats () {
    const {
      props: {
        question, format, styled, showDescription, showHeader,
      },
    } = this.props.model
    const currentQuestion = this.lookupQuestionById(question)
    if (!currentQuestion || !['MultipleChoice', 'RankOrder'].includes(currentQuestion.type)) { return false }
    if (['SingleAnswer', 'Dropdown', 'SelectBox'].includes(currentQuestion.props.type)) { return false }
    const isList = ['BulletedList', 'NumberedList'].includes(format)
    return (
      <div>
        <div>Format</div>
        {FORMATS.map(f => (
          <label className="show" key={f.value}>
            <input
              checked={(format || FORMATS[0].value) === f.value}
              type="radio"
              onChange={this.onChangeFormat}
              value={f.value}
            />
            {f.label}
          </label>
        ))}
        {isList && <div>Styling</div>}
        {isList && (
        <label className="show">
          <input
            disabled={showHeader}
            checked={styled}
            type="checkbox"
            onChange={e => this.onChangeCheckbox(e, 'styled')}
            value={1}
          />
          {' '}
          Styled
        </label>
        )}
        {isList && (
          <label className="show">
            <input
              checked={showDescription}
              type="checkbox"
              onChange={e => this.onChangeCheckbox(e, 'showDescription')}
              value={1}
            />
            {' '}
            Show Description
          </label>
        )}
        {isList && styled && (
          <label className="show">
            <input
              checked={showHeader}
              type="checkbox"
              onChange={e => this.onChangeCheckbox(e, 'showHeader')}
              value={1}
            />
            {' '}
            Show Header
          </label>
        )}
      </div>
    )
  }

  renderTextEntryFormAnswerIndex () {
    const { props: { question, answerIndex } } = this.props.model
    const currentQuestion = this.lookupQuestionById(question)
    if (!currentQuestion || currentQuestion.type !== 'TextEntry'
      || currentQuestion.props.type !== 'Form') { return false }
    const { choices } = currentQuestion.props
    return (
      <div>
        <div>Answer No.</div>
        <select className="form-control" value={answerIndex} onChange={this.onChangeTextEntryFormAnswerIndex}>
          {_.times(choices, i => (<option key={i} value={i}>{i + 1}</option>))}
        </select>
      </div>
    )
  }

  render () {
    const { props: { question } } = this.props.model
    return (
      <div>
        <Select
          name="form-field-name"
          value={getValue(this.getFilteredQuestions(), question)}
          isClearable={false}
          options={this.getFilteredQuestions()}
          getOptionValue={opt => opt.value}
          onChange={this.onChangeQuestion}
        />
        {this.renderFormats()}
        {this.renderTextEntryFormAnswerIndex()}
      </div>
    )
  }
}
