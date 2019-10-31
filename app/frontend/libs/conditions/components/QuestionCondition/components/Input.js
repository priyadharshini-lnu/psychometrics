import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import styles from './QuestionCondition.scss'

const PREDICATE = {
  EqualTo: 'Equal To',
  NotEqualTo: 'Not Equal To',
  GreaterThen: 'Greater Then',
  GreaterThenOrEqual: 'Greater Then Or Equal To',
  LessThen: 'Less Then',
  LessThenOrEqual: 'Less Then Or Equal To',
  Empty: 'Empty',
  NotEmpty: 'Not Empty',
  Contains: 'Contains',
  DoesNotContains: 'Does Not Contains',
  MatchesRegexp: 'Matches Regexp',
  Displayed: 'Displayed',
  NotDisplayed: 'Not Displayed',
}

export class Input extends React.Component {
  propTypes = {
    condition: PropTypes.object.isRequired,
    onChange: PropTypes.func,
    preview: PropTypes.bool,
  }

  changeType = (e) => {
    const { condition, onChange } = this.props
    condition.predicate = e.currentTarget.value
    onChange(condition)
  }

  changeValue = (e) => {
    const { condition, onChange } = this.props
    condition.value = e.currentTarget.value
    onChange(condition)
  }

  renderSelect () {
    const { condition, preview } = this.props
    if (preview) {
      return <div>{condition.predicate}</div>
    }
    return (
      <select className="form-control" value={condition.predicate} onChange={this.changeType}>
        {!condition.predicate && <option />}
        {_.map(PREDICATE, (label, value) => (<option key={value} value={value}>{label}</option>))}
      </select>
    )
  }

  renderInput () {
    const { condition, preview } = this.props
    if (preview) {
      return <div>{condition.value}</div>
    }
    if (condition.predicate && !condition.predicate.match(/(Empty|NotEmpty|Displayed|NotDisplayed)/)) {
      return (
        <input
          type="text"
          className="form-control"
          defaultValue={condition.value}
          onChange={this.changeValue}
        />
      )
    }
    return <div className={styles.empty} />
  }

  render () {
    const { preview } = this.props
    return (
      <div className={preview ? styles.predicatesPreview : styles.predicates}>
        {this.renderSelect()}
        {this.renderInput()}
      </div>
    )
  }
}

export default Input
