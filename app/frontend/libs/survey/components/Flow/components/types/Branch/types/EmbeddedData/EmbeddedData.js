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
    condition.predicate = e.currentTarget.value
    this.forceUpdate()
  }

  changeKey = (e) => {
    const { condition } = this.props
    condition.key = e.currentTarget.value
    this.forceUpdate()
  }

  changeValue = (e) => {
    const { condition } = this.props
    condition.value = e.currentTarget.value
    this.forceUpdate()
  }

  render () {
    const { condition } = this.props
    return (
      <div className={styles.questionDock}>
        <input
          className={`form-control ${embeddedStyles.keyInput}`}
          value={condition.key || ''}
          onChange={this.changeKey}
        />
        <span>Is</span>
        <select
          value={condition.predicate}
          className={`form-control ${embeddedStyles.predicateSelect}`}
          onChange={this.changePredicate}
        >
          <option value="EqualTo">Equal To</option>
          <option value="NotEqualTo">Not Equal To</option>
          <option value="GreaterThen">Greater Then</option>
          <option value="GreaterThenOrEqual">Greater Then Or Equal To</option>
          <option value="LessThen">Less Then</option>
          <option value="LessThenOrEqual">Less Then Or Equal To</option>
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
          value={condition.value || ''}
          onChange={this.changeValue}
        />
      </div>
    )
  }
}

export default EmbeddedData
