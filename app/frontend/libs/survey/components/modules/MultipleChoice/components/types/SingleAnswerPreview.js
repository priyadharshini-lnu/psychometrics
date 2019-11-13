import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import I18nStore from 'store/I18nStore'
import styles from '../MultipleChoice.scss'

export default class extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeAnswer = (e) => {
    const { model } = this.props
    model.result.answer(parseInt(e.currentTarget.value, 10))
    model.result.notApplicable = false
    this.forceUpdate()
  }

  changeNotApplicable = () => {
    const { model } = this.props
    model.result.answers = []
    model.result.notApplicable = true
    this.forceUpdate()
  }

  renderNotApplicable () {
    const { model, readOnly } = this.props
    const { props: { notApplicable }, result } = model
    if (!notApplicable) { return null }
    const checked = result.notApplicable
    return (
      <li className={`${styles.listItem} ${styles.liButton} ${checked ? styles.buttonActive : ''}`}>
        <label className={`${styles.label} ${styles.labelButton}`}>
          <input
            disabled={readOnly}
            className={styles.input}
            type="radio"
            onClick={this.changeNotApplicable}
          />
          <span>{I18nStore.tQuestion(model, 'notApplicableLabel')}</span>
        </label>
      </li>
    )
  }

  render () {
    const { readOnly, model, model: { result, moduleConfig } } = this.props
    const listStyles = {
      display: model.props.position === 'Vertical' ? 'block' : 'flex',
    }
    return (
      <ul className={`${styles.list} ${styles[model.props.position]}`} style={listStyles}>
        {_.map(model.choicesIds, (i) => {
          const object = _.find(result.answers, { index: i }) || {}
          const checked = !!object.value
          return (
            <li className={`${styles.listItem} ${styles.liButton} ${checked ? styles.buttonActive : ''}`} key={i}>
              <label className={`${styles.label} ${styles.labelButton}`}>
                <input
                  disabled={readOnly}
                  className={styles.input}
                  onChange={this.changeAnswer}
                  type="radio"
                  value={i}
                  checked={checked}
                />
                <span>
                  {I18nStore.tQuestion(model, `choicesTexts${i + 1}`, { choice: i })
                    || moduleConfig.defaultChoiceText(i + 1)}
                </span>
              </label>
            </li>
          )
        })}
        {this.renderNotApplicable()}
      </ul>
    )
  }
}
