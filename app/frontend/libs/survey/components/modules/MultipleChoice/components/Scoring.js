import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import FillingScoring from 'components/FillingScoring'
import ScoringCell from 'components/ScoringCell'
import ScoringLabel from 'components/ScoringLabel'
import Utils from 'utils'
import styles from './MultipleChoice.scss'

export class Scoring extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    scoring: PropTypes.object.isRequired,
  }

  fillScoring = () => {
    const { scoring, model } = this.props
    if (scoring.isEmpty()) {
      scoring.autoFill(model)
    } else {
      scoring.reset()
    }
    this.forceUpdate()
  }

  change = (index, e) => {
    const { scoring } = this.props
    const value = Utils.parseFloat(e.currentTarget ? e.currentTarget.value : e)
    scoring.changeValue(index, value)
    this.forceUpdate()
  }

  toggle = (index) => {
    const { scoring } = this.props
    scoring.toggle(index)
    this.forceUpdate()
  }

  render () {
    const { scoring, model: { props, moduleConfig } } = this.props
    return (
      <div>
        <FillingScoring scoring={scoring} onChange={this.fillScoring} />
        {_.times(props.choices, (i) => {
          const object = _.find(scoring.props, { index: i }) || {}
          return (
            <div key={i} className={styles.scoringRow}>
              <ScoringCell
                value={object.value}
                onChange={e => this.change(i, e)}
              />
              <ScoringLabel
                onToggle={e => this.toggle(i, e)}
                value={object.value}
                label={props.choicesTexts[i] || moduleConfig.defaultChoiceText(i + 1)}
              />
            </div>
          )
        })}
      </div>
    )
  }
}

export default Scoring
