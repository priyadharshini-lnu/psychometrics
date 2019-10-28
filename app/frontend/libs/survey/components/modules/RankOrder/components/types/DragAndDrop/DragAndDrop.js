import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import LabelEditor from 'components/LabelEditor'
import styles from './DragAndDrop.scss'

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
    const { model: { props, moduleConfig } } = this.props
    return (
      <div>
        {_.times(props.choices, i => (
          <div className={styles.item} key={i}>
            <LabelEditor
              key={i}
              onChange={e => this.changeLabel(i, e)}
              maxWidth={150}
              value={props.choicesTexts[i] || moduleConfig.defaultChoiceText(i + 1)}
            />
            <div className={styles.number}>{i + 1}</div>
          </div>
        ))}
      </div>
    )
  }
}
