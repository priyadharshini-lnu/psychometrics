import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from '../../Condition.scss'
import embeddedStyles from './EmbeddedData.scss'

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

  changeValue = (e) => {
    const { condition } = this.props
    condition.props.value = e.currentTarget.value
    this.forceUpdate()
  }

  render () {
    const { condition } = this.props
    return (
      <div className={styles.questionDock}>
        <input
          className={`form-control ${embeddedStyles.keyInput}`}
          value={condition.props.key || ''}
          onChange={this.changeKey}
        />
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
          <option value="Empty">Empty</option>
          <option value="NotEmpty">Not Empty</option>
          <option value="Contains">Contains</option>
          <option value="DoesNotContains">Does Not Contains</option>
          <option value="MatchesRegexp">Matches Regexp</option>
          <option value="Displayed">Displayed</option>
          <option value="NotDisplayed">Not Displayed</option>
        </select>
        <input
          className={`form-control ${embeddedStyles.valueInput}`}
          value={condition.props.value || ''}
          onChange={this.changeValue}
        />
      </div>
    )
  }
}

export default EmbeddedData
