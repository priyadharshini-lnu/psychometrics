import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from '../MultipleChoice.scss'
import Editable from './Editable'

export default class extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  state = {
    edit: false,
  }

  renderNotApplicableOption () {
    const { model: { props: { notApplicable, notApplicableLabel } } } = this.props
    if (!notApplicable) { return null }
    return (
      <option>{notApplicableLabel}</option>
    )
  }

  renderSelect () {
    const { model, model: { props, moduleConfig } } = this.props
    return (
      <div>
        <select multiple size={6} className={styles.selectBox}>
          {_.times(props.choices, i => (
            <option key={i} value={`choice_${model.name}_${model.id}_${i}`}>
              {props.choicesTexts[i] || moduleConfig.defaultChoiceText(i + 1)}
            </option>
          ))}
          {this.renderNotApplicableOption()}
        </select>
        <div>
          <a onClick={() => this.setState({ edit: true })}>Click here to edit answers</a>
        </div>
      </div>
    )
  }

  render () {
    const { edit } = this.state
    const { model } = this.props
    return (
      edit
        ? (
          <Editable
            model={model}
            onChange={() => this.forceUpdate()}
            endEdit={() => this.setState({ edit: false })}
          />
        )
        : this.renderSelect()
    )
  }
}
