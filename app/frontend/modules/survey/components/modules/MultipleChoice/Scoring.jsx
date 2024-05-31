import _ from 'lodash'
import { Component } from 'react'
import PropTypes from 'prop-types'
import { Space } from 'antd'
import FillingScoring from '~/modules/survey/components/FillingScoring'
import ScoringCell from '~/modules/survey/components/ScoringCell'
import ScoringLabel from '~/modules/survey/components/ScoringLabel'
import Utils from '~/modules/survey/utils'
import styles from './styles.less'
import { MultilineScoring } from '~/modules/survey/components/MultilineEdit'

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
    const str = e.currentTarget ? e.currentTarget.value : e
    const value = Utils.isNumeric(str) ? Utils.parseFloat(str) : ''
    scoring.changeValue(index, value)
    this.forceUpdate()
  }

  toggle = (index) => {
    const { scoring } = this.props
    scoring.toggle(index)
    this.forceUpdate()
  }

  handleMultilineChange = (values) => {
    const { scoring } = this.props
    values.map((value, index) => {
      const [val] = value.split(/ |\t/)
      const floatVal = Utils.isNumeric(val) ? Utils.parseFloat(val) : ''
      scoring.changeValue(index, floatVal)
    })
    this.forceUpdate()
  }

  render () {
    const { scoring, model: { props, moduleConfig } } = this.props
    const multilineValue = _.times(props.choices, (index) => {
      const val = scoring.props.find(s => s.index === index)?.value
      return _.isNil(val) ? '' : val
    })

    return (
      <div>
        <Space>
          <FillingScoring scoring={scoring} onChange={this.fillScoring} />
          <MultilineScoring
            rows={props.choices}
            cols={1}
            lines={multilineValue}
            onChange={this.handleMultilineChange}
          />
        </Space>
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
