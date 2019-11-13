import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from '../RuleElement.scss'

export class Hris extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeKey = (e) => {
    const { model } = this.props
    model.key = e.currentTarget.value
    this.forceUpdate()
  }

  changeValue = (e) => {
    const { model } = this.props
    model.value = e.currentTarget.value
    this.forceUpdate()
  }

  render () {
    const { model } = this.props
    return (
      <div className={styles.questionDock} style={{ flex: 3 }}>
        <span className={styles.label}>field</span>
        <input className="form-control" onChange={this.changeKey} value={model.key || ''} />
        <span className={styles.label}>=</span>
        <input className="form-control" onChange={this.changeValue} value={model.value || ''} />
      </div>
    )
  }
}

export default Hris
