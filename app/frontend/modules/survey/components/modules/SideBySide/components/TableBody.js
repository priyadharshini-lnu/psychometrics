/* eslint-disable no-nested-ternary */
import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import LabelEditor from 'components/LabelEditor'
import styles from './SideBySide.scss'

export class TableBody extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeLabel = (i, text) => {
    const { model } = this.props
    model.changeArrayProps({ collection: 'choicesTexts', i, val: text })
    this.forceUpdate()
  }

  update = () => {
    this.forceUpdate()
  }

  renderInput (data, scalePoint, choice) {
    if (data.type === 'Text' && data.textType === 'Essay') {
      return <textarea className={styles.Essay} />
    }

    return (
      <input
        name={`answers_${scalePoint}_${choice}`}
        className={styles[data.textType]}
        defaultValue=""
        type={data.type === 'Likert' ? (data.likertType === 'SingleAnswer' ? 'radio' : 'checkbox') : 'text'}
      />
    )
  }

  renderInputs (data, scalePoint, i) {
    return _.times(data.answers, j => (
      <div className={styles.input} key={j}>
        {this.renderInput(data, scalePoint, i)}
      </div>
    ))
  }

  renderDropdown (data) {
    const { model: { moduleConfig } } = this.props
    return (
      <select className={styles.select}>
        <option />
        {_.times(data.answers, j => (
          <option className={styles.input} key={j}>
            {data.answersTexts[j] || moduleConfig.defaultAnswerText(j + 1)}
          </option>
        ))}
      </select>
    )
  }

  renderHeaders (index) {
    const { model: { props, moduleConfig } } = this.props
    const data = props.columnsData
    const length = props.choices
    const none = props.repeatHeaders === 'None'
    const middle = props.repeatHeaders === 'Middle'
    const bottom = props.repeatHeaders === 'Bottom'
    const both = props.repeatHeaders === 'Both'
    const last = typeof index === 'undefined'

    if (bottom || both) {
      if (bottom && !last) { return }
      if (both) {
        if (!last && index !== Math.ceil(length / 2)) { return }
      }
    } else {
      if (index === 0 || none) { return }
      if (middle && index !== Math.ceil(length / 2)) { return }
    }

    return (
      <tr className={styles.answersRow}>
        <td className={`${styles.header} ${styles.column} ${styles.firstColumn}`} />
        {_.times(props.scalePoints, i => (
          <td key={i} className={styles.column}>
            <div className={styles.answers}>
              {_.times(data[i].answers, j => (
                <div className={styles.answer} key={j}>
                  <span>{data[i].answersTexts[j] || moduleConfig.defaultAnswerText(j + 1)}</span>
                </div>
              ))}
            </div>
          </td>
        ))}
      </tr>
    )
  }

  render () {
    const { model: { props, moduleConfig } } = this.props
    const data = props.columnsData
    return (
      <tbody>
        {_.times(props.choices, i => [
          this.renderHeaders(i),
          <tr className={styles.mainRow} key={i}>
            <td className={styles.firstColumn}>
              <LabelEditor
                onChange={e => this.changeLabel(i, e)}
                maxWidth="100%"
                value={props.choicesTexts[i] || moduleConfig.defaultChoiceText(i + 1)}
              />
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

export default TableBody
