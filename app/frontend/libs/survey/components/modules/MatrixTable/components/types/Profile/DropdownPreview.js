import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import I18nStore from 'store/I18nStore'
import styles from './Profile.scss'
import { NOT_APPLICABLE } from '../../Consts'

export default class extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeValue = (choice, e) => {
    const { model: { result } } = this.props
    if (e.currentTarget.value === NOT_APPLICABLE) {
      _.remove(result.answers, { choice })
      result.notApplicable = result.notApplicable || {}
      result.notApplicable[choice] = true
    } else {
      result.answer(e.currentTarget.value, choice, e.currentTarget.checked)
      result.notApplicable[choice] = false
    }
    this.forceUpdate()
  }

  renderNotApplicableOption () {
    const { model } = this.props
    const { notApplicable } = model.props
    if (!notApplicable) { return null }
    return (
      <option value={NOT_APPLICABLE}>{I18nStore.tQuestion(model, 'notApplicableLabel')}</option>
    )
  }

  render () {
    const { model, model: { props, result, moduleConfig }, readOnly } = this.props
    return (
      <div className={styles.table}>
        {_.times(props.choices, (choice) => {
          const object = _.find(result.answers, { choice }) || {}
          return (
            <div key={choice} className={`${styles.row} ${styles.dropdown}`}>
              <div className={styles.firstColumn}>
                <div className={styles.item}>
                  <span>
                    {I18nStore.tQuestion(model, `choicesTexts${choice + 1}`, { choice })
                      || moduleConfig.defaultChoiceText(choice + 1)}
                  </span>
                </div>
              </div>
              <div className={styles.controls}>
                <select
                  disabled={readOnly}
                  value={object.scale}
                  onChange={this.changeValue.bind(this, choice)}
                  className={`form-control ${styles.select}`}
                >
                  <option />
                  {_.times(props.scalePoints, scale => (
                    <option key={scale} value={scale}>
                      {I18nStore.tQuestion(model, `scalePointsTexts${scale + 1}`, { scale })
                        || moduleConfig.defaultScalePointText(scale + 1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )
        })}
      </div>
    )
  }
}
