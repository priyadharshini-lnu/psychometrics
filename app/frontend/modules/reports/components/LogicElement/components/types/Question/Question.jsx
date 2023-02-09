import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import _ from 'lodash'
import AppStore from '~/modules/reports/store/AppStore'
import { getQuestions } from '~/modules/reports/core/builder/selectors'
import QuestionSelect from './QuestionSelect'
import AnswerSelect from './AnswerSelect'
import ConditionSelect from './ConditionSelect'
import css from './Question.less'

export class Question extends Component {
  static propTypes = {
    condition: PropTypes.object.isRequired,
  }

  change = (cond) => {
    const { condition, onChange } = this.props
    condition.setProps(cond)
    onChange()
    this.forceUpdate()
  }

  changeFilter = (e) => {
    const { condition, onChange } = this.props
    const id = e.currentTarget.value
    condition.setData({
      filterId: id,
    })
    onChange()
    this.forceUpdate()
  }

  renderFilterSelect (condition) {
    const { filterId } = condition
    return (
      <select
        value={filterId}
        onChange={this.changeFilter}
        className={`form-control ${css.assesment}`}
      >
        <option />
        {AppStore.report.filters.map((filter, i) => <option key={i} value={filter.id}>{filter.name}</option>)}
      </select>
    )
  }

  render () {
    const { condition, questions } = this.props

    return (
      <div className={css.question}>
        {this.renderFilterSelect(condition)}
        <div className={css.container}>
          <div className={css.questionBlock}>
            {condition.filterId && (
            <QuestionSelect
              questions={questions}
              condition={condition}
              onChange={this.change}
            />
            )}
            <AnswerSelect
              questions={questions}
              condition={condition}
              onChange={this.change}
            />
          </div>
          <ConditionSelect condition={condition} onChange={this.change} />
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  questions: getQuestions(state.report, _.first(AppStore.assessments).id),
}), {})(Question)
