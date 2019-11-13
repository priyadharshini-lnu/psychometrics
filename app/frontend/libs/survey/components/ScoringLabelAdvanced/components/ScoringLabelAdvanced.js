import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Utils from 'utils'
import styles from './ScoringLabelAdvanced.scss'

class ScoringLabelAdvanced extends Component {
  static propTypes = {
    label: PropTypes.string.isRequired,
    filled: PropTypes.bool.isRequired,
    disabled: PropTypes.bool,
    onToggle: PropTypes.func.isRequired,
    onClear: PropTypes.func.isRequired,
    onSet: PropTypes.func.isRequired,
    onAsc: PropTypes.func.isRequired,
    onDesc: PropTypes.func.isRequired,
  }

  state = {
    template: '',
  }

  change = (e) => {
    const { onSet } = this.props
    const value = Utils.parseFloat(e.currentTarget.value)
    onSet(value)
    this.setState({ template: value })
  }

  onClear = (e) => {
    const { onClear } = this.props
    onClear()
    e.preventDefault()
  }

  onAsc = (e) => {
    const { onAsc } = this.props
    onAsc()
    e.preventDefault()
  }

  onDesc = (e) => {
    const { onDesc } = this.props
    onDesc()
    e.preventDefault()
  }

  renderComponent () {
    const { onToggle, filled, label } = this.props
    const { template } = this.state
    return (
      <div className={`btn-group ${styles.container}`}>
        <button
          type="button"
          onClick={onToggle}
          className={`btn btn-default ${filled ? styles.fill : styles.empty} ${styles.leftBtn}`}
        >
          {label}
        </button>
        <button
          type="button"
          className={`btn btn-default dropdown-toggle ${filled ? styles.fill : styles.empty} ${styles.rightBtn}`}
          data-toggle="dropdown"
        >
          <span className="caret" />
          <span className="sr-only">{label}</span>
        </button>
        <ul className={`dropdown-menu dropdown-menu-right ${styles.dropdownMenu}`}>
          <li><a href="#" onClick={this.onClear}>Clear Scores</a></li>
          <li><a href="#" onClick={this.onAsc}>Score Ascending</a></li>
          <li><a href="#" onClick={this.onDesc}>Score Descending</a></li>
          <li className={styles.setScoresContainer}>
            <div>Set Scores to:</div>
            <input value={template || ''} onChange={this.change} />
          </li>
        </ul>
      </div>
    )
  }

  renderMock () {
    const { label } = this.props

    return (
      <div className={`${styles.container}`}>
        <button className={`${styles.mockBtn} ${styles.empty}`}>
          {label}
        </button>
      </div>
    )
  }

  render () {
    const { disabled } = this.props
    return !disabled ? this.renderComponent() : this.renderMock()
  }
}

export default ScoringLabelAdvanced
