import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import LabelEditor from 'components/LabelEditor'
import ProgressBar from 'components/ProgressBar'
import Utils from 'utils'
import styles from './Bar.scss'

const TABLE_WIDTH = 700

export default class extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeLabel = (collection, i, text) => {
    const { model } = this.props
    model.changeArrayProps({ collection, i, val: text })
    this.forceUpdate()
  }

  changeValue = (i, value) => {
    const { model, model: { props } } = this.props
    model.changeArrayProps({ collection: 'fakeResults', i, val: Utils.round(value, props.numberOfDecimals) })
    this.forceUpdate()
  }

  render () {
    const { model: { props, moduleConfig } } = this.props
    const gridMargin = `-${TABLE_WIDTH * 0.75 / (2 * props.gridLines)}px`
    return (
      <div className={styles.table}>
        <div className={`${styles.row} ${styles.labels}`}>
          <div className={styles.firstColumn} />
          <div className={styles.labelItems}>
            {_.times(props.labels, i => (
              <LabelEditor
                key={i}
                onChange={e => this.changeLabel('labelsTexts', i, e)}
                maxWidth={150}
                value={props.labelsTexts[i] || moduleConfig.defaultLabelText(i + 1)}
              />
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
        {_.times(props.choices, i => (
          <div key={i} className={styles.contentRow}>
            <div className={styles.row}>
              <div className={styles.firstColumn}>
                <div className={styles.item}>
                  <LabelEditor
                    onChange={e => this.changeLabel('choicesTexts', i, e)}
                    maxWidth={150}
                    value={props.choicesTexts[i] || moduleConfig.defaultChoiceText(i + 1)}
                  />
                </div>
              </div>
              <div className={styles.barOuterContainer}>
                <div className={styles.barContainer}>
                  {_.times(props.gridLines, j => <div key={j} className={styles.barItem}>&nbsp;</div>)}
                </div>
                <div className={styles.progressBarContainer}>
                  <ProgressBar
                    onClick={e => this.changeValue(i, e)}
                    value={props.fakeResults[i]}
                    minValue={props.minValue}
                    maxValue={props.maxValue}
                  />
                </div>
              </div>
              <div className={styles.totalCeil}>
                <span>{props.fakeResults[i]}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }
}
