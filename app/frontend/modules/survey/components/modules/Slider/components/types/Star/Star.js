import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import LabelEditor from 'components/LabelEditor'
import StarBar from 'components/StarBar'
import Utils from 'utils'
import styles from './Star.scss'

export default class extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeLabel = (collection, i, text) => {
    const { model } = this.props
    model.changeArrayProps({ collection, i, val: text })
    this.forceUpdate()
  }

  changeValue = (i, value) => {
    const { model } = this.props
    model.changeArrayProps({ collection: 'fakeResultsStars', i, val: Utils.round(value) })
    this.forceUpdate()
  }

  render () {
    const { model: { props, moduleConfig } } = this.props

    return (
      <div className={styles.table}>
        {_.times(props.choices, i => (
          <div key={i} className={styles.row}>
            <div className={styles.firstColumn}>
              <LabelEditor
                onChange={value => this.changeLabel('choicesTexts', i, value)}
                maxWidth={150}
                value={props.choicesTexts[i] || moduleConfig.defaultChoiceText(i + 1)}
              />
            </div>
            <StarBar
              stars={props.stars}
              value={props.fakeResultsStars[i]}
              type={props.interaction}
              onClick={value => this.changeValue(i, value)}
            />
            <div className={styles.lastColumn}>
              <span>{props.fakeResultsStars[i]}</span>
            </div>
          </div>
        ))}
      </div>
    )
  }
}
