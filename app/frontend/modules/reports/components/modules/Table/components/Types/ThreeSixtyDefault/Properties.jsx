import { Component } from 'react'
import Select from 'react-select'
import _ from 'lodash'
import { connect } from 'react-redux'
import { Checkbox } from 'antd'
import PropertyFilter from '~/modules/reports/components/PropertyFilter'
import styles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'
import AppStore from '~/modules/reports/store/AppStore'
import { getValue } from '~/modules/reports/presenters/ReactSelectPresenter'
import PaginationOptions from '~/modules/reports/components/PaginationOptions'
import { getQuestions } from '~/modules/reports/core/builder/selectors'
import SourceTypeButtonGroup from '../../SourceTypeButtonGroup'

const ALLOWED_QUESTION = ['TextEntry', 'FactorSelect']

const { I18n } = window

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
        <div className={styles.title}>Default 360</div>
        <SourceTypeButtonGroup model={model} onChange={this.onChange} />
        <List model={model} onChange={this.onChange} questions={questions} />
        <div className="mtm">
          <PropertyFilter modules={modules} />
        </div>
        <div className={styles.divider} />
        <div className={styles.block} style={{ position: 'relative' }}>
          <label className={styles.inputLabel}>
            <input
              style={{ marginRight: '5px' }}
              type="checkbox"
              checked={model.props.aiTranslationEnabled ?? false}
              onChange={e => this.onChange('aiTranslationEnabled', e.target.checked)}
            />
            {I18n.t('administration.report_builder.property_panel.translate_with_ai')}
          </label>
        </div>
        <div className={styles.divider} />
        <div className="mtm">
          <Checkbox
            value={model.props.randomizeAnswers}
            onChange={e => this.onChange('randomizeAnswers', e.target.checked)}
            checked={model.props.randomizeAnswers}
          >
            {I18n.t('administration.report_builder.property_panel.randomize_answers_order')}
          </Checkbox>
          <Checkbox
            onChange={e => this.onChange('hideRolesWithNoData', e.target.checked)}
            checked={model.props.hideRolesWithNoData}
          >
            {I18n.t('administration.report_builder.property_panel.hide_responses_with_no_data')}
          </Checkbox>
        </div>
        <div className={styles.divider} />
        {modules.length > 1 ? null
          : (
            <div className="mtm">
              <PaginationOptions module={model} onChange={this.onChange} />
            </div>
          )}
      </div>
    )
  }
}

export default connect((state, { modules }) => ({
  questions: getQuestions(state.report, modules[0].assessment_id),
}), {})(Properties)
