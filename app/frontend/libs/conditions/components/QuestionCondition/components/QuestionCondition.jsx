import _ from 'lodash'
import { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './QuestionCondition.less'
import Bool from './Bool'
import Simple from './Simple'
import Input from './Input'
import Select from './Select'
import Date from './Date'
import AnswerManager from '../models/AnswerManager'

const Conditions = {
  bool: Bool,
  input: Input,
  simple: Simple,
  date: Date,
}

const FormTypes = {
  Date,
  DateTime: Date,
  Input,
  TextArea: Input,
  Select,
  MultiSelect: Select,
  Checkbox: Bool,
}

class QuestionCondition extends Component {
  static propTypes = {
    questions: PropTypes.object.isRequired,
    condition: PropTypes.object.isRequired,
    onChange: PropTypes.func,
    restricted: PropTypes.bool,
    preview: PropTypes.bool,
  }

  selectQuestion = (e) => {
    const id = e.currentTarget.value
    if (!id) { return }
    const { condition, questions } = this.props
    const question = questions[id]
    condition.subject = question.id
    condition.type = ''
    condition.answer = ''
    this.sync(condition)
  }

  changeAnswer = (answers, e) => {
    const { condition } = this.props
    const { value } = e.currentTarget
    if (!value) {
      condition.answer = ''
      condition.type = ''
      condition.predicate = ''
    } else {
      const answer = _.find(answers, { value })
      condition.answer = answer.value
      condition.type = answer.type
      condition.predicate = ''
    }
    this.sync(condition)
  }

  stripHTML = (dirtyString) => {
    dirtyString = _.unescape(dirtyString)
    dirtyString = dirtyString.replace(/<\/?[^>]+(>|$)|\\n|&nbsp;/g, '')
    return _.trim(dirtyString)
  }

  changeQuestionCondition (cond) {
    const { condition } = this.props
    condition.setData(cond)
    this.forceUpdate()
  }

  isSkipQuestion (question) {
    return question.type === 'PageBreak'
  }

  sync (condition) {
    const { onChange } = this.props
    onChange(condition)
  }

  renderAnswers () {
    const { condition, questions, preview } = this.props
    if (!condition.subject) { return }
    const question = questions[condition.subject]
    if (!question) { return }
    const answerManager = new AnswerManager(question)
    const answers = answerManager.getAnswers()
    if (preview) {
      const answer = _.find(answers, { value: condition.answer }) || { label: '' }
      return <div className={styles.margin5}>{answer.label.replace(/(<([^>]+)>)/ig, '')}</div>
    }
    return (
      <div className={styles.answers}>
        {condition.subject
          && (
          <select
            className="form-control"
            value={condition.answer || ''}
            onChange={this.changeAnswer.bind(this, answers)}
          >
            <option />
            {_.map(answers, (q, i) => <option key={i} value={q.value}>{q.label.replace(/(<([^>]+)>)/ig, '')}</option>)}
          </select>
          )}
      </div>
    )
  }

  renderCondition () {
    const { questions, condition } = this.props
    if (!condition.type) {
      return (<div className={styles.predicates} />)
    }
    const question = questions[condition.subject]
    if (question && question.props.type === 'Form') {
      const field = question.props.formTypes?.[condition.answer]
      if (field?.name) {
        const View = FormTypes[field.name]
        return <View {...this.props} field={field} />
      }
    }
    const View = Conditions[condition.type]
    return (<View {...this.props} />)
  }

  renderQuestionsSelect () {
    const { condition, preview, questions } = this.props
    if (preview) {
      const question = questions[condition.subject]
      return (
        <div className={styles.margin5}>
          {question && `${question.name} ${this.stripHTML(question.props.questionText).substring(0, 80)}`}
        </div>
      )
    }
    return (
      <div className={styles.questionSelect}>
        <select className="form-control" value={condition.subject || ''} onChange={this.selectQuestion}>
          {!condition.subject && <option />}
          {_.map(questions, (q, id) => {
            if (!this.isSkipQuestion(q)) {
              return (
                <option
                  key={id}
                  value={id}
                >
                  {`${q.name} ${this.stripHTML(q.props.questionText).substring(0, 80)}`}
                </option>
              )
            }
          })}
        </select>
      </div>
    )
  }

  render () {
    const { restricted } = this.props
    return (
      <div className={styles.container}>
        {!restricted && this.renderQuestionsSelect()}
        {this.renderAnswers()}
        <span className={styles.keyword}>is</span>
        {this.renderCondition()}
      </div>
    )
  }
}

export default QuestionCondition
