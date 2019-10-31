import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import I18nStore from 'store/I18nStore'
import styles from './SelectBox.scss'

export default class extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  selectedItemId = null

  current = null

  componentWillMount () {
    const { model, model: { moduleConfig } } = this.props
    const collection = model.props.choicesTexts
    model.props.choicesTexts = collection.map((item, i) => item || moduleConfig.defaultChoiceText(i + 1))
  }

  componentDidUpdate () {
    _.each(this.select.options, (option) => {
      option.selected = false
      if (+option.value === this.selectedItemId) {
        option.selected = true
      }
    })
  }

  change = (e) => {
    const select = e.currentTarget
    const val = select.value
    this.current = +val
    this.selectedItemId = +val
    _.each(select.options, (option) => {
      if (option.value !== val) {
        option.selected = false
      }
    })
  }

  reSelect = () => {
    _.each(this.select.options, (option) => {
      option.selected = false
      if (+option.value === this.selectedItemId) {
        option.selected = true
      }
    })
  }


  move = (step) => {
    const { model, readOnly } = this.props
    if (readOnly) { return }
    const data = model.result.answers
    const currentItem = _.find(data, { index: this.selectedItemId })
    if ((((!currentItem || currentItem.value === 0) && step < 0)
        || currentItem.value >= data.length - 1) && step > 0) { return }

    const oldCurrentItemValue = currentItem.value
    const newCurrentItemValue = currentItem.value + step
    const newAnswers = data.map((answer) => {
      if (answer.index === this.selectedItemId) { return { ...answer, value: newCurrentItemValue } }
      if (answer.value === newCurrentItemValue) { return { ...answer, value: oldCurrentItemValue } }
      return answer
    })

    model.result.answer(newAnswers)
    this.forceUpdate()
  }

  renderPanel () {
    return (
      <div className={`${styles.panel}`}>
        <a className={`btn btn-default ${styles.btn}`} onClick={this.move.bind(this, -1)}>
          <span className="fa fa-arrow-up" />
        </a>
        <a className={`btn btn-default ${styles.btn}`} onClick={this.move.bind(this, 1)}>
          <span className="fa fa-arrow-down" />
        </a>
      </div>
    )
  }

  render () {
    const { readOnly, model, model: { moduleConfig } } = this.props
    const data = _.sortBy(model.result.answers, 'value')

    return (
      <div className={styles.preview}>
        <div className={styles.container}>
          {this.renderPanel()}
          <select
            ref={(ref) => { this.select = ref }}
            disabled={readOnly}
            multiple
            size={10}
            onChange={this.change}
            className={styles.select}
          >
            {_.map(data, (item, i) => (
              <option value={item.index} key={i}>
                {I18nStore.tQuestion(model, `choicesTexts${item.index + 1}`, { choice: item.index })
                  || moduleConfig.defaultChoiceText(item.index + 1)}
              </option>
            ))}
          </select>
          {this.renderPanel()}
        </div>
      </div>
    )
  }
}
