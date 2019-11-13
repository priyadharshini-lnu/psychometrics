import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import styles from './AssessmentsForm.scss'
import Assessment from './Assessment'

export class AssessmentsForm extends Component {
  static propTypes = {
    project_assessments: PropTypes.array.isRequired,
    assessments: PropTypes.array.isRequired,
    reports: PropTypes.array.isRequired,
  }

  constructor (props) {
    super(props)
    this.state = {
      projectAssessments: props.project_assessments,
      assessments: props.assessments,
      reportsByAssessments: _.groupBy(props.reports, 'assessment_id'),
    }
  }

  addAssessment = () => {
    const { projectAssessments } = this.state

    this.setState({ projectAssessments: [...projectAssessments, {}] })
  }

  removeAssessment = (index) => {
    const { projectAssessments } = this.state
    projectAssessments.splice(index, 1)
    this.setState({ projectAssessments })
  }

  changeAssessment = (index, assessment) => {
    const { projectAssessments } = this.state
    projectAssessments[index] = assessment
    this.setState({ projectAssessments })
  }

  changeReports = (index, reports) => {
    const { projectAssessments } = this.state
    const assessment = projectAssessments[index]
    assessment.reports = reports
    this.setState({ projectAssessments })
  }

  getAssessmentsForSelect = () => {
    const { assessments, projectAssessments } = this.state
    return _.reduce(assessments, (result, a) => {
      if (!_.find(projectAssessments, { id: a.id })) {
        result.push({
          value: a.id,
          label: a.name,
        })
      }
      return result
    }, [])
  }

  render () {
    const { reportsByAssessments, projectAssessments } = this.state
    return (
      <div>
        {_.map(projectAssessments, (assessment, i) => (
          <Assessment
            key={i}
            model={assessment}
            index={i}
            onRemove={this.removeAssessment}
            onChangeAssessment={this.changeAssessment}
            onChangeReports={this.changeReports}
            assessments={this.getAssessmentsForSelect()}
            reportsByAssessments={reportsByAssessments}
          />
        ))}
        <div onClick={this.addAssessment} className={styles.Add}>
          <a>Add Assessment</a>
        </div>
      </div>
    )
  }
}

export default AssessmentsForm
