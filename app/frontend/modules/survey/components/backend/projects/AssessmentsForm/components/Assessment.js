import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import Select from 'react-select'
import styles from './AssessmentsForm.scss'

export class Assessment extends Component {
  static propTypes = {
    index: PropTypes.number.isRequired,
    model: PropTypes.object.isRequired,
    onRemove: PropTypes.func.isRequired,
    onChangeAssessment: PropTypes.func.isRequired,
    onChangeReports: PropTypes.func.isRequired,
    assessments: PropTypes.array.isRequired,
    reportsByAssessments: PropTypes.object.isRequired,
  }

  remove = () => {
    const { index, onRemove } = this.props
    onRemove(index)
  }

  getAssessmentOptions = () => {
    const { assessments, model } = this.props
    return [...assessments, { label: model.name, value: model.id }]
  }

  changeAssessment = (assessment) => {
    const { onChangeAssessment, index } = this.props
    onChangeAssessment(index, { id: assessment.value, name: assessment.label, reports: [] })
  }

  changeReport = (rawReports) => {
    const { onChangeReports, index } = this.props
    const reports = _.map(rawReports, r => ({ id: r.value, name: r.label }))
    onChangeReports(index, reports)
  }

  getReportOptions = () => {
    const { reportsByAssessments, model } = this.props

    return _.map(reportsByAssessments[model.id], r => ({
      value: r.id,
      label: r.name,
    }))
  }

  renderReportsSelect () {
    const { model } = this.props
    if (model.id) {
      const reports = _.map(model.reports, 'id')
      return (
        <div className={styles.ReportSelect}>
          <div>Reports:</div>
          <Select
            name="form-field-name"
            value={reports}
            multi
            clearable={false}
            className={styles.Select}
            options={this.getReportOptions()}
            onChange={this.changeReport}
          />
        </div>
      )
    }
  }

  renderFormData () {
    const { model, index } = this.props
    if (model.id) {
      return (
        <div style={{ display: 'none' }}>
          <input readOnly name={`resource[assessments][${index}][id]`} value={model.id} />
          <input readOnly name={`resource[assessments][${index}][reports]`} value={_.map(model.reports, 'id')} />
        </div>
      )
    }
  }

  render () {
    const { model } = this.props
    return (
      <div className={styles.AssessmentContainer}>
        <div className={styles.Selects}>
          <div className={styles.AssessmentSelect}>
            <div>Assessment:</div>
            <Select
              name="form-field-name"
              value={model.id}
              className={styles.Select}
              options={this.getAssessmentOptions()}
              clearable={false}
              onChange={this.changeAssessment}
            />
          </div>
          {this.renderReportsSelect()}
        </div>
        <div className={styles.Remove}>
          <a onClick={this.remove}>
            <i className="fa fa-trash" />
          </a>
        </div>
        {this.renderFormData()}
      </div>
    )
  }
}

export default Assessment
