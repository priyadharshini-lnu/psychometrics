import _ from 'lodash'
import { Component } from 'react'
import PropTypes from 'prop-types'
import { FillScoringButton } from '~/modules/survey/components/FillScoringButton'
import ScoringCell from '~/modules/survey/components/ScoringCell'
import ScoringLabel from '~/modules/survey/components/ScoringLabel'
import Utils from '~/modules/survey/utils'
import styles from './Slider.less'

export class Scoring extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    scoring: PropTypes.object.isRequired,
  }

  fillScoring = () => {
    const { model, scoring } = this.props
    if (scoring.isEmpty()) {
      scoring.autoFill(model)
    } else {
      scoring.reset()
    }
    this.forceUpdate()
  }

  change = (index, val, type) => {
    const { scoring } = this.props
    const value = Utils.parseFloat(val)
    if (isNaN(value)) {
      scoring.changeValue(index, undefined, type)
    } else {
      scoring.changeValue(index, value, type)
    }
    this.forceUpdate()
  }

  toggle = (index) => {
    const { scoring } = this.props
    scoring.toggle(index)
    this.forceUpdate()
  }

  render () {
    const { model, scoring } = this.props
    const { moduleConfig: module, props } = model
    return (
      <div>
        <FillScoringButton hasScore={scoring && !scoring.isEmpty()} onClick={this.fillScoring} />
        {_.times(props.choices, (i) => {
          const object = _.find(scoring.props, { index: i }) || {}
          return (
            <div key={i} className={styles.scoringRow}>
              <ScoringCell
                value={object.min}
                onChange={e => this.change(i, e.target.value, 'min')}
              />
              <ScoringCell
                value={object.max}
                onChange={e => this.change(i, e.target.value, 'max')}
              />
              <ScoringLabel
                onToggle={() => this.toggle(i)}
                value={object.min || object.max}
                label={props.choicesTexts[i] || module.defaultChoiceText(i + 1)}
              />
            </div>
          )
        })}
      </div>
    )
  }
}

export default Scoring
