import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { getEmbeddedData } from 'modules/reports/core/builder/selectors'
import styles from '../../Condition.less'
import embeddedStyles from './EmbeddedData.less'

export class EmbeddedData extends Component {
  static propTypes = {
    condition: PropTypes.object.isRequired,
  }

  changePredicate = (e) => {
    const { condition } = this.props
    condition.props.predicate = e.currentTarget.value
    this.forceUpdate()
  }

  changeKey = (e) => {
    const { condition } = this.props
    condition.props.key = e.currentTarget.value
    this.forceUpdate()
  }

  changeCount = (e) => {
    const { condition } = this.props
    condition.props.count = parseInt(e.currentTarget.value, 10)
    this.forceUpdate()
  }

  changeValue = (e) => {
    const { condition } = this.props
    condition.props.value = e.currentTarget.value
    this.forceUpdate()
  }

  render () {
    const { condition, embeddedData } = this.props
    return (
      <div className={styles.questionDock}>
        <select
          value={condition.props.key}
          className={`form-control ${embeddedStyles.keyInput}`}
          onChange={this.changeKey}
        >
          {!condition.props.key && <option />}
          {_.map(embeddedData, embeddedData => (
            <option key={embeddedData.value} value={embeddedData.value}>{embeddedData.value}</option>
          ))}
        </select>
        <span>Is</span>
        <select
          value={condition.props.predicate}
          className={`form-control ${embeddedStyles.predicateSelect}`}
          onChange={this.changePredicate}
        >
          {!condition.props.predicate && <option />}
          <option value="EqualTo">Equal To</option>
          <option value="NotEqualTo">Not Equal To</option>
          <option value="GreaterThen">Greater Than</option>
          <option value="GreaterThenOrEqual">Greater Than Or Equal To</option>
          <option value="LessThen">Less Than</option>
          <option value="LessThenOrEqual">Less Than Or Equal To</option>
        </select>
        <input
          className={`form-control ${embeddedStyles.valueInput}`}
          value={condition.props.count || ''}
          onChange={this.changeCount}
        />
      </div>
    )
  }
}

export default connect((state, { model }) => ({
  embeddedData: getEmbeddedData(state.report, model.module.assessment_id),
}), {})(EmbeddedData)
