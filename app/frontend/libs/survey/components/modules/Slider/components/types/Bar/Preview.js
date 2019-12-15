import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ProgressBar from 'components/ProgressBar'
import I18nStore from 'store/I18nStore'
import styles from './Bar.scss'

const TABLE_WIDTH = 700

export default class extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeValue = (i, value) => {
    const { model, readOnly } = this.props
    if (readOnly) { return }
    const { props } = model
    model.result.answer(i, value, props.numberOfDecimals)
    this.forceUpdate()
  }

  render () {
    const { model, model: { props, result, moduleConfig } } = this.props
    const gridMargin = `-${TABLE_WIDTH * 0.75 / (2 * props.gridLines)}px`
    return (
      <div className={styles.table}>
        <div className={`${styles.row} ${styles.labels}`}>
          <div className={styles.firstColumn} />
          <div className={styles.labelItems}>
            {_.times(props.labels, i => (
              <span key={i}>
                {I18nStore.tQuestion(model, `labelsTexts${i + 1}`, { label: i })
                  || moduleConfig.defaultLabelText(i + 1)}
              </span>
            ))}
          </div>
          <div className={styles.totalCeil}>&nbsp;</div>
        </div>
        <div className={`${styles.row} ${styles.gridLines}`}>
          <div className={styles.firstColumn} />
          <div className={styles.labelItems} style={{ marginLeft: gridMargin, marginRight: gridMargin }}>
            {_.times(props.gridLines + 1, i => (
              <span key={i}>
                {props.minValue + parseInt((props.maxValue - props.minValue) * i / props.gridLines, 10)}
              </span>
            ))}
          </div>
          <div className={styles.totalCeil}>11</div>
        </div>
        {_.map(model.choicesIds, (i) => {
          const object = _.find(result.answers, { index: i }) || {}
          return (
            <div key={i} className={styles.contentRow}>
              <div className={styles.row}>
                <div className={styles.firstColumn}>
                  <div className={styles.item}>
                    <span>
                      {I18nStore.tQuestion(model, `choicesTexts${i + 1}`, { choice: i })
                        || moduleConfig.defaultChoiceText(i + 1)}
                    </span>
                  </div>
                </div>
                <div className={styles.barOuterContainer}>
                  <div className={styles.barContainer}>
                    {_.times(props.gridLines, j => <div key={j} className={styles.barItem}>&nbsp;</div>)}
                  </div>
                  <div className={styles.progressBarContainer}>
                    <ProgressBar
                      onClick={e => this.changeValue(i, e)}
                      value={object.value || 0}
                      minValue={props.minValue}
                      maxValue={props.maxValue}
                    />
                  </div>
                </div>
                <div className={styles.totalCeil}>
                  <span>{object.value || 0}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }
}
