import React, { Component } from 'react'
import PropTypes from 'prop-types'
import I18nStore from 'rb/store/I18nStore'
import LabelEditor from 'rb/components/LabelEditor'
import store from 'rb/store/PropertyPanelStore'
import styles from '../Text.scss'

const NUMBER_HEADER = 'Rating'
const TEXT_HEADER = 'Learning Pathways'
export default class MultipleChoice extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    question: PropTypes.object.isRequired,
    result: PropTypes.any,
    isReal: PropTypes.bool,
    preview: PropTypes.bool,
  }

  componentDidMount () {
    this.listener = store.addListener('change', () => this.forceUpdate())
  }

  componentWillUnmount () {
    this.listener.remove()
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

  getDescriptionList () {
    const { result, question } = this.props

    if (!result) {
      return _.times(question.props.choices, i => I18nStore.tQuestion(
        question, `descriptionTexts${i + 1}`, { choice: i },
      ))
    }

    let results = result.filter(r => r.value !== undefined)
    if (question.type === 'RankOrder') {
      results = _.sortBy(results, r => parseInt(r.value, 10))
    }

    return results.map(
      r => I18nStore.tQuestion(question, `descriptionTexts${r.index + 1}`, { choice: r.index }),
    )
  }

  updateHeader (text, name) {
    const { model } = this.props
    model.props[name] = text
    model.update()
    this.forceUpdate()
  }

  render () {
    const {
      model,
      model: {
        props: {
          format,
          styled,
          showHeader,
          showDescription,
        },
      },
      isReal,
      result,
      preview,
    } = this.props
    if (isReal && !result) { return null }

    const values = this.getValues()
    const descriptionList = this.getDescriptionList()

    if (!format || format === 'CommaSeparated') {
      return <div>{values.join(', ')}</div>
    } if (format === 'BulletedList') {
      return (
        <ul className={styled && styles.styledList}>
          {values.map((v, i) => (
            <li key={i}>
              <div className={styles.listItemBullet}>●</div>
              <div className={styles.listItemText}>
                <div>{v}</div>
              </div>
            </li>
          ))}
        </ul>
      )
    } if (format === 'NumberedList') {
      return (
        <ol className={styled && styles.styledList}>
          {showHeader && (
          <li>
            <LabelEditor
              readOnly={preview}
              onChange={e => this.updateHeader(e, 'numberHeader')}
              value={I18nStore.tModule(model, 'numberHeader') || NUMBER_HEADER}
              styles={styles.numberHeader}
            />
            <LabelEditor
              readOnly={preview}
              onChange={e => this.updateHeader(e, 'textHeader')}
              value={I18nStore.tModule(model, 'textHeader') || TEXT_HEADER}
              styles={styles.textHeader}
            />
          </li>
          )}
          {values.map((v, i) => (
            <li key={i}>
              <div className={styles.listItemNumber}>{i + 1}</div>
              <div className={styles.listItemText}>
                <div>{v}</div>
                {showDescription
                && <div className={styles.listItemDescription}>{descriptionList[i]}</div>}
              </div>
            </li>
          ))}
        </ol>
      )
    }
    return null
  }
}
