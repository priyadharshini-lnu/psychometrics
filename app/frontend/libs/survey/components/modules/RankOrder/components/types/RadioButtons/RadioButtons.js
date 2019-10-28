import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import LabelEditor from 'components/LabelEditor'
import styles from './RadioButtons.scss'

export default class extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  change = (e) => {
    const select = e.currentTarget
    const val = select.value

    _.each(select.options, (option) => {
      if (option.value !== val) {
        option.selected = false
      }
    })
  }

  changeLabel = (i, text) => {
    const { model } = this.props
    model.changeArrayProps({ collection: 'choicesTexts', i, val: text })
    this.forceUpdate()
  }

  render () {
    const { model, model: { props, moduleConfig } } = this.props
    return (
      <div className={styles.table}>
        <div className={styles.row}>
          <div className={styles.firstColumn} />
          <div className={styles.inputs}>
            {_.times(props.choices, i => (
              <div key={i} className={styles.radio}>
                <span className={styles.item}>{i + 1}</span>
              </div>
            ))}
          </div>
        </div>
        {_.times(props.choices, i => (
          <div key={i} className={styles.row}>
            <div className={styles.firstColumn}>
              <div className={styles.item}>
                <LabelEditor
                  onChange={e => this.changeLabel(i, e)}
                  maxWidth={150}
                  value={props.choicesTexts[i] || moduleConfig.defaultChoiceText(i + 1)}
                />
              </div>
            </div>
            <div className={styles.inputs}>
              {_.times(props.choices, j => (
                <div key={j} className={styles.radio}>
                  <input
                    name={`${model.name}_${i}`}
                    type="radio"
                    className={styles.input}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }
}
