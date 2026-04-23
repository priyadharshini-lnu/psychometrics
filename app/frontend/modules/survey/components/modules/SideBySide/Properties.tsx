import { Component } from 'react'
import { Checkbox, Divider } from 'antd'
import { CheckboxChangeEvent } from 'antd/es/checkbox'
import _ from 'lodash'

import { PropertiesModel } from '~/modules/survey/interfaces/questions/SideBySide'

import Action from '~/modules/survey/undo'
import styles from '~/modules/survey/views/PropertyPanel/components/PropertyPanel.less'
import ChoicesInput from '~/modules/survey/components/ChoicesInput'
import Utils from '~/modules/survey/utils'
import ValidationTypes from '~/modules/survey/components/ValidationTypes'
import RequiredValidations from '~/modules/survey/components/RequiredValidations'


interface Props {
  model: PropertiesModel
  restricted: boolean
  showOnlyTranslatable: boolean
}

const { I18n } = window

export class Properties extends Component<Props> {
  update = () => {
    const { model } = this.props
    model.update()
  }

  changeField = (fieldName, value) => {
    const { model } = this.props
    model.changeProps({ [fieldName]: value })
  }

  changeStatements = (val) => {
    const { model } = this.props
    model.setChoices(val)
  }

  changeScalePoints = (val, undo) => {
    const { model, model: { props, moduleConfig } } = this.props
    const oldValue = props.scalePoints
    props.scalePoints = Utils.limit(val)
    const newValue = props.scalePoints
    props.columnsData.splice(props.scalePoints)
    for (let i = 0; i < props.scalePoints; i += 1) {
      if (!props.columnsData[i]) {
        props.columnsData[i] = _.cloneDeep(moduleConfig.defaultColumn)
      }
    }
    if (!undo) {
      Action('ChangeScalePoints', this, { oldValue, newValue })
    }
    model.update()
  }

  handleQuestionDescriptionChange = (event: CheckboxChangeEvent) => {
    const {
      target: { checked },
    } = event

    const { model } = this.props

    model.changeProps({
      isRowDescriptionEnabled: checked,
    })
    this.update()
  }

  renderRepeatHeaders () {
    const { model } = this.props
    const type = model.props.repeatHeaders
    const { hideHeaders } = model.props
    return (
      <div className={styles.fieldset}>
        <div className={styles.label}>Headers</div>
        <label className={styles.inputLabel}>
          <input
            defaultChecked={hideHeaders}
            type="checkbox"
            onChange={e => this.changeField('hideHeaders', e.currentTarget.checked)}
            value={1}
          />
          {' '}
          Hide Headers
        </label>
        <div className={styles.label}>Repeat Headers</div>
        {
          ['None', 'Middle', 'Bottom', 'Both', 'All'].map(innerType => (
            <label key={innerType} className={styles.inputLabel}>
              <input
                checked={type === innerType}
                type="radio"
                name={`q_${model.id}_repeat_headers`}
                onChange={e => this.changeField('repeatHeaders', e.currentTarget.value)}
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
          <span className={styles.label}>Columns</span>
          <ChoicesInput value={props.scalePoints} model={model} onChange={this.changeScalePoints} />
        </div>
        <hr className={styles.divider} />
      </div>
    )
  }

  render () {
    const { model, restricted, showOnlyTranslatable } = this.props
    const { props: { isRowDescriptionEnabled } } = model

    if (showOnlyTranslatable && !restricted) {
      return (
        <div>
          <ValidationTypes
            model={model}
            update={() => this.forceUpdate()}
          />
        </div>
      )
    }

    return (
      <div>
        {this.renderStatements()}
        <hr className={styles.divider} />
        {this.renderScalePoints()}
        {this.renderRepeatHeaders()}
        <div className="ms-4 me-4">
          <Checkbox checked={isRowDescriptionEnabled} onChange={this.handleQuestionDescriptionChange}>
            {I18n.t('administration.survey_builder.property_panel.question_description')}
          </Checkbox>
        </div>
        <Divider />
        {!restricted && (
          <RequiredValidations
            model={model}
            update={() => this.forceUpdate()}
          />
        )}
        {!restricted && (
          <ValidationTypes
            model={model}
            update={() => this.forceUpdate()}
          />
        )}
      </div>
    )
  }
}
