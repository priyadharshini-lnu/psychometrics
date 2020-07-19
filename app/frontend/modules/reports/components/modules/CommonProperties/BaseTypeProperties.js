import React, { Component } from 'react'
import cs from 'classnames'
import { DATA_SHEET } from 'rb/models/Module'
import styles from './BaseTypeProperties.scss'

class BaseTypeProperties extends Component {
  onChange = (value) => {
    const { model, onSelect } = this.props
    model.props.source = {
      type: value,
    }

    onSelect()
  }

  render () {
    const { model } = this.props
    return (
      <div className={cs('btn-group', styles.sourceGroup)}>
        <button
          onClick={() => this.onChange()}
          type="button"
          className={cs('btn', 'btn-default', { active: model.isBasedOnAssessment() })}
        >
          Assessment
        </button>
        <button
          onClick={() => this.onChange(DATA_SHEET)}
          type="button"
          className={cs('btn', 'btn-default', { active: model.isBasedOnDataSheet() })}
        >
          Data Sheet
        </button>
      </div>
    )
  }
}

export default BaseTypeProperties
