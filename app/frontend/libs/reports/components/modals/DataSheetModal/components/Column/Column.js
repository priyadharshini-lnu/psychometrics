import React, { Component } from 'react'
import { DATA_SHEET_COLUMN_TYPES } from 'rb/models/Report'
import styles from './Column.module.scss'

export default class Column extends Component {
  remove = () => {
    const { remove, column } = this.props
    remove(column)
  }

  render () {
    const { update, index } = this.props
    const { column: { type, name } } = this.props
    return (
      <div className={styles.container}>
        <div className={`btn fa fa-times ${styles.remove}`} onClick={this.remove} />
        <div className={styles.inputContainer}>
          <input
            onChange={({ currentTarget }) => update(index, 'name', currentTarget.value)}
            value={name}
            className="form-control"
          />
        </div>
        <select onChange={({ currentTarget }) => update(index, 'type', currentTarget.value)} value={type}>
          <option value="" disabled>Select...</option>
          {DATA_SHEET_COLUMN_TYPES.map(t => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
    )
  }
}
