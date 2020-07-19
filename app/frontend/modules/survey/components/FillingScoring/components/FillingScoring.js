import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './FillingScoring.scss'

class FillingScoring extends Component {
  static propTypes = {
    scoring: PropTypes.object.isRequired,
    onChange: PropTypes.func,
  }

  getTitle = () => {
    const { scoring } = this.props
    return (scoring && scoring.isEmptyValues() ? 'Auto' : 'Clear')
  }

  change = () => {
    const { onChange } = this.props
    onChange()
  }

  render () {
    return (
      <div className={styles.container}>
        <button className={`btn btn-default ${styles.button}`} onClick={this.change}>{this.getTitle()}</button>
      </div>
    )
  }
}

export default FillingScoring
