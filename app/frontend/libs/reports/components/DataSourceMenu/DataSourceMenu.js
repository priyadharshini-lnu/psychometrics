import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import PropertyPanelStore from 'rb/store/PropertyPanelStore'
import Select from 'react-select'
import AssessmentProperties from 'rb/components/modules/CommonProperties/AssessmentProperties'
import BaseTypeProperties from 'rb/components/modules/CommonProperties/BaseTypeProperties'
import clearAfterAssessmentChange from 'rb/components/modules/CommonMethods/clearAfterAssessmentChange'
import AppStore from 'rb/store/AppStore'
import { SOURCE_TYPES } from 'rb/models/Report'
import panelStyles from 'rb/views/PropertyPanel/components/PropertyPanel.scss'
import { getValue } from 'rb/presenters/ReactSelectPresenter'
import types from './types'
import styles from './DataSourceMenu.scss'

class ChartsMenu extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    onSelect: PropTypes.func.isRequired,
    singleChoice: PropTypes.bool,
  }

  onSelect = () => {
    const { onSelect } = this.props
    onSelect()
    PropertyPanelStore.update()
  }

  getSourceTypes = () => {
    const {
      model, model: { assessment_id: assessmentId },
    } = this.props
    const { category } = AppStore.getAssessmentById(assessmentId)
    return _.filter(SOURCE_TYPES[category], type => !!model.canShowDataSet(type.value, category))
  }

  questionSelect = (questions) => {
    const { model } = this.props
    if (_.isArray(questions)) {
      model.props.source.id = questions.map(q => q.value)
    } else {
      model.props.source.id = questions.value
    }
    this.onSelect()
  }

  changeAssessment = (assessmentId) => {
    const { model, onSelect } = this.props
    model.assessment_id = assessmentId

    clearAfterAssessmentChange(model)
    onSelect()
  }

  changeSourceType = (value) => {
    const { model } = this.props
    model.props.source = {
      type: value.value,
    }

    this.onSelect()
  }

  renderSettingsBasedOnAssessment () {
    const { model } = this.props
    if (!model.isBasedOnAssessment()) return null
    return (
      <div>
        <AssessmentProperties assessmentId={model.assessment_id} changeAssessment={this.changeAssessment} />
        <span className={styles.label}>Data Source</span>
        <Select
          name="form-field-name"
          value={getValue(this.getSourceTypes(), _.result(model, 'props.source.type', 'Choose type'))}
          getOptionValue={opt => opt.value}
          options={this.getSourceTypes()}
          isClearable={false}
          autoFocus={false}
          onChange={this.changeSourceType}
        />
      </div>
    )
  }

  render () {
    const {
      model, onSelect, singleChoice, onlyNumbers,
    } = this.props
    const TypeComponent = types[_.result(model, 'props.source.type')]
    const assessment = AppStore.getAssessmentById(model.assessment_id)

    return (
      <div>
        <hr className={panelStyles.divider} />
        <BaseTypeProperties model={model} onSelect={this.onSelect} />
        {this.renderSettingsBasedOnAssessment()}
        <div className="margin-top-10">
          {TypeComponent && (
            <TypeComponent
              singleChoice={singleChoice}
              onlyNumbers={onlyNumbers}
              model={model}
              onSelect={onSelect}
              assessment={assessment}
              sourceType={_.result(model, 'props.source.type')}
            />
          )}
        </div>
      </div>
    )
  }
}

export default ChartsMenu
