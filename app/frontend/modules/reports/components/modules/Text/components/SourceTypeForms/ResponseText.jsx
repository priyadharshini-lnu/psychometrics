/* eslint-disable react/destructuring-assignment */
import _ from 'lodash'
import { Component } from 'react'
import { Space, InputNumber } from 'antd'
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

const CAMPAIGN_FACTOR_RESULT_TYPES = [
  { value: 'name', label: 'Name' },
  { value: 'feedback', label: 'Feedback' },
]

export default class ResponseText extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    onChangeModelIn: PropTypes.func.isRequired,
  }

  // TODO combine all the onChange handlers into one
  onChangeQuestion = ({ value }) => this.props.onChangeModelIn(['props', 'question'], value)

  onChangeFormat = ({ currentTarget: { value } }) => this.props.onChangeModelIn(['props', 'format'], value)

  onChangeTextEntryFormAnswerIndex = value => this.props.onChangeModelIn(['props', 'answerIndex'], value)

  handleOnAnswerIndexCodeChange = value => this.props.onChangeModelIn(['props', 'answerIndexCode'], value)

  onChangeCampaignFactorResultType = value => this.props.onChangeModelIn(
    ['props', 'campaignFactorResultType'], value,
  )

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
    const { choices, choicesTexts } = currentQuestion.props
    return (
      <div>
        <div>TextEntry form field</div>
        <select
          className="form-control"
          value={answerIndex}
          onChange={e => this.onChangeTextEntryFormAnswerIndex(e.currentTarget.value)}
        >
          {_.times(choices, i => (<option key={i} value={i}>{choicesTexts[i]}</option>))}
        </select>
      </div>
    )
  }

  renderCampaignFactorFeedbackAnswerIndex () {
    const {
      props: {
        question, answerIndex, answerIndexCode, campaignFactorResultType,
      },
      campaignFactorsList,
    } = this.props.model
    const currentQuestion = this.lookupQuestionById(question)
    if (!currentQuestion || currentQuestion.type !== 'CampaignFactorFeedback') { return null }

    const showCodeSelectionFields = campaignFactorResultType && campaignFactorResultType === 'code'
    const answerIndexNumber = isNaN(answerIndex) ? null : answerIndex

    return (
      <Space orientation="vertical" className="w-100">
        <div>Campaign factor feedback</div>
        <label className="font-normal">
          <input
            checked={campaignFactorResultType === 'code'}
            type="checkbox"
            onChange={e => this.onChangeCampaignFactorResultType(e.currentTarget.checked ? 'code' : '')}
          />
          {' '}
          Code based
        </label>
        {showCodeSelectionFields ? (
          <select
            className="form-control"
            value={answerIndexCode || ''}
            onChange={e => this.handleOnAnswerIndexCodeChange(e.currentTarget.value)}
          >
            {!answerIndexCode ? <option value="" /> : null}
            {campaignFactorsList.map(({ code }) => (<option key={code} value={code}>{code}</option>))}
          </select>
        )
          : (
            <>
              <InputNumber
                min={1}
                value={answerIndexNumber}
                onChange={this.onChangeTextEntryFormAnswerIndex}
              />
              {answerIndexNumber ? (
                <select
                  className="form-control"
                  value={campaignFactorResultType || ''}
                  onChange={e => this.onChangeCampaignFactorResultType(e.currentTarget.value)}
                >
                  {!campaignFactorResultType ? <option value="" /> : null}
                  {CAMPAIGN_FACTOR_RESULT_TYPES.map((
                    { value, label },
                  ) => (<option key={value} value={value}>{label}</option>))}
                </select>
              ) : null}
            </>
          )
        }
      </Space>
    )
  }

  render () {
    const { props: { question } } = this.props.model
    return (
      <Space className="w-100" orientation="vertical">
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
        {this.renderCampaignFactorFeedbackAnswerIndex()}
      </Space>
    )
  }
}
