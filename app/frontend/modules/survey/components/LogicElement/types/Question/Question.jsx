import { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import QuestionCondition from '~/libs/conditions'
import { setIn, getIn } from '~/utils/immutable'

const DISABLED_QUESTION_TYPES = {
  TextEntry: {
    Email: true,
    Chat: true,
  },
  FileUpload: true,
  VideoResponse: true,
  AudioResponse: true,
}

export default class Question extends Component {
  static propTypes = {
    condition: PropTypes.object.isRequired,
  }

  getQuestions = () => {
    const { questions } = this.props
    return _.reduce(
      questions,
      (res, question) => {
        if (
          getIn(DISABLED_QUESTION_TYPES, [question.type]) === true
          || getIn(DISABLED_QUESTION_TYPES, [
            question.type,
            question.props.type,
          ]) === true
        ) {
          return res
        }
        return setIn(res, [question.id], question)
      },
      {},
    )
  }

  changeQuestionCondition = (cond) => {
    const { condition } = this.props
    condition.setData(cond)
    this.forceUpdate()
  }

  render () {
    const { condition } = this.props
    return (
      <QuestionCondition
        questions={this.getQuestions()}
        onChange={this.changeQuestionCondition}
        condition={condition}
      />
    )
  }
}
