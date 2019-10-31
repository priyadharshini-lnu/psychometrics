import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import StarBar from 'components/StarBar'
import I18nStore from 'store/I18nStore'
import styles from './Star.scss'

export default class extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeValue = (i, value) => {
    const { readOnly, model } = this.props
    if (readOnly) { return }
    model.result.answer(i, value, 1)
    this.forceUpdate()
  }

  render () {
    const { model, model: { props, moduleConfig, result } } = this.props
    return (
      <div className={styles.table}>
        {_.map(model.choicesIds, (i) => {
          const object = _.find(result.answers, { index: i }) || {}
          return (
            <div key={i} className={styles.row}>
              <div className={styles.firstColumn}>
                <span>
                  {I18nStore.tQuestion(model, `choicesTexts${i + 1}`, { choice: i })
                  || moduleConfig.defaultChoiceText(i + 1)}
                </span>
              </div>
              <StarBar
                stars={props.stars}
                value={object.value || 0}
                type={props.interaction}
                onClick={e => this.changeValue(i, e)}
              />
              <div className={styles.lastColumn}>
                <span>{object.value || 0}</span>
              </div>
            </div>
          )
        })}
      </div>
    )
  }
}
