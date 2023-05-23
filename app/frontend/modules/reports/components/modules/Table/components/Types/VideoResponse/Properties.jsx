import { Component } from 'react'
import Select from 'react-select'
import _ from 'lodash'
import { connect } from 'react-redux'
import styles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'
import PropertyFilter from '~/modules/reports/components/PropertyFilter'
import { getValue } from '~/modules/reports/presenters/ReactSelectPresenter'
import { getQuestions } from '~/modules/reports/core/builder/selectors'

const AVAILABLE_QUESTION_TYPES = ['VideoResponse']

class Properties extends Component {
  onChange = (key, value) => {
    const { model } = this.props
    model.props[key] = value
    model.update()
    this.forceUpdate()
  }

  render () {
    const { model, questions } = this.props
    const videoQuestions = _.filter(questions || [], q => AVAILABLE_QUESTION_TYPES.includes(q.type))
    const options = _.map(videoQuestions, question => ({ label: question.name, value: question.id }))

    return (
      <div>
        <div className={styles.title}>Video Response</div>
        <div className="mtm">
          <PropertyFilter model={model} />
          <div className="mtm">
            Question
            <Select
              value={getValue(options, model.props.questionId)}
              options={options}
              getOptionValue={opt => opt.value}
              autoFocus={false}
              isClearable={false}
              onChange={val => this.onChange('questionId', val.value)}
              placeholder="Video Questions"
            />
          </div>
        </div>
      </div>
    )
  }
}

export default connect((state, { model }) => ({
  questions: getQuestions(state.report, model.assessment_id),
}), {})(Properties)
