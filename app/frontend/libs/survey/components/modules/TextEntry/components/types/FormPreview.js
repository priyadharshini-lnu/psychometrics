import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import I18nStore from 'store/I18nStore'
import styles from '../TextEntry.scss'

export default class extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeAnswer = (index, e) => {
    const { model } = this.props
    model.result.answer(index, e.currentTarget.value)
    this.forceUpdate()
  }

  render () {
    const { readOnly, model, model: { result, moduleConfig } } = this.props

    return (
      <ul className={styles.list}>
        {_.map(model.choicesIds, i => (
          <li className={styles.listItem} key={i}>
            <span className={styles.previewLabel}>
              {I18nStore.tQuestion(model, `choicesTexts${i + 1}`, { choice: i })
                || moduleConfig.defaultChoiceText(i + 1)}
            </span>
            <input
              autoComplete="off"
              disabled={readOnly}
              className={`form-control ${styles.formInput}`}
              onChange={this.changeAnswer.bind(this, i)}
              type="text"
              value={result.answers[i].value || ''}
              name={`choice_${model.name}_${model.id}`}
            />
          </li>
        ))}
      </ul>
    )
  }
}
