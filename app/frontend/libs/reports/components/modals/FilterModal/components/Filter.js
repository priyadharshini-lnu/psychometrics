import React, { Component } from 'react'
import PropTypes from 'prop-types'
import AppStore from 'rb/store/AppStore'
import store from 'rb/store/modals/FilterStore'
import styles from './FilterModal.scss'
import ConditionList from './ConditionList'

export class Filter extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  change = ({ currentTarget }) => {
    const { model } = this.props
    model[currentTarget.name] = currentTarget.value
    this.forceUpdate()
  }

  remove = () => {
    const { model } = this.props
    store.removeFilter(model)
    this.forceUpdate()
  }

  changeAssessment = (e) => {
    const { model } = this.props
    model.assessmentId = e.currentTarget.value
    this.forceUpdate()
  }

  renderConditions () {
    const { model } = this.props
    return (
      <div className={styles.listWrapper}>
        <ConditionList model={model} onRemove={this.update} />
      </div>
    )
  }

  renderAssessmentSelect () {
    const { model } = this.props
    return (
      <select
        value={model.assessmentId || ''}
        className={`form-control ${styles.assessmentSelect}`}
        onChange={this.changeAssessment}
      >
        <option value="">No Assessment</option>
        {AppStore.assessments.map(assessment => (
          <option
            key={assessment.id}
            value={assessment.id}
          >
            {assessment.name}
          </option>
        ))}
      </select>
    )
  }

  render () {
    const { model } = this.props
    return (
      <div className={styles.filterContainer}>
        <table>
          <tbody>
            <tr>
              <td className="ptm">Filter name:</td>
              <td className="ptm">
                <input
                  className="form-control"
                  name="name"
                  value={model.name || ''}
                  onChange={this.change}
                  style={{ width: '150px', marginLeft: '10px', display: 'inline-block' }}
                />
              </td>
            </tr>
            <tr>
              <td className="ptm">Assessment:</td>
              <td className="ptm">
                {this.renderAssessmentSelect()}
              </td>
            </tr>
            <tr>
              <td className="ptm">Min Required Responses:</td>
              <td className="ptm">
                <input
                  type="number"
                  step="1"
                  className="form-control"
                  name="minRequiredResponses"
                  value={model.minRequiredResponses}
                  onChange={this.change}
                  style={{ width: '150px', marginLeft: '10px', display: 'inline-block' }}
                />
              </td>
            </tr>
          </tbody>
        </table>
        {this.renderConditions()}
        <div className={styles.footer}>
          <a onClick={this.remove} className={styles.delete}>Delete Filter</a>
        </div>
      </div>
    )
  }
}

export default Filter
