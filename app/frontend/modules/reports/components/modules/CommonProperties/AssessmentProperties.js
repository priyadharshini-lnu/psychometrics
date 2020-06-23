import React, { Component } from 'react'
import PropTypes from 'prop-types'
import AppStore from 'rb/store/AppStore'
import styles from 'rb/views/PropertyPanel/components/PropertyPanel.scss'

class AssessmentProperties extends Component {
  static propTypes = {
    assessmentId: PropTypes.number.isRequired,
    changeAssessment: PropTypes.func.isRequired,
  }

  changeAssessment = (e) => {
    const { changeAssessment } = this.props
    const assessmentId = parseInt(e.currentTarget.getAttribute('type'), 10)
    changeAssessment(assessmentId)
  }

  render () {
    const { assessmentId } = this.props
    return (
      <div>
        <div className="form-group">
          <span className={styles.label}>Assessment</span>
          <div className={styles.dropdownWrapper}>
            <button
              type="button"
              data-toggle="dropdown"
              className={`btn btn-default dropdown-toggle ${styles.menuButton}`}
            >
              <span>{_.find(AppStore.assessments, assessment => assessment.id === assessmentId).name}</span>
              <span className="caret" />
            </button>
            <div className={`dropdown-menu ${styles.dropdown}`} role="menu">
              {AppStore.assessments.map(assessment => (
                <div key={assessment.id} className={styles.item} type={assessment.id} onClick={this.changeAssessment}>
                  {assessment.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default AssessmentProperties
