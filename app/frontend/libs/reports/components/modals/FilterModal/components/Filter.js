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

  changeName = (e) => {
    const { model } = this.props
    model.name = e.currentTarget.value
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
        value={model.assessmentId}
        className={`form-control ${styles.assessmentSelect}`}
        onChange={this.changeAssessment}
      >
        <option />
        {AppStore.assessments.map(assessment => <option value={assessment.id}>{assessment.name}</option>)}
      </select>
    )
  }

  render () {
    const { model } = this.props
    return (
      <div className={styles.filterContainer}>
        <div>
          Filter name:
          <input
            className="form-control"
            value={model.name || ''}
            onChange={this.changeName}
            style={{ width: '150px', marginLeft: '10px', display: 'inline-block' }}
          />
        </div>
        <div style={{ marginTop: '10px' }}>
          Assessment:
          {this.renderAssessmentSelect()}
        </div>
        {this.renderConditions()}
        <div className={styles.footer}>
          <a onClick={this.remove} className={styles.delete}>Delete Filter</a>
        </div>
      </div>
    )
  }
}

export default Filter
