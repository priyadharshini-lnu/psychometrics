import _ from 'lodash'
import { Component } from 'react'
import PropTypes from 'prop-types'
import { Space } from 'antd'
import FillingScoring from '~/modules/survey/components/FillingScoring'
import ScoringCell from '~/modules/survey/components/ScoringCell'
import ScoringLabelAdvanced from '~/modules/survey/components/ScoringLabelAdvanced'
import Utils from '~/modules/survey/utils'
import styles from './MatrixTable.less'
import { MultilineScoring } from '~/modules/survey/components/MultilineEdit'

export class Scoring extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    scoring: PropTypes.object.isRequired,
  }

  setTemplate = (object, value) => {
    const { scoring, model } = this.props
    scoring.setTemplate(object, value, model)
    this.forceUpdate()
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

  change = (scale, choice, e) => {
    const { scoring } = this.props
    const value = Utils.parseFloat(e.currentTarget ? e.currentTarget.value : e)

    scoring.changeValue(scale, choice, isNaN(value) ? undefined : value)
    this.forceUpdate()
  }

  toggle = (object) => {
    const { scoring, model } = this.props
    scoring.toggle(object, model)
    this.forceUpdate()
  }

  asc = (object) => {
    const { scoring, model } = this.props
    scoring.asc(object, model)
    this.forceUpdate()
  }

  desc = (object) => {
    const { scoring, model } = this.props
    scoring.desc(object, model)
    this.forceUpdate()
  }

  clear = (object) => {
    const { scoring, model } = this.props
    scoring.clear(object, model)
    this.forceUpdate()
  }

  handleMultilineChange = (values) => {
    const { scoring, model: { props } } = this.props
    const vals = values.map(r => r.split(/ |\t/).slice(0, props.scalePoints))

    _.times(props.choices, (choice) => {
      _.times(props.scalePoints, (scale) => {
        const val = vals[choice]?.[scale]
        const floatVal = Utils.isNumeric(val) ? Utils.parseFloat(val) : ''
        scoring.changeValue(scale, choice, floatVal)
      })
    })

    this.forceUpdate()
  }

  render () {
    const { scoring, model: { props, moduleConfig } } = this.props
    const multilineValue = []

    _.times(props.choices, ((choice) => {
      const rows = scoring.props.filter(s => s.choice === choice)
      multilineValue.push(_.times(props.scalePoints,
        (scale => rows.find(s => s.scale === scale)?.value)).join(' '))
    }))

    return (
      <div>
        <Space>
          <FillingScoring scoring={scoring} onChange={this.fillScoring} />
          <MultilineScoring
            cols={props.scalePoints}
            rows={props.choices}
            lines={multilineValue}
            onChange={this.handleMultilineChange}
          />
        </Space>
        <table className={styles.scoringTable}>
          <tbody>
            <tr className={`${styles.scoringRow} ${styles.scoringScaleRow}`}>
              <td className={styles.scoringFirstCeil} />
              {_.times(props.scalePoints, (scale) => {
                const filled = _.some(scoring.props, { scale })
                return (
                  <td key={scale} className={styles.scoringScaleCeil}>
                    <ScoringLabelAdvanced
                      onToggle={e => this.toggle({ scale }, e)}
                      onAsc={e => this.asc({ scale }, e)}
                      onDesc={e => this.desc({ scale }, e)}
                      onClear={e => this.clear({ scale }, e)}
                      onSet={e => this.setTemplate({ scale }, e)}
                      filled={filled}
                      label={props.scalePointsTexts[scale] || moduleConfig.defaultScalePointText(scale + 1)}
                    />
                  </td>
                )
              })}
            </tr>
            {_.times(props.choices, (choice) => {
              const filled = _.some(scoring.props, { choice })
              return (
                <tr key={choice} className={`${styles.scoringRow}`}>
                  <td className={styles.scoringFirstCeil}>
                    <ScoringLabelAdvanced
                      onToggle={e => this.toggle({ choice }, e)}
                      onAsc={e => this.asc({ choice }, e)}
                      onDesc={e => this.desc({ choice }, e)}
                      onClear={e => this.clear({ choice }, e)}
                      onSet={e => this.setTemplate({ choice }, e)}
                      filled={filled}
                      label={(props.choicesTexts[choice] || moduleConfig.defaultChoiceText(choice + 1))?.split(':')[0]}
                    />
                  </td>
                  {_.times(props.scalePoints, (scale) => {
                    const object = _.find(scoring.props, { scale, choice }) || {}
                    return (
                      <td key={scale}>
                        <ScoringCell
                          value={object.value}
                          onChange={e => this.change(scale, choice, e)}
                        />
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }
}

export default Scoring
