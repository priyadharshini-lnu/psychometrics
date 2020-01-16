import React, { Component } from 'react'
import PropTypes from 'prop-types'
import DataSource from 'rb/components/DataSourceMenu'
import store from 'rb/store/PropertyPanelStore'
import styles from 'rb/views/PropertyPanel/components/PropertyPanel.scss'
import Select from 'react-select'
import AssessmentStore from 'rb/store/AssessmentStore'
import _ from 'lodash'
import ChoicesInput from 'rb/components/ChoicesInput'
import { getValue } from 'rb/presenters/ReactSelectPresenter'

const DEFAULT_COUNT = 3

class Properties extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  update = () => {
    store.model.props.group = null
    store.model.update()
    this.forceUpdate()
  }

  changeGroups = (group) => {
    store.model.props.group = group.value
    store.model.props.count = DEFAULT_COUNT
    store.model.update()
    this.forceUpdate()
  }

  getGroups = () => {
    const { model } = this.props
    const assessmentId = model.assessment_id
    const ids = _.result(store.model, 'props.source.id', [])
    const questions = _.compact(ids.map(id => AssessmentStore.questions[assessmentId][id]))

    return _.max(questions.map(q => q.props.scalePoints))
  }

  changeCount = (value) => {
    store.model.props.count = value
    store.model.update()
    this.forceUpdate()
  }

  render () {
    const { model } = store
    const { model: pmodel } = this.props

    return (
      <div style={{ padding: '10px 0' }}>
        <div className={styles.title}>Single Value Scoring</div>
        <DataSource model={pmodel} onSelect={this.update} />
        {_.result(model.props, 'source.id') && (
        <div>
          <div className={styles.label}>Group</div>
          <Select
            value={getValue(_.times(this.getGroups(), i => ({ label: i + 1, value: i })), model.props.group)}
            options={_.times(this.getGroups(), i => ({ label: i + 1, value: i }))}
            autoFocus={false}
            onChange={this.changeGroups}
            placeholder="Group number"
          />
        </div>
        )}
        {_.result(model.props, 'count') && (
        <div>
          <div className={styles.label}>Count</div>
          <ChoicesInput
            minValue={1}
            maxValue={5}
            value={model.props.count}
            onChange={this.changeCount}
          />
        </div>
        )}
        <hr className={styles.divider} />
      </div>
    )
  }
}

export default Properties
