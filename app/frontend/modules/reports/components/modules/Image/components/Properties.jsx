import { Component } from 'react'
import Select from 'react-select'
import { LibraryStore } from '~/libs/library'
import styles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'
import LibraryTransport from '~/modules/reports/cable/LibraryChannel'
import Socket from '~/modules/reports/cable'
import AssessmentProperties from '~/modules/reports/components/modules/CommonProperties/AssessmentProperties'
import clearAfterAssessmentChange from '~/modules/reports/components/modules/CommonMethods/clearAfterAssessmentChange'
import { getValue } from '~/modules/reports/presenters/ReactSelectPresenter'
import QuestionsSelect from './QuestionsSelect'
import connect from '../connect'

const TYPE_OPTIONS = [
  { label: 'Simple Image', value: 'SimpleImage' },
  { label: 'Conditional Image', value: 'ConditionalImage' },
  { label: 'Uploaded Image', value: 'ResponseImage' },
]

class Properties extends Component {
  componentWillMount () {
    const { model } = this.props
    const type = model.props.sourceType
    model.props.sourceType = type || 'SimpleImage'
  }

  componentDidMount () {
    LibraryTransport.init()
    this.librarySocket = Socket.library()
  }

  onSelectGraphic = (item) => {
    const { model } = this.props
    model.props.url = item.file
    this.update()
  }

  changeUrl = (e) => {
    const { model } = this.props
    const val = e.currentTarget.value
    model.props.url = val
    model.update()
  }

  openLibrary = () => {
    LibraryStore.openPopup(this.librarySocket, this.onSelectGraphic, 'image')
  }

  update = () => {
    const { model } = this.props
    model.update()
  }

  changeSourceType = (obj) => {
    const { model } = this.props
    model.props.sourceType = obj.value
    if (model.props.sourceType === 'ConditionalImage') {
      model.props.url = null
    }
    this.update()
  }

  openConditionModal = () => {
    const { model, openConditionalImage } = this.props
    openConditionalImage({ model })
  }

  changeAssessment = (assessmentId) => {
    const { model } = this.props
    model.assessment_id = assessmentId
    clearAfterAssessmentChange(model)
    this.update()
  }

  expand = () => {
    const { model, pageSize } = this.props
    model.props.position.left = 0
    model.props.position.top = 0
    model.props.position.width = pageSize.width
    model.props.position.height = pageSize.height
    this.update()
  }

  render () {
    const { model, questions } = this.props
    return (
      <div>
        <div className={styles.title}>Image Options</div>
        <AssessmentProperties assessmentId={model.assessment_id} changeAssessment={this.changeAssessment} />
        <hr className={styles.divider} />
        <div className="margin-top-10 margin-bottom-10">
          <Select
            name="form-field-name"
            value={getValue(TYPE_OPTIONS, model.props.sourceType)}
            options={TYPE_OPTIONS}
            getOptionValue={opt => opt.value}
            autoFocus={false}
            clearable={false}
            onChange={this.changeSourceType}
          />
          {model.props.sourceType === 'ConditionalImage'
            && (
            <div
              style={{ width: '100%' }}
              onClick={this.openConditionModal}
              className="btn btn-default"
            >
              Manage condition
            </div>
            )}
          {
            model.props.sourceType === 'SimpleImage'
            && (
            <div>
              <div className={styles.block}>
                <a onClick={this.openLibrary} className={styles.text}>Choose Image</a>
              </div>
              <div className={styles.block}>
                <label className={styles.inputLabel}>
                  Url
                </label>
                <input value={model.props.url} onChange={this.changeUrl} />
              </div>
            </div>
            )
          }
          {
            model.props.sourceType === 'ResponseImage'
            && (
            <div>
              <div className={styles.block}>
                <QuestionsSelect questions={questions} model={model} onSelect={this.update} />
              </div>
            </div>
            )
          }
          <div className={styles.block}>
            <button className="btn btn-default" onClick={this.expand}>Expand to page sizes</button>
          </div>
        </div>
        <hr className={styles.divider} />
      </div>
    )
  }
}

export default connect(Properties)
