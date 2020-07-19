import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import LabelEditor from 'components/LabelEditor'
import styles from '../MultipleChoice.scss'
import { NOT_APPLICABLE } from '../../../MatrixTable/components/Consts'

export default class extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeLabel = (i, text) => {
    const { model } = this.props
    model.changeArrayProps({ collection: 'choicesTexts', i, val: text })
    this.forceUpdate()
  }

  changeNotApplicableLabel = (value) => {
    const { model } = this.props
    model.changeProps({ notApplicableLabel: value })
  }

  renderNotApplicable () {
    const { model } = this.props
    const { notApplicable, notApplicableLabel } = model.props
    if (!notApplicable) { return null }
    return (
      <div>
        <input
          className={styles.input}
          type="radio"
          name={NOT_APPLICABLE}
        />
        <LabelEditor
          value={notApplicableLabel}
          onChange={this.changeNotApplicableLabel}
        />
      </div>
    )
  }

  render () {
    const { model, model: { props, moduleConfig } } = this.props
    const listStyles = {
      display: props.position === 'Vertical' ? 'block' : 'flex',
    }
    return (
      <ul className={styles.list} style={listStyles}>
        {_.times(props.choices, i => (
          <li className={styles.listItem} key={i}>
            <input
              className={styles.input}
              type="radio"
              name={`choice_${model.name}_${model.id}`}
            />
            <LabelEditor
              value={props.choicesTexts[i] || moduleConfig.defaultChoiceText(i + 1)}
              onChange={e => this.changeLabel(i, e)}
            />
          </li>
        ))}
        {this.renderNotApplicable()}
      </ul>
    )
  }
}
