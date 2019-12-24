import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from 'rb/views/PropertyPanel/components/PropertyPanel.scss'
import AssessmentProperties from 'rb/components/modules/CommonProperties/AssessmentProperties'
import AppStore from 'rb/store/AppStore'
import clearAfterAssessmentChange from 'rb/components/modules/CommonMethods/clearAfterAssessmentChange'
import _ from 'lodash'
import ModuleConfigs from 'rb/consts/ModuleConfigs'
import { PropTypes as PropertyVies } from './Types'

class Properties extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeType = (e) => {
    const { model } = this.props
    const type = e.currentTarget.getAttribute('type')
    model.props.type = type
    model.props.rowData = null
    model.props.headerData = null


    const defaultProps = ModuleConfigs.Table.defaultProps[type] || {}
    model.props = { ...model.props, ...defaultProps }
    const assessmentId = model.assessment_id
    const assessment = _.find(AppStore.assessments, { id: assessmentId })
    const dimensionId = assessment && assessment.dimensionId

    if (['CPITopFactors', 'StrengthClusters'].includes(type)) {
      model.props.source = { factors: _.map(AppStore.subfactors[dimensionId], this.factor) }
    }
    this.update()
  }

  factor = f => ({
    id: f.id, alias: `${f.alias.substring(0, 24)}`,
  })

  update = () => {
    const { model } = this.props
    model.update()
    this.forceUpdate()
  }

  changeAssessment = (assessmentId) => {
    const { model } = this.props
    model.assessment_id = assessmentId
    clearAfterAssessmentChange(model)
    this.update()
  }

  renderTypeProps () {
    const { model } = this.props
    const View = PropertyVies[model.props.type]
    if (!View) {
      return
    }
    return <View {...this.props} />
  }

  render () {
    const { model } = this.props
    return (
      <div>
        <div className={styles.title}>Table Options</div>
        <AssessmentProperties assessmentId={model.assessment_id} changeAssessment={this.changeAssessment} />
        <hr className={styles.divider} />
        <span className={styles.label}>Table Type</span>
        <div className={styles.dropdownWrapper}>
          <button
            type="button"
            data-toggle="dropdown"
            className={`btn btn-default dropdown-toggle ${styles.menuButton}`}
          >
            <span>{model.moduleConfig.labels[model.props.type]}</span>
            <span className="caret" />
          </button>
          <div className={`dropdown-menu ${styles.dropdown}`} role="menu">
            <div className={styles.item} type="SimpleTable" onClick={this.changeType}>
              Simple Table
            </div>
            <div className={styles.item} type="ThreeSixtyDefault" onClick={this.changeType}>
              Default 360
            </div>
            <div className={styles.item} type="HighestLowest" onClick={this.changeType}>
              Highest/Lowest
            </div>
            <div className={styles.item} type="GapAssessment" onClick={this.changeType}>
              Gap Assessment
            </div>
            <div className={styles.item} type="ThreeSixtyReportSummary" onClick={this.changeType}>
              360 Report Summary
            </div>
            <div className={styles.item} type="VideoResponse" onClick={this.changeType}>
              Video Response
            </div>
            <div className={styles.item} type="SingleValue" onClick={this.changeType}>
              Single Value
            </div>
            <div className={styles.item} type="Competencies" onClick={this.changeType}>
              Competencies
            </div>
            <div className={styles.item} type="ResponseSummary" onClick={this.changeType}>
              Response Summary Statistics
            </div>
            <div className={styles.item} type="FactorQuestionsScore" onClick={this.changeType}>
              Factor - Questions Mean Score
            </div>
            <div className={styles.item} type="AgileFactors" onClick={this.changeType}>
              Agile Factors
            </div>
            <div className={styles.item} type="CPITopFactors" onClick={this.changeType}>
              Career - Top Factors
            </div>
            <div className={styles.item} type="CPIOccupations" onClick={this.changeType}>
              Career - Occupations
            </div>
            <div className={styles.item} type="PotentialCareerShort" onClick={this.changeType}>
              Career - Potential (short)
            </div>
            <div className={styles.item} type="PotentialCareerFull" onClick={this.changeType}>
              Career - Potential (full)
            </div>
            <div className={styles.item} type="PotentialKeyCareerTracks" onClick={this.changeType}>
              Career - Key Tracks
            </div>
            <div className={styles.item} type="StrengthClusters" onClick={this.changeType}>
              Career - Strength Clusters
            </div>
            <div className={styles.item} type="InnovationStyles" onClick={this.changeType}>
              Innovation Styles
            </div>
          </div>
        </div>
        <hr className={styles.divider} />
        {this.renderTypeProps()}
      </div>
    )
  }
}

export default Properties
