import React, { Component } from 'react'
import PropTypes from 'prop-types'
import I18nStore from 'rb/store/I18nStore'
import styles from '../Text.scss'

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

    if (!result) {
      return question.props.choicesTexts.map((_, i) => I18nStore.tQuestion(
        question, `choicesTexts${i + 1}`, { choice: i },
      ))
    }

    let results = result.filter(r => r.value !== undefined)
    if (question.type === 'RankOrder') {
      results = _.sortBy(results, r => parseInt(r.value, 10))
    }

    return results.map(
      r => I18nStore.tQuestion(question, `choicesTexts${r.index + 1}`, { choice: r.index }),
    )
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
