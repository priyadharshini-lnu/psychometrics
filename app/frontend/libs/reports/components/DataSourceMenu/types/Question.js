import _ from 'lodash'
import React, { Component } from 'react'
import Select from 'react-select'
import AssessmentStore from 'rb/store/AssessmentStore'
import PropertyPanelStore from 'rb/store/PropertyPanelStore'
import Utils from 'rb/utils/Utils'
import { getValue } from 'rb/presenters/ReactSelectPresenter'

class Question extends Component {
  getOptions () {
    const { model } = this.props
    const questions = _.map(AssessmentStore.questions[model.assessment_id], q => ({
      value: q.id,
      label: `${q.name} ${(Utils.stripHTML(q.props.questionText) || '').substring(0, 24)}...`,
      type: q.type,
    }))
    return model.filterQuestions(questions)
  }

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

  render () {
    const { model } = this.props
    return (
      <Select
        name="form-field-name"
        value={getValue(this.getOptions(), _.result(model, 'props.source.id', 'Choose question'))}
        options={this.getOptions()}
        getOptionValue={opt => opt.id}
        clearable={false}
        autoFocus={false}
        isMulti={model.isQuestionMultiFiltering()}
        onChange={this.onChange}
      />
    )
  }
}

export default Question
