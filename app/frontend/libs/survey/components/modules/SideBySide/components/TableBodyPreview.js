import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import I18nStore from 'store/I18nStore'
import styles from './SideBySide.scss'

export class TableBodyPreview extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeValue = (scale, choice, answer, e) => {
    const { model } = this.props
    model.result.answer(scale, choice, answer, e.currentTarget.value, e.currentTarget.checked)
    this.forceUpdate()
  }

  renderInput (data, scalePoint, choice, index) {
    const { model, readOnly } = this.props
    const object = _.find(model.result.answers, { scale: scalePoint, choice })
    let defaultValue = {}
    if (object) {
      defaultValue = _.find(object.values, { index }) || {}
    }
    if (data.type === 'Text' && data.textType === 'Essay') {
      return (
        <textarea
          disabled={readOnly}
          onChange={this.changeValue.bind(this, scalePoint, choice, index)}
          value={defaultValue.value}
          className={styles.Essay}
        />
      )
    }
    if (data.type === 'Text') {
      return (
        <input
          disabled={readOnly}
          className={styles[data.textType]}
          checked={!!defaultValue.value}
          value={defaultValue.value || ''}
          onChange={this.changeValue.bind(this, scalePoint, choice, index)}
        />
      )
    }
    return (
      <input
        disabled={readOnly}
        className={styles[data.textType]}
        checked={!!defaultValue.value}
        value={defaultValue.value}
        onChange={this.changeValue.bind(this, scalePoint, choice, index)}
        type={data.likertType === 'SingleAnswer' ? 'radio' : 'checkbox'}
      />
    )
  }

  renderInputs (data, scalePoint, i) {
    return _.times(data.answers, j => (
      <div className={styles.input} key={j}>
        {this.renderInput(data, scalePoint, i, j)}
      </div>
    ))
  }

  renderDropdown (data, scalePoint, choice) {
    const { readOnly, model, model: { result, moduleConfig } } = this.props
    const object = _.find(result.answers, { choice, scale: scalePoint }) || {}
    const values = object.values || [{}]
    return (
      <select
        disabled={readOnly}
        value={values[0].value || ''}
        onChange={this.changeValue.bind(this, scalePoint, choice, null)}
        className={styles.select}
      >
        <option value="" />
        {_.times(data.answers, j => (
          <option
            className={styles.input}
            key={j}
            value={j}
          >
            {I18nStore.tQuestion(model, `answersTexts${scalePoint + 1}_${j + 1}`, { answer: j, group: scalePoint })
              || moduleConfig.defaultAnswerText(j + 1)}
          </option>
        ))}
      </select>
    )
  }

  renderHeaders (index) {
    const { model, model: { props, moduleConfig } } = this.props
    const data = props.columnsData
    const length = props.choices
    const none = props.repeatHeaders === 'None'
    const middle = props.repeatHeaders === 'Middle'
    const bottom = props.repeatHeaders === 'Bottom'
    const both = props.repeatHeaders === 'Both'
    const last = typeof index === 'undefined'

    if (bottom || both) {
      if (bottom && !last) {
        return
      }
      if (both) {
        if (!last && index !== Math.ceil(length / 2)) {
          return
        }
      }
    } else {
      if (index === 0 || none) {
        return
      }
      if (middle && index !== Math.ceil(length / 2)) {
        return
      }
    }

    return (
      <tr className={styles.answersRow}>
        <td className={`${styles.header} ${styles.column} ${styles.firstColumn}`} />
        {_.times(props.scalePoints, i => (
          <td key={i} className={styles.column}>
            <div className={styles.answers}>
              {_.times(data[i].answers, j => (
                <div className={styles.answer} key={j}>
                  <span>
                    {I18nStore.tQuestion(model, `answersTexts${j + 1}_${i + 1}`, { answer: j, group: i })
                      || moduleConfig.defaultAnswerText(j + 1)}
                  </span>
                </div>
              ))}
            </div>
          </td>
        ))}
      </tr>
    )
  }

  render () {
    const { model, model: { props, moduleConfig } } = this.props
    const data = props.columnsData
    return (
      <tbody>
        {_.times(props.choices, i => [
          this.renderHeaders(i),
          <tr className={styles.mainRow} key={i}>
            <td className={styles.firstColumn}>
              <span>
                {I18nStore.tQuestion(model, `choicesTexts${i + 1}`, { choice: i })
                  || moduleConfig.defaultChoiceText(i + 1)}
              </span>
            </td>
            {_.times(props.scalePoints, (scalePoint) => {
              const dropdown = (data[scalePoint].type === 'Likert'
              && data[scalePoint].likertType === 'DropDown')
              return (
                <td key={scalePoint} className={styles.column}>
                  <div className={`${styles.inputs} ${dropdown ? styles.dropdowns : ''}`}>
                    {dropdown
                      ? this.renderDropdown(data[scalePoint], scalePoint, i)
                      : this.renderInputs(data[scalePoint], scalePoint, i)}
                  </div>
                </td>
              )
            })}
          </tr>,
        ])}
        {this.renderHeaders()}
      </tbody>
    )
  }
}

export default TableBodyPreview
