import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import I18nStore from 'store/I18nStore'
import styles from './TextBox.scss'

export default class extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeValue = (index, e) => {
    const { model } = this.props
    model.result.answer(index, parseInt(e.currentTarget.value, 10))
    this.forceUpdate()
  }

  render () {
    const { readOnly, model, model: { props, result, moduleConfig } } = this.props
    return (
      <div className={styles.table}>
        {_.times(props.choices, (i) => {
          const object = _.find(result.answers, { index: i }) || {}
          return (
            <div key={i} className={styles.row}>
              <div className={styles.item}>
                <input
                  key={i}
                  disabled={readOnly}
                  type="text"
                  className={styles.input}
                  value={object.value || ''}
                  onChange={e => this.changeValue(i, e)}
                />
                <div className={styles.item}>
                  <span>
                    {I18nStore.tQuestion(model, `choicesTexts${i + 1}`, { choice: i })
                      || moduleConfig.defaultChoiceText(i + 1)}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }
}
