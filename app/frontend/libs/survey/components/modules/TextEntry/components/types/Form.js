import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import LabelEditor from 'components/LabelEditor'
import styles from '../TextEntry.scss'

export default class extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeLabel = (i, text) => {
    const { model } = this.props
    model.changeArrayProps({ collection: 'choicesTexts', i, val: text })
    this.forceUpdate()
  }

  render () {
    const { model, model: { props, moduleConfig } } = this.props
    return (
      <ul className={styles.list}>
        {_.times(props.choices, i => (
          <li className={styles.listItem} key={i}>
            <LabelEditor
              value={props.choicesTexts[i] || moduleConfig.defaultChoiceText(i + 1)}
              onChange={value => this.changeLabel(i, value)}
            />
            <input
              className={`form-control ${styles.formInput}`}
              type="text"
              name={`choice_${model.name}_${model.id}`}
            />
          </li>
        ))}
      </ul>
    )
  }
}
