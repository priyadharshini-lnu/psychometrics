import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cs from 'classnames'
import styles from '../MultipleChoice.scss'
import connect from '../../connect'

class SingleAnswerPreview extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeAnswer = (e) => {
    const { model } = this.props
    model.result.notApplicable = false
    model.result.answer(parseInt(e.currentTarget.value, 10))
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
    const { model, readOnly, I18n } = this.props
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
          <span>{I18n.tQuestion(model, 'notApplicableLabel')}</span>
        </label>
      </li>
    )
  }

  render () {
    const {
      readOnly, model, model: { result, moduleConfig }, I18n,
    } = this.props
    const listStyles = {
      display: model.props.position === 'Vertical' ? 'block' : 'flex',
    }
    return (
      <ul className={cs(styles.list, styles[model.props.position], styles.singleAnswer)} style={listStyles}>
        {_.map(model.choicesIds, (i) => {
          const object = _.find(result.answers, { index: i }) || {}
          const checked = !!object.value
          return (
            <li className={`${styles.listItem} ${styles.liButton} ${checked ? styles.buttonActive : ''}`} key={i}>
              <label className={`${styles.label} ${styles.labelButton}`}>
                <span className={cs('fa fa-check', styles.checkIcon)} />
                <input
                  disabled={readOnly}
                  className={styles.input}
                  onChange={this.changeAnswer}
                  type="radio"
                  value={i}
                  checked={checked}
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

export default connect(SingleAnswerPreview)
