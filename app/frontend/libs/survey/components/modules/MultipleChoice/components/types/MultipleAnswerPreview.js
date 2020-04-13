import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from '../MultipleChoice.scss'
import connect from '../../connect'

class MultipleAnswerPreview extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeAnswer = (index, e) => {
    const { model } = this.props
    model.result.notApplicable = false
    model.result.answer(index, e.currentTarget.checked)
    this.forceUpdate()
  }

  changeNotApplicable = () => {
    const { model } = this.props
    model.result.answers = []
    model.result.notApplicable = true
    model.result.reduxAnswer()
    this.forceUpdate()
  }

  renderNotApplicable () {
    const { model, I18n } = this.props
    const { props: { notApplicable }, result } = model
    if (!notApplicable) { return null }
    const checked = result.notApplicable
    return (
      <li className={`${styles.listItem} ${styles.liButton} ${checked ? styles.buttonActive : ''}`}>
        <label className={`${styles.label} ${styles.labelButton}`}>
          <input
            className={styles.input}
            type="checkbox"
            onClick={this.changeNotApplicable}
          />
          <span>{I18n.tQuestion(model, 'notApplicableLabel')}</span>
        </label>
      </li>
    )
  }

  render () {
    const {
      model, model: { moduleConfig }, readOnly, I18n,
    } = this.props

    const result = model.result || []
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
                  checked={checked}
                  onChange={this.changeAnswer.bind(this, i)}
                  type="checkbox"
                />
                <span>
                  {I18n.tQuestion(model, `choicesTexts${i + 1}`, { choice: i })
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

export default connect(MultipleAnswerPreview)
