import _ from 'lodash'
import { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './Likert.less'
import { NOT_APPLICABLE } from '../../Consts'

export default class extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeValue = (choice, e) => {
    const { model: { result } } = this.props
    result.notApplicable = result.notApplicable || {}
    if (e.currentTarget.value === NOT_APPLICABLE) {
      _.remove(result.answers, { choice })
      result.notApplicable[choice] = true
      result.reduxAnswer()
    } else {
      result.notApplicable[choice] = false
      result.answer(e.currentTarget.value, choice, e.currentTarget.value)
    }
    this.forceUpdate()
  }

  renderNotApplicableOption () {
    const { model, I18n } = this.props
    const { notApplicable } = model.props
    if (!notApplicable) { return null }
    return (
      <option value={NOT_APPLICABLE}>{I18n.tQuestion(model, 'notApplicableLabel')}</option>
    )
  }

  render () {
    const {
      model, model: { props, moduleConfig, result }, readOnly, I18n,
    } = this.props

    return (
      <div className={styles.table}>
        {_.times(props.choices, (choice) => {
          const notApplicable = result.notApplicable && result.notApplicable[choice]
          const object = _.find(result.answers, { choice }) || {}
          return (
            <div key={choice} className={`${styles.row} ${styles.dropdown}`}>
              <div className={styles.firstColumn}>
                <div className={styles.item}>
                  <span>
                    {I18n.tQuestion(model, `choicesTexts${choice + 1}`, { choice })
                      || moduleConfig.defaultChoiceText(choice + 1)}
                  </span>
                </div>
              </div>
              <div className={styles.controls}>
                <select
                  disabled={readOnly}
                  value={notApplicable ? NOT_APPLICABLE : object.scale}
                  onChange={this.changeValue.bind(this, choice)}
                  className={`form-control ${styles.select}`}
                >
                  <option />
                  {_.times(props.scalePoints, scale => (
                    <option
                      key={scale}
                      value={scale}
                    >
                      {props.scalePoints[scale] || moduleConfig.defaultScalePointText(scale)}
                    </option>
                  ))}
                  {this.renderNotApplicableOption()}
                </select>
              </div>
            </div>
          )
        })}
      </div>
    )
  }
}
