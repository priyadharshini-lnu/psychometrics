import React, { Component } from 'react'
import PropertyFilter from 'rb/components/PropertyFilter'
import styles from 'rb/views/PropertyPanel/components/PropertyPanel.scss'
import store from 'rb/store/PropertyPanelStore'
import Select from 'react-select'
import _ from 'lodash'
import AppStore from 'rb/store/AppStore'
import AssessmentStore from 'rb/store/AssessmentStore'
import PropertyFonts from 'rb/components/PropertyFonts'
import { getValue } from 'rb/presenters/ReactSelectPresenter'
import SourceTypeButtonGroup from '../../SourceTypeButtonGroup'

function FactorList ({ model, onChange }) {
  const assessment = AppStore.getAssessmentById(model.assessment_id)
  const options = _.map(AppStore.factors[assessment.dimensionId] || [],
    factor => ({ label: factor.name, value: factor.id }))
  return (
    <div className="mtm">
      Factor
      <Select
        value={getValue(options, store.model.props.factorId)}
        options={options}
        getOptionValue={opt => opt.value}
        autoFocus={false}
        isClearable={false}
        onChange={val => onChange('factorId', val.value)}
        placeholder="All Responses"
      />
    </div>
  )
}

function QuestionList ({ model, onChange }) {
  const questions = _.filter(AssessmentStore.questions[model.assessment_id] || [], q => q.type === 'TextEntry')
  const options = _.map(questions,
    question => ({ label: question.name, value: question.id }))

  return (
    <div className="mtm">
      Question
      <Select
        value={getValue(options, store.model.props.questionId)}
        options={options}
        getOptionValue={opt => opt.value}
        autoFocus={false}
        isClearable={false}
        onChange={val => onChange('questionId', val.value)}
        placeholder="All Responses"
      />
    </div>
  )
}

const lists = {
  Factor: FactorList,
  Question: QuestionList,
}

export default class Properties extends Component {
  onChange = (key, value) => {
    store.model.props[key] = value
    store.model.update()
    this.forceUpdate()
  }

  render () {
    const { model } = store
    const List = lists[model.props.sourceType]
    return (
      <div>
        <div>Font</div>
        <PropertyFonts colors={false} />
        <div className={styles.title}>Default 360</div>
        <SourceTypeButtonGroup model={model} onChange={this.onChange} />
        <List model={model} onChange={this.onChange} />
        <div className="mtm">
          <PropertyFilter />
        </div>
      </div>
    )
  }
}
