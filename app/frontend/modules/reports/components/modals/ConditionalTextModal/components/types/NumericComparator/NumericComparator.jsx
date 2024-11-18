import { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import styles from '../../Condition.less'
import comparatorStyles from './NumericComparator.less'

export default class NumericComparator extends Component {
  static propTypes = {
    condition: PropTypes.object.isRequired,
  }

  changePredicate = (e) => {
    const { condition } = this.props
    condition.props.predicate = e.currentTarget.value
    this.forceUpdate()
  }

  changeKey = (e) => {
    const { condition } = this.props
    condition.props.key = e.currentTarget.value
    this.forceUpdate()
  }

  changeCount = (e) => {
    const { condition } = this.props
    condition.props.count = parseInt(e.currentTarget.value, 10)
    this.forceUpdate()
  }

  changeValue = (e) => {
    const { condition } = this.props
    condition.props.value = e.currentTarget.value
    this.forceUpdate()
  }

  render () {
    const { condition, data } = this.props
    return (
      <div className={styles.questionDock}>
        <select
          value={condition.props.key}
          className={`form-control ${comparatorStyles.keyInput}`}
          onChange={this.changeKey}
        >

          <option value="" disabled selected>{I18n.t('activemodel.attributes.numeric_comparator.select_data')}</option>
          {_.map(data, item => (
            <option key={item.value} value={item.value}>{item.label || item.value}</option>
          ))}
        </select>
        <span>Is</span>
        <select
          value={condition.props.predicate}
          className={`form-control ${comparatorStyles.predicateSelect}`}
          onChange={this.changePredicate}
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
          className={`form-control ${comparatorStyles.valueInput}`}
          value={condition.props.count || ''}
          onChange={this.changeCount}
          placeholder={I18n.t('activemodel.attributes.numeric_comparator.enter_value')}
        />
      </div>
    )
  }
}
