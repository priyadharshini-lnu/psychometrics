import _ from 'lodash'
import { Component } from 'react'
import Select from 'react-select'
import { connect } from 'react-redux'
import PropertyPanelStore from '~/modules/reports/store/PropertyPanelStore'
import Utils from '~/modules/reports/utils/Utils'
import { getValue } from '~/modules/reports/presenters/ReactSelectPresenter'
import { getQuestions } from '~/modules/reports/core/builder/selectors'

class Question extends Component {
  onChange = (questions) => {
    const { modules, onSelect } = this.props
    modules.forEach(((module) => {
      if (_.isArray(questions)) {
        module.props.source.id = questions.map(q => q.value)
      } else {
        module.props.source.id = questions.value
      }
    }))
    onSelect()
    PropertyPanelStore.update()
  }

  getOptions () {
    const { modules: [model], questions } = this.props
    const qstns = _.map(questions, q => ({
      value: q.id,
      label: `${q.name} ${(Utils.stripHTML(q.props.questionText) || '').substring(0, 24)}...`,
      type: q.type,
    }))
    return model.filterQuestions(qstns)
  }

  render () {
    const { modules } = this.props
    const model = modules[0]
    return (
      <Select
        name="form-field-name"
        value={getValue(this.getOptions(), _.result(model, 'props.source.id', 'Choose question'))}
        options={this.getOptions()}
        clearable={false}
        autoFocus={false}
        isMulti={model.isQuestionMultiFiltering()}
        onChange={this.onChange}
      />
    )
  }
}

export default connect((state, { modules: [model] }) => ({
  questions: getQuestions(state.report, model.assessment_id),
}), {})(Question)
