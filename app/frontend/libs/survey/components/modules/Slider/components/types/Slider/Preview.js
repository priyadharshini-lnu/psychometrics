import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Slider as CustomSlider } from 'components/Slider'
import Utils from 'utils'
import I18nStore from 'store/I18nStore'
import styles from './Slider.scss'

export default class extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeValue = (i, value) => {
    const { model, readOnly } = this.props
    if (readOnly) { return }
    const { props } = model

    model.result.answer(i, _.defaultTo(value, props.defaultValue), props.numberOfDecimals)
    _.debounce(this.forceUpdate.bind(this), 200, { maxWait: 1000 })()
  }

  render () {
    const { model, model: { props, moduleConfig, result } } = this.props
    return (
      <div className={styles.table}>
        <div className={`${styles.row} ${styles.labels}`}>
          {!props.hideChoiceText && <div className={styles.firstColumn} />}
          <div className={styles.labelItems}>
            {_.times(props.labels, i => (
              <span key={i}>
                {I18nStore.tQuestion(model, `labelsTexts${i + 1}`, { label: i })
                || moduleConfig.defaultLabelText(i + 1)}
              </span>
            ))}
          </div>
          {!props.hideValue && <div className={styles.totalCeil}>&nbsp;</div>}
        </div>
        <div className={`${styles.row} ${styles.gridLines}`}>
          {!props.hideChoiceText && <div className={styles.firstColumn} />}
          {!props.hideGridValues && (
          <div className={styles.labelItems}>
            {_.times(props.gridLines + 1, i => (
              <span key={i}>
                {props.minValue
                  + Utils.round((props.maxValue - props.minValue) * i / props.gridLines, props.numberOfDecimals)}
              </span>
            ))}
          </div>
          )}
          {!props.hideValue && <div className={styles.totalCeil}>&nbsp;</div>}
        </div>
        {_.map(model.choicesIds, (i) => {
          const object = _.find(result.answers, { index: i }) || {}
          return (
            <div key={i} className={styles.contentRow}>
              <div className={styles.row}>
                {!props.hideChoiceText && (
                <div className={styles.firstColumn}>
                  <div className={styles.item}>
                    <span>
                      {I18nStore.tQuestion(model, `choicesTexts${i + 1}`, { choice: i })
                        || moduleConfig.defaultChoiceText(i + 1)}
                    </span>
                  </div>
                </div>
                )}
                <div className={styles.barOuterContainer}>
                  <div className={styles.barContainer}>
                    {_.times(props.gridLines, j => <div key={j} className={styles.barItem}>&nbsp;</div>)}
                  </div>
                  <div className={styles.progressBarContainer}>
                    <CustomSlider
                      onChange={e => this.changeValue(i, e)}
                      value={Utils.defaultTo(object.value, props.defaultValue, props.minValue, 0)}
                      minValue={props.minValue}
                      maxValue={props.maxValue}
                    />
                  </div>
                </div>
                {!props.hideValue && (
                <div className={styles.totalCeil}>
                  <span>{object.value || 0}</span>
                </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }
}
