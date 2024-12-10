import { Component } from 'react'
import Select from 'react-select'
import _ from 'lodash'
import { connect } from 'react-redux'
import PropertyFilter from '~/modules/reports/components/PropertyFilter'
import styles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'
import AppStore from '~/modules/reports/store/AppStore'
import PropertyFonts from '~/modules/reports/components/PropertyFonts'
import { getValue } from '~/modules/reports/presenters/ReactSelectPresenter'
import { getQuestions } from '~/modules/reports/core/builder/selectors'
import SourceTypeButtonGroup from '../../SourceTypeButtonGroup'

const ALLOWED_QUESTION = ['TextEntry', 'FactorSelect']

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
  const textQuestions = _.filter(questions || [], q => ALLOWED_QUESTION.includes(q.type))
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
    const { modules } = this.props
    modules.forEach((model) => {
      model.props[key] = value
      model.update()
    })
    this.forceUpdate()
  }

  render () {
    const { modules, questions } = this.props
    const model = modules[0]
    const List = lists[model.props.sourceType]
    return (
      <div>
        <div>Font</div>
        <PropertyFonts modules={modules} colors={false} />
        <div className={styles.title}>Default 360</div>
        <SourceTypeButtonGroup model={model} onChange={this.onChange} />
        <List model={model} onChange={this.onChange} questions={questions} />
        <div className="mtm">
          <PropertyFilter modules={modules} />
        </div>
      </div>
    )
  }
}

export default connect((state, { modules }) => ({
  questions: getQuestions(state.report, modules[0].assessment_id),
}), {})(Properties)
