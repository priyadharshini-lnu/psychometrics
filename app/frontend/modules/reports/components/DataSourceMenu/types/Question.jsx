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
    const { model, onSelect } = this.props
    if (_.isArray(questions)) {
      model.props.source.id = questions.map(q => q.value)
    } else {
      model.props.source.id = questions.value
    }
    onSelect()
    PropertyPanelStore.update()
  }

  getOptions () {
    const { model, questions } = this.props
    const qstns = _.map(questions, q => ({
      value: q.id,
      label: `${q.name} ${(Utils.stripHTML(q.props.questionText) || '').substring(0, 24)}...`,
      type: q.type,
    }))
    return model.filterQuestions(qstns)
  }

  render () {
    const { model } = this.props
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

export default connect((state, { model }) => ({
  questions: getQuestions(state.report, model.assessment_id),
}), {})(Question)
