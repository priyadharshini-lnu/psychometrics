/* eslint-disable no-mixed-operators */
import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import I18nStore from 'store/I18nStore'
import styles from './GapAnalysis.scss'

const BOUNDARY_INDEX = 2

export class TableBodyPreview extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeScaleValue = (choice, newScale) => {
    const { model: { result } } = this.props
    const object = _.find(result.answers, { choice })
    let value = object && object.values || []
    if (newScale <= BOUNDARY_INDEX) { value = [] }
    result.answer(choice, newScale, value)
  }

  changeValue = ({ currentTarget }, choice, value) => {
    const { model: { result } } = this.props
    const answer = _.find(result.answers, { choice }) || { scale: null, values: [] }
    const { scale } = answer
    let newValues = []
    if (currentTarget.checked) {
      newValues = answer && _.concat(answer.values, value) || [value]
    } else {
      newValues = _.filter(answer.values, v => v !== value)
    }
    if (scale && scale > BOUNDARY_INDEX) { result.answer(choice, scale, newValues) }
  }

  renderCheckbox (choice, values, text, i) {
    const { model, readOnly } = this.props
    return (
      <label key={i} className={styles.whylabel}>
        <div>
          <span>{I18nStore.tQuestion(model, `categoriesDataText${choice + 1}_${i + 1}`, { choice, i })}</span>
        </div>
        <input
          disabled={readOnly}
          checked={values && values.includes(i)}
          type="checkbox"
          onChange={(e) => { this.changeValue(e, choice, i) }}
        />
      </label>
    )
  }

  render () {
    const { model, model: { props, moduleConfig, result }, readOnly } = this.props
    const { answers } = result
    return (
      <tbody>
        {_.times(props.choices, (choice) => {
          const answer = answers.find(answer => answer.choice === choice)
          return (
            <tr className={styles.mainRow} key={choice}>
              <td className={styles.firstColumn}>
                <span>
                  {I18nStore.tQuestion(model, `choicesTexts${choice + 1}`, { choice })
                  || moduleConfig.defaultCategoryText(choice + 1)}

                </span>
              </td>
              {_.times(5, scale => (
                <td
                  key={scale}
                  className={`${styles.inputColumn}
                    ${scale > BOUNDARY_INDEX ? styles[`inputColumn${scale}`] : ''}
                    ${scale === 4 ? 'last' : ''}`}
                >
                  <label className={styles.inputLabel}>
                    <input
                      disabled={readOnly}
                      name={`rank_${model.id}_${choice}`}
                      onChange={this.changeScaleValue.bind(this, choice, scale)}
                      type="radio"
                      checked={answer && answer.scale === scale}
                    />
                  </label>
                </td>
              ))}
              <td className={styles.tellUsInputs}>
                <div className={styles.tellUsLabels}>
                  <span className="fa fa-arrow-right" />
                  {props.categoriesData[choice].texts.map((text, i) => this.renderCheckbox(
                    choice, answer && answer.values, text, i,
                  ))}
                </div>
              </td>
            </tr>
          )
        })}
      </tbody>
    )
  }
}

export default TableBodyPreview
