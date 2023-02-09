import _ from 'lodash'
import { Component } from 'react'
import PropTypes from 'prop-types'
import AppStore from '~/modules/reports/store/AppStore'
import css from '../Condition.less'

export default class Assessment extends Component {
  static propTypes = {
    condition: PropTypes.object.isRequired,
  }

  renderCondition () {
    const { condition: { answer, subject } } = this.props

    return (
      <div>
        [
        {_.find(AppStore.assessments, { id: +subject })?.name}
        {' '}
        Status
        {' '}
        <b>is</b>
        {' '}
        {answer}
        ]
      </div>
    )
  }

  render () {
    return (
      <div className={`${css.preview} ${css.question}`}>
        {this.renderCondition()}
      </div>
    )
  }
}
