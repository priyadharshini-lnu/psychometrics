import { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { CAMPAIGN_FACTORS, DATA_SHEET } from '~/modules/reports/models/Module'
import localStyles from './Scoring.less'
import styles from '../../Condition.less'

export class Scoring extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    condition: PropTypes.object.isRequired,
  }

  getSubjects (assessment) {
    const {
      condition, factors, dataSheetColumns, campaignFactors,
    } = this.props

    if (condition.type === DATA_SHEET) {
      return dataSheetColumns.map(column => ({ id: column.name, name: column.name }))
    }

    if (condition.type === CAMPAIGN_FACTORS) {
      return campaignFactors?.map(column => ({ id: column.code, name: column.name }))
    }

    return factors[assessment.dimension_id]
  }

  changeSubject = (e) => {
    const { condition } = this.props
    condition.props.subject = e.currentTarget.value
    this.forceUpdate()
  }

  changeValue = (e) => {
    const { condition } = this.props
    condition.props.value = e.currentTarget.value
    this.forceUpdate()
  }

  changePredicate = (e) => {
    const { condition } = this.props
    condition.props.predicate = e.currentTarget.value
    this.forceUpdate()
  }

  changeOperation = (e) => {
    const { condition } = this.props
    condition.props.operation = e.currentTarget.value
    this.forceUpdate()
  }

  render () {
    const { model, condition, assessments } = this.props
    const { value } = condition.props
    const assessmentId = condition.props.assessmentId || model.module.assessment_id
    const assessment = _.find(assessments, { id: +assessmentId })

    if (condition.type === 'Factor' && !assessment) { return null }
    const subjects = this.getSubjects(assessment)
    return (
      <div className={styles.questionDock}>
        <select
          value={condition.props.subject}
          onChange={this.changeSubject}
          className={`form-control ${localStyles.subjectSelect}`}
        >
          <option value="" selected hidden>{I18n.t('activemodel.attributes.scoring.select_factors')}</option>
          {subjects?.map(factor => (
            <option key={factor.id} value={factor.id}>{factor.alias || factor.name}</option>
          ))}
        </select>
        <select
          value={condition.props.operation}
          onChange={this.changeOperation}
          className={`form-control ${localStyles.predicateSelect}`}
        >
          <option value="" hidden selected>
            {I18n.t('activemodel.attributes.scoring.select_operation')}
          </option>
          <option value="Mean">Mean</option>
          <option value="Max">Max</option>
          <option value="Min">Min</option>
        </select>
        <select
          value={condition.props.predicate}
          onChange={this.changePredicate}
          className={`form-control ${localStyles.predicateSelect}`}
        >
          <option value="" hidden selected>{I18n.t('activemodel.attributes.scoring.select_comparison')}</option>
          <option value="EqualTo">Equal To</option>
          <option value="NotEqualTo">Not Equal To</option>
          <option value="GreaterThen">Greater Than</option>
          <option value="GreaterThenOrEqual">Greater Than Or Equal To</option>
          <option value="LessThen">Less Than</option>
          <option value="LessThenOrEqual">Less Than Or Equal To</option>
        </select>
        <input
          className={`form-control ${localStyles.subjectSelect}`}
          value={value}
          onChange={this.changeValue}
          placeholder={I18n.t('activemodel.attributes.numeric_comparator.enter_value')}
        />
      </div>
    )
  }
}

export default Scoring
