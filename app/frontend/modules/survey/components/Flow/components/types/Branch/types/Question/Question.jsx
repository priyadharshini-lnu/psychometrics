import { Component } from 'react'
import PropTypes from 'prop-types'
import QuestionCondition from '~/libs/conditions'

export class Question extends Component {
  static propTypes = {
    condition: PropTypes.object.isRequired,
  }

  changeQuestionCondition = (cond) => {
    const {
      model, onUpdate, index,
    } = this.props
    const conditions = model.props.conditions.map((c, i) => (i === index ? cond : c))
    onUpdate({ ...model, props: { ...model.props, conditions } })
  }

  render () {
    const { questions, condition } = this.props
    return (
      <QuestionCondition
        questions={questions}
        onChange={this.changeQuestionCondition}
        condition={{ ...condition }}
      />
    )
  }
}

export default Question
