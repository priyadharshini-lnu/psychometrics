import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from '../Text.scss'

const DEFAULT_VALUES = ['Default answer 1', 'Default answer 2', 'Default answer 3']

export default class MultipleChoice extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    question: PropTypes.object.isRequired,
    result: PropTypes.any,
    isReal: PropTypes.bool,
  }

  getValues () {
    const { result, question } = this.props
    // TODO (atanych): implement convenient engine to preset default values for preview
    if (!result) { return DEFAULT_VALUES }
    return result.filter(r => r.value !== undefined).map(r => question.props.choicesTexts[r.index])
  }

  render () {
    const {
      model: {
        props: {
          format,
          styled,
        },
      },
      isReal,
      result,
    } = this.props
    if (isReal && !result) { return null }

    const values = this.getValues()
    if (!format || format === 'CommaSeparated') {
      return <div>{values.join(', ')}</div>
    } if (format === 'BulletedList') {
      return (
        <ul className={styled && styles.styledList}>
          {values.map((v, i) => (
            <li key={i}>
              <div className={styles.listItemBullet}>●</div>
              <div className={styles.listItemText}>{v}</div>
            </li>
          ))}
        </ul>
      )
    } if (format === 'NumberedList') {
      return (
        <ol className={styled && styles.styledList}>
          {values.map((v, i) => (
            <li key={i}>
              <div className={styles.listItemNumber}>{i + 1}</div>
              <div className={styles.listItemText}>{v}</div>
            </li>
          ))}
        </ol>
      )
    }
    return null
  }
}
