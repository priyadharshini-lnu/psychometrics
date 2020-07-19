import React, { Component } from 'react'
import PropertyFilter from 'rb/components/PropertyFilter'
import styles from 'rb/views/PropertyPanel/components/PropertyPanel.scss'
import Select from 'react-select'
import _ from 'lodash'
import AppStore from 'rb/store/AppStore'
import PropertyFonts from 'rb/components/PropertyFonts'
import { getValue } from 'rb/presenters/ReactSelectPresenter'
import { connect } from 'react-redux'
import { getQuestions } from 'modules/reports/core/builder/selectors'
import SourceTypeButtonGroup from '../../SourceTypeButtonGroup'

function FactorList ({ model, onChange }) {
  const assessment = AppStore.getAssessmentById(model.assessment_id)
  const options = _.map(AppStore.factors[assessment.dimensionId] || [],
    factor => ({ label: factor.name, value: factor.id }))

  return (
    <div className="mtm">
      Factor
      <Select
        value={getValue(options, model.props.factorId)}
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

function QuestionList ({ model, onChange, questions }) {
  const textQuestions = _.filter(questions || [], q => q.type === 'TextEntry')
  const options = _.map(textQuestions, question => ({ label: question.name, value: question.id }))

  return (
    <div className="mtm">
      Question
      <Select
        value={getValue(options, model.props.questionId)}
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

class Properties extends Component {
  onChange = (key, value) => {
    const { model } = this.props
    model.props[key] = value
    model.update()
    this.forceUpdate()
  }

  render () {
    const { model, questions } = this.props
    const List = lists[model.props.sourceType]
    return (
      <div>
        <div>Font</div>
        <PropertyFonts model={model} colors={false} />
        <div className={styles.title}>Default 360</div>
        <SourceTypeButtonGroup model={model} onChange={this.onChange} />
        <List model={model} onChange={this.onChange} questions={questions} />
        <div className="mtm">
          <PropertyFilter model={model} />
        </div>
      </div>
    )
  }
}

export default connect((state, { model }) => ({
  questions: getQuestions(state.report, model.assessment_id),
}), {})(Properties)
