import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import QuestionCondition from '~/libs/conditions'
import { getQuestions } from '~/modules/reports/core/builder/selectors'

export class Question extends Component {
  static propTypes = {
    condition: PropTypes.object.isRequired,
  }

  changeQuestionCondition = (props) => {
    const { condition } = this.props
    condition.setProps(props)
    this.forceUpdate()
  }

  render () {
    const { condition, questions } = this.props
    return (
      <QuestionCondition
        questions={questions}
        onChange={this.changeQuestionCondition}
        condition={condition.props}
      />
    )
  }
}


export default connect((state, { model }) => ({
  questions: getQuestions(state.report, model.module.assessment_id),
}), {})(Question)
