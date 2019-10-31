import React, { Component } from 'react'
import PropTypes from 'prop-types'
import PropertyPanelStore from 'store/PropertyPanelStore'
import styles from 'views/PropertyPanel/components/PropertyPanel.scss'
import ChoicesInput from 'components/ChoicesInput'
import Utils from 'utils'
import Action from 'undo'
import Validations, { RequiredValidations } from 'components/Validations'

export class Properties extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    restricted: PropTypes.bool,
  }

  update = () => {
    const { model } = this.props
    model.update()
    PropertyPanelStore.update()
  }

  changeType = (e) => {
    const { model } = this.props
    const type = e.currentTarget.value
    model.changeProps({ type })
    if (type === 'MaxDiff') {
      this.changeScalePoints(2)
    } else {
      model.update()
      PropertyPanelStore.update()
    }
  }

  /**
   * Use this method to manage right sidebar
   *
   * @param fieldName
   * @param e
   * @private
     */
  changeField = (fieldName, e) => {
    const { model } = this.props
    model.changeProps({ [fieldName]: e.currentTarget.value })
    PropertyPanelStore.update()
  }

  changeAnswersType = (e) => {
    const { model } = this.props
    const type = e.currentTarget.value
    model.changeProps({ answersType: type })
    PropertyPanelStore.update()
  }

  changeTextEntryType = (e) => {
    const { model } = this.props
    const type = e.currentTarget.value
    model.changeProps({ textEntrySize: type })
    PropertyPanelStore.update()
  }

  changeTotalBoxType = (e) => {
    const { model } = this.props
    const type = e.currentTarget.value
    model.changeProps({ totalBoxType: type })
    PropertyPanelStore.update()
  }

  changeStatements = (val) => {
    const { model } = this.props
    model.setChoices(val)
    this.forceUpdate()
  }

  changeNotApplicable = () => {
    const { model: { props } } = this.props
    props.notApplicable = !props.notApplicable
    this.update()
  }

  changeScalePoints = (val, undo) => {
    const { model, model: { props } } = this.props
    const oldValue = props.scalePoints
    props.scalePoints = Utils.limit(val)
    props.scalePointsTexts.splice(props.scalePoints)
    for (let i = 0; i < props.scalePoints; i += 1) {
      if (!props.scalePointsTexts[i]) {
        props.scalePointsTexts[i] = ''
      }
    }
    if (!undo) {
      Action('ChangeScalePoints', this, { oldValue, newValue: props.scalePoints })
    }
    model.update()
    this.forceUpdate()
  }

  changeLabels = (val, undo) => {
    const { model, model: { props } } = this.props
    const oldValue = props.labels
    props.labels = Utils.limit(val)
    props.labelsTexts.splice(props.labels)
    for (let i = 0; i < props.labels; i += 1) {
      if (!props.labelsTexts[i]) {
        props.labelsTexts[i] = ''
      }
    }
    if (!undo) {
      Action('ChangeLabels', this, { oldValue, newValue: props.scalePoints })
    }
    model.update()
    this.forceUpdate()
  }

  notApplicable () {
    const { model: { props: { notApplicable } } } = this.props
    return (
      <div className={styles.fieldset}>
        <label className={styles.inputLabel}>
          <input checked={!!notApplicable} type="checkbox" onChange={this.changeNotApplicable} />
          Not Applicable
        </label>
      </div>
    )
  }

  renderAnswers () {
    const { model } = this.props
    const type = model.props.answersType
    const moduleType = model.props.type
    if (!moduleType.match(/(Likert|Profile)/)) { return }
    return (
      <div className={styles.fieldset}>
        <div className={styles.label}>Answers</div>
        <label className={styles.inputLabel}>
          <input
            checked={type === 'SingleAnswer'}
            type="radio"
            name={`q_${model.id}_answers_type`}
            onChange={this.changeAnswersType}
            value="SingleAnswer"
          />
          {' '}
          Single Answer
        </label>
        <label className={styles.inputLabel}>
          <input
            checked={type === 'MultipleAnswer'}
            type="radio"
            name={`q_${model.id}_answers_type`}
            onChange={this.changeAnswersType}
            value="MultipleAnswer"
          />
          {' '}
          Multiple Answer
        </label>
        <label className={styles.inputLabel}>
          <input
            checked={type === 'Dropdown'}
            type="radio"
            name={`q_${model.id}_answers_type`}
            onChange={this.changeAnswersType}
            value="Dropdown"
          />
          {' '}
          Dropdown list
        </label>
      </div>
    )
  }

  renderTextEntrySizes () {
    const { model } = this.props
    const sizeType = model.props.textEntrySize
    if (model.props.type !== 'TextEntry') { return }
    return (
      <div className={styles.fieldset}>
        <div className={styles.label}>Text Box Size</div>
        <label className={styles.inputLabel}>
          <input
            checked={sizeType === 'Short'}
            type="radio"
            name={`q_${model.id}_text_entry_size`}
            onChange={this.changeTextEntryType}
            value="Short"
          />
          {' '}
          Short
        </label>
        <label className={styles.inputLabel}>
          <input
            checked={sizeType === 'Medium'}
            type="radio"
            name={`q_${model.id}_text_entry_size`}
            onChange={this.changeTextEntryType}
            value="Medium"
          />
          {' '}
          Medium
        </label>
        <label className={styles.inputLabel}>
          <input
            checked={sizeType === 'Long'}
            type="radio"
            name={`q_${model.id}_text_entry_size`}
            onChange={this.changeTextEntryType}
            value="Long"
          />
          {' '}
          Long
        </label>
      </div>
    )
  }

  renderTotalBoxTypes () {
    const { model } = this.props
    const type = model.props.totalBoxType
    if (model.props.type !== 'ConstantSum') { return }
    return (
      <div className={styles.fieldset}>
        <div className={styles.label}>Total Box</div>
        {
          ['None', 'Statement', 'Scale Point'].map(innerType => (
            <label key={innerType} className={styles.inputLabel}>
              <input
                checked={type === innerType}
                type="radio"
                name={`q_${model.id}_total_box_type`}
                onChange={this.changeField.bind(this, 'totalBoxType')}
                value={innerType}
              />
              {' '}
              {innerType}
            </label>
          ))
        }
      </div>
    )
  }

  renderSymbolTypes () {
    const { model } = this.props
    const type = model.props.symbolType
    const value = model.props.symbol
    if (model.props.type !== 'ConstantSum') { return }
    return (
      <div className={styles.fieldset}>
        <div className={styles.label}>Symbol</div>
        {
          ['None', 'Before', 'After'].map(innerType => (
            <label key={innerType} className={styles.inputLabel}>
              <input
                checked={type === innerType}
                type="radio"
                name={`q_${model.id}_total_symbol_type`}
                onChange={this.changeField.bind(this, 'symbolType')}
                value={innerType}
              />
              {' '}
              {innerType}
            </label>
          ))
        }
        {
          type !== 'None' && (
            <input
              name={`q_${model.id}_total_symbol`}
              onChange={this.changeField.bind(this, 'symbol')}
              value={value}
            />
          )
        }
      </div>
    )
  }

  renderStatements () {
    const { model, model: { props } } = this.props
    return (
      <div className={styles.fieldset}>
        <span className={styles.label}>Statements</span>
        <ChoicesInput value={props.choices} model={model} onChange={this.changeStatements} />
      </div>
    )
  }

  renderScalePoints () {
    const { model, model: { props } } = this.props
    if (props.type === 'MaxDiff') { return }
    return (
      <div>
        <div className={styles.fieldset}>
          <span className={styles.label}>Scale Points</span>
          <ChoicesInput value={props.scalePoints} model={model} onChange={this.changeScalePoints} />
        </div>
        <hr className={styles.divider} />
      </div>
    )
  }

  renderLabels () {
    const { model, model: { props } } = this.props
    if (props.type.match(/(TextEntry|ConstantSum|MaxDiff|Profile|RankOrder)/)) { return }
    return (
      <div>
        <div className={styles.fieldset}>
          <span className={styles.label}>Labels</span>
          <ChoicesInput value={props.labels} model={model} onChange={this.changeLabels} />
        </div>
        <hr className={styles.divider} />
      </div>
    )
  }

  render () {
    const { model, model: { props: { type } }, restricted } = this.props

    return (
      <div>
        {this.renderStatements()}
        <hr className={styles.divider} />
        {this.renderScalePoints()}
        {this.renderLabels()}
        <div className={styles.fieldset}>
          <div className={styles.label}>Matrix Type</div>
          <label className={styles.inputLabel}>
            <input
              checked={type === 'Likert'}
              type="radio"
              name={`q_${model.id}_type`}
              onChange={this.changeType}
              value="Likert"
            />
            {' '}
            Likert
          </label>
          <label className={styles.inputLabel}>
            <input
              checked={type === 'Bipolar'}
              type="radio"
              name={`q_${model.id}_type`}
              onChange={this.changeType}
              value="Bipolar"
            />
            {' '}
            Bipolar
          </label>
          <label className={styles.inputLabel}>
            <input
              checked={type === 'RankOrder'}
              type="radio"
              name={`q_${model.id}_type`}
              onChange={this.changeType}
              value="RankOrder"
            />
            {' '}
            Rank Order
          </label>
          <label className={styles.inputLabel}>
            <input
              checked={type === 'ConstantSum'}
              type="radio"
              name={`q_${model.id}_type`}
              onChange={this.changeType}
              value="ConstantSum"
            />
            {' '}
            Constant Sum
          </label>
          <label className={styles.inputLabel}>
            <input
              checked={type === 'TextEntry'}
              type="radio"
              name={`q_${model.id}_type`}
              onChange={this.changeType}
              value="TextEntry"
            />
            {' '}
            Text Entry
          </label>
          <label className={styles.inputLabel}>
            <input
              checked={type === 'Profile'}
              type="radio"
              name={`q_${model.id}_type`}
              onChange={this.changeType}
              value="Profile"
            />
            {' '}
            Profile
          </label>
          <label className={styles.inputLabel}>
            <input
              checked={type === 'MaxDiff'}
              type="radio"
              name={`q_${model.id}_type`}
              onChange={this.changeType}
              value="MaxDiff"
            />
            {' '}
            Max Diff
          </label>
        </div>
        {this.renderAnswers()}
        {this.renderTextEntrySizes()}
        {this.renderTotalBoxTypes()}
        {this.renderSymbolTypes()}
        <hr className={styles.divider} />
        {this.notApplicable()}
        <hr className={styles.divider} />
        {!restricted && (
          <RequiredValidations
            model={model}
            update={() => this.forceUpdate()}
          />
        )}
        {!restricted && (
          <Validations
            model={model}
            update={() => this.forceUpdate()}
          />
        )}
      </div>
    )
  }
}

export default Properties
