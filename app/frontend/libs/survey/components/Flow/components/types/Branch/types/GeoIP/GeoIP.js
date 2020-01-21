import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Select from 'react-select'
import Socket from 'cable'
import styles from '../../Condition.scss'
import GeoIPStyles from './GeoIP.scss'

const { Async } = Select
// Value restricted by list from server routes
// See routes.rb
const KEY_OPTIONS = [
  { value: 'zip_code', label: 'Postal Code' },
  { value: 'city', label: 'City' },
  { value: 'region_name', label: 'State/Region' },
  { value: 'country_name', label: 'Country Name' },
  { value: 'country_code', label: 'Country Code' },
]

const PREDICATE_OPTIONS = [
  { value: 'EqualTo', label: 'Equal To' },
  { value: 'NotEqualTo', label: 'Not Equal To' },
  { value: 'GreaterThen', label: 'Greater Then' },
  { value: 'GreaterThenOrEqual', label: 'Greater Then Or Equal To' },
  { value: 'LessThen', label: 'Less Then' },
  { value: 'LessThenOrEqual', label: 'Less Then Or Equal To' },
  { value: 'Empty', label: 'Empty' },
  { value: 'NotEmpty', label: 'Not Empty' },
  { value: 'Contains', label: 'Contains' },
  { value: 'DoesNotContains', label: 'Does Not Contains' },
  { value: 'MatchesRegexp', label: 'Matches Regexp' },
]

export class GeoIP extends Component {
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
    condition.value = ''
    this.forceUpdate()
  }

  changeSelectValue = (value) => {
    const { condition } = this.props
    condition.value = value
    this.forceUpdate()
  }

  changeValue = (e) => {
    const { condition } = this.props
    condition.value = e.currentTarget.value
    this.forceUpdate()
  }

  loadOptions = (input, callback) => {
    const { condition } = this.props
    Socket.socket().perform('geo_filter', { column: condition.key, q: input, without_notification: true }, (data) => {
      callback(null, { options: data })
    })
  }

  renderInput () {
    const { condition } = this.props
    if (condition.predicate && !condition.predicate.match(/(Empty|NotEmpty)/)) {
      if (condition.key !== 'zip_code') {
        return (
          <Async
            value={condition.value}
            loadOptions={this.loadOptions}
            onChange={this.changeSelectValue}
            minimumInput={1}
            backspaceRemoves={false}
            autosize={false}
          />
        )
      }
      return (
        <input
          className={`form-control ${GeoIPStyles.valueInput}`}
          value={condition.value}
          onChange={this.changeValue}
        />
      )
    }
    return <div className={styles.empty} />
  }

  render () {
    const { condition } = this.props
    return (
      <div className={styles.questionDock}>
        <select value={condition.key} className={`form-control ${GeoIPStyles.keySelect}`} onChange={this.changeKey}>
          {KEY_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <select
          value={condition.predicate}
          className={`form-control ${GeoIPStyles.predicateSelect}`}
          onChange={this.changePredicate}
        >
          {PREDICATE_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        {this.renderInput()}
      </div>
    )
  }
}

export default GeoIP
