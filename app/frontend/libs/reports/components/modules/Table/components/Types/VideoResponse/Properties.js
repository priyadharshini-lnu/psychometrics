import React, { Component } from 'react'
import Select from 'react-select'
import _ from 'lodash'
import store from 'rb/store/PropertyPanelStore'
import styles from 'rb/views/PropertyPanel/components/PropertyPanel.scss'
import PropertyFilter from 'rb/components/PropertyFilter'
import AssessmentStore from 'rb/store/AssessmentStore'
import { getValue } from 'rb/presenters/ReactSelectPresenter'

const AVAILABLE_QUESTION_TYPES = ['VideoResponse']

export default class Properties extends Component {
  onChange = (key, value) => {
    store.model.props[key] = value
    store.model.update()
    this.forceUpdate()
  }

  render () {
    const { model } = store
    const questions = _.filter(
      AssessmentStore.questions[model.assessment_id] || [], q => AVAILABLE_QUESTION_TYPES.includes(q.type),
    )
    return (
      <div>
        <div className={styles.title}>Video Response</div>
        <div className="mtm">
          <PropertyFilter />
          <div className="mtm">
            Question
            <Select
              value={getValue(questions, store.model.props.questionId)}
              options={questions}
              getOptionValue={opt => opt.id}
              getOptionLabel={opt => opt.name}
              autoFocus={false}
              isClearable={false}
              onChange={({ id }) => this.onChange('questionId', id)}
              placeholder="Video Questions"
            />
          </div>
        </div>
      </div>
    )
  }
}
