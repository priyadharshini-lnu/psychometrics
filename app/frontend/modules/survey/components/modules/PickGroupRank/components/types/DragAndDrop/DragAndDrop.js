import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import LabelEditor from 'components/LabelEditor'
import styles from './DragAndDrop.scss'

export default class extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeLabel = (collection, i, text) => {
    const { model } = this.props
    model.changeArrayProps({ collection, i, val: text })
    this.forceUpdate()
  }

  render () {
    const { model: { props, moduleConfig } } = this.props
    return (
      <div className={styles.table}>
        <div className={styles.row}>
          <div className={`${styles.column} ${styles.defaultGroup}`}>
            <div className={styles.items}>
              {_.times(props.choices, i => (
                <div className={styles.item} key={i}>
                  <LabelEditor
                    key={i}
                    onChange={e => this.changeLabel('choicesTexts', i, e)}
                    maxWidth={150}
                    value={props.choicesTexts[i] || moduleConfig.defaultChoiceText(i + 1)}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className={`${styles.column} ${styles.groups} ${props.columns ? styles.columns : ''}`}>
            {_.times(props.scalePoints, i => (
              <div key={i} className={styles.group}>
                <div className={styles.text}>
                  <LabelEditor
                    key={i}
                    onChange={e => this.changeLabel('scalePointsTexts', i, e)}
                    maxWidth={150}
                    value={props.scalePointsTexts[i] || moduleConfig.defaultScalePointText(i + 1)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
}
