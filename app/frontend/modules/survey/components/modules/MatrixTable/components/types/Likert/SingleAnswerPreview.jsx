import _ from 'lodash'
import { Component } from 'react'
import PropTypes from 'prop-types'
import { Radio, Checkbox } from 'antd'
import styles from './Likert.less'

export default class extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeValue = (scale, choice, e) => {
    const { model: { result } } = this.props
    if (result.notApplicable && result.notApplicable[choice]) {
      result.notApplicable[choice] = false
    }
    result.answer(scale, choice, e.target.checked)
    this.forceUpdate()
  }

  changeNotApplicable = (choice) => {
    const { model: { result } } = this.props
    _.remove(result.answers, { choice })
    result.notApplicable = result.notApplicable || {}
    result.notApplicable[choice] = true
    result.reduxAnswer()
    this.forceUpdate()
  }

  renderNotApplicableHeader () {
    const { model, I18n } = this.props
    const { notApplicable } = model.props
    if (!notApplicable) { return null }
    return (
      <span className={styles.scalePointItem}>{I18n.tQuestion(model, 'notApplicableLabel')}</span>
    )
  }

  renderNotApplicableCheckbox (choice) {
    const { model, readOnly } = this.props
    const { props: { notApplicable, answersType }, result } = model
    const InputComponent = answersType === 'SingleAnswer' ? Radio : Checkbox
    if (!notApplicable) { return null }
    const checked = result.notApplicable && result.notApplicable[choice]
    return (
      <div>
        <InputComponent
          disabled={readOnly}
          onChange={e => this.changeNotApplicable(choice, e)}
          checked={checked || false}
        />
      </div>
    )
  }

  render () {
    const {
      model, model: { props, result, moduleConfig }, readOnly, I18n,
    } = this.props
    const InputComponent = props.answersType === 'SingleAnswer' ? Radio : Checkbox
    return (
      <div className={styles.table}>
        <div className={`${styles.row} ${styles.labels}`}>
          <div className={styles.firstColumn} />
          <div className={styles.labelItems}>
            {_.times(props.labels, i => (
              <div key={i}>
                {props.labelsTexts[i] || moduleConfig.defaultLabelText(i + 1)}
              </div>
            ))}
          </div>
        </div>
        <div className={`${styles.row} ${styles.header}`}>
          <div className={styles.firstColumn} />
          <div className={styles.scalePoints}>
            {_.times(props.scalePoints, i => (
              <span key={i} className={styles.scalePointItem}>
                {I18n.tQuestion(model, `scalePointsTexts${i + 1}`, { scale: i })
                  || moduleConfig.defaultScalePointText(i + 1)}
              </span>
            ))}
            {this.renderNotApplicableHeader()}
          </div>
        </div>

        {_.times(props.choices, choice => (
          <div key={choice} className={styles.row}>
            <div className={styles.firstColumn}>
              <div className={styles.item}>
                <div key={choice}>
                  {I18n.tQuestion(model, `choicesTexts${choice + 1}`, { choice })
                    || moduleConfig.defaultChoiceText(choice + 1)}
                </div>
              </div>
            </div>
            <div className={styles.inputs}>
              {_.times(props.scalePoints, (scale) => {
                const object = _.find(result.answers, { scale, choice }) || {}
                return (
                  <InputComponent
                    disabled={readOnly}
                    key={scale}
                    checked={object.value || false}
                    onChange={e => this.changeValue(scale, choice, e)}
                  />
                )
              })}
              {this.renderNotApplicableCheckbox(choice)}
            </div>
          </div>
        ))}
      </div>
    )
  }
}
