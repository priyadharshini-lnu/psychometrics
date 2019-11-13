import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import FillingScoring from 'components/FillingScoring'
import ScoringCell from 'components/ScoringCell'
import ScoringLabelAdvanced from 'components/ScoringLabelAdvanced'
import Utils from 'utils'
import styles from './SideBySide.scss'

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

  change = (scale, choice, answer, e) => {
    const { scoring } = this.props
    const value = Utils.parseFloat(e.currentTarget ? e.currentTarget.value : e)
    scoring.changeValue(scale, choice, answer, value)
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

  setTemplate = (object, value) => {
    const { scoring, model } = this.props
    scoring.setTemplate(object, value, model)
    this.forceUpdate()
  }

  renderInput (scale, choice, answer) {
    const { model } = this.props
    const { scoring } = this.props
    if (scoring.engine.isSupported(model, scale)) {
      return (
        <ScoringCell
          value={scoring.engine.findAnswer({ scale, choice }, answer).value}
          onChange={e => this.change(this, scale, choice, answer, e)}
        />
      )
    }
    return '--'
  }

  render () {
    const { scoring, model, model: { props, moduleConfig } } = this.props
    const data = props.columnsData
    return (
      <div>
        <div>
          <FillingScoring scoring={scoring} onChange={this.fillScoring} />
          <table className={styles.scoringTable}>
            <tbody>
              <tr>
                <td className={styles.scoringFirstCeil} />
                {_.times(props.scalePoints, (scale) => {
                  const filled = _.some(scoring.props, { scale })
                  const isSupported = scoring.engine.isSupported(model, scale)
                  return (
                    <td
                      colSpan={data[scale].answers}
                      key={scale}
                      className={`${styles.column} ${styles.scoringLeftBorder}`}
                    >
                      <ScoringLabelAdvanced
                        onToggle={e => this.toggle({ scale }, e)}
                        onAsc={e => this.asc({ scale }, e)}
                        onDesc={e => this.desc({ scale }, e)}
                        onClear={e => this.clear({ scale }, e)}
                        onSet={e => this.setTemplate({ scale }, e)}
                        filled={filled}
                        disabled={!isSupported}
                        label={data[scale].text || moduleConfig.defaultGroupText(scale + 1)}
                      />
                    </td>
                  )
                })}
              </tr>
              <tr className={styles.scoringBottomBorder}>
                <td className={styles.scoringFirstCeil} />
                {_.times(props.scalePoints, scale => _.times(data[scale].answers, (answer) => {
                  const object = _.find(scoring.props, { scale })
                  const isSupported = scoring.engine.isSupported(model, scale)
                  let filled = false
                  if (object) {
                    filled = _.some(object.values, { index: answer })
                  }
                  return (
                    <td className={`${answer === 0 && styles.scoringLeftBorder}`}>
                      <ScoringLabelAdvanced
                        onToggle={e => this.toggle({ answer, scale }, e)}
                        onAsc={e => this.asc({ answer, scale }, e)}
                        onDesc={e => this.desc({ answer, scale }, e)}
                        onClear={e => this.clear({ answer, scale }, e)}
                        onSet={e => this.setTemplate({ answer, scale }, e)}
                        filled={filled}
                        disabled={!isSupported}
                        label={data[scale].answersTexts[answer] || moduleConfig.defaultAnswerText(answer + 1)}
                      />
                    </td>
                  )
                }))}
              </tr>
              {_.times(props.choices, (choice) => {
                const filled = _.some(scoring.props, { choice })
                return (
                  <tr key={choice}>
                    <td className={styles.scoringFirstCeil}>
                      <ScoringLabelAdvanced
                        onToggle={e => this.toggle({ choice }, e)}
                        onAsc={e => this.asc({ choice }, e)}
                        onDesc={e => this.desc({ choice }, e)}
                        onClear={e => this.clear({ choice }, e)}
                        onSet={e => this.setTemplate({ choice }, e)}
                        filled={filled}
                        label={props.choicesTexts[choice].split(':')[0] || moduleConfig.defaultChoiceText(choice + 1)}
                      />
                    </td>
                    {_.times(props.scalePoints, scale => _.times(data[scale].answers, answer => (
                      <td className={`${answer === 0 && styles.scoringLeftBorder}`} key={answer}>
                        {this.renderInput(scale, choice, answer)}
                      </td>
                    )))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}

export default Scoring
