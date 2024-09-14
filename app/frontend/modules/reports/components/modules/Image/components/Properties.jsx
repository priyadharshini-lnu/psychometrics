import { Component } from 'react'
import Select from 'react-select'
import { Space, InputNumber, Select as AntSelect } from 'antd'
import { LibraryStore } from '~/libs/library'
import styles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'
import LibraryTransport from '~/modules/reports/cable/LibraryChannel'
import Socket from '~/modules/reports/cable'
import AssessmentProperties from '~/modules/reports/components/modules/CommonProperties/AssessmentProperties'
import clearAfterAssessmentChange from '~/modules/reports/components/modules/CommonMethods/clearAfterAssessmentChange'
import { getValue } from '~/modules/reports/presenters/ReactSelectPresenter'
import { rgba2hex } from '~/utils/color'
import ChoicesInput from '~/modules/reports/components/ChoicesInput'
import { ColorPicker } from '~/glint'
import QuestionsSelect from './QuestionsSelect'
import connect from '../connect'

const TYPE_OPTIONS = [
  { label: 'Simple Image', value: 'SimpleImage' },
  { label: 'Conditional Image', value: 'ConditionalImage' },
  { label: 'Uploaded Image', value: 'ResponseImage' },
  { label: 'User Profile Image', value: 'UserProfileImage' },
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

  changeBorderColor = (color) => {
    const { model } = this.props
    model.props.style.borderColor = color
    model.update()
  }

  changeBorderRadius = (val) => {
    const { model } = this.props
    model.props.style.borderRadius = val
    model.update()
  }

  changeBorderWidth = (val) => {
    const { model } = this.props
    model.props.style.borderWidth = val
    model.update()
  }

  changeBorderStyle = (val) => {
    const { model } = this.props
    model.props.style.borderStyle = val
    model.update()
  }

  changeUrl = (e) => {
    const { model } = this.props
    const val = e.currentTarget.value
    model.props.url = val
    model.update()
  }

  changeBorder = (e) => {
    const { model } = this.props
    const val = e.currentTarget.checked
    model.props.border = val
    if (val) {
      model.props.style = model.props.style ? model.props.style : { style: 'solid' }
    }
    model.update()
  }

  changeAspectRatio = (e) => {
    const { model } = this.props
    const val = e.currentTarget.checked
    model.props.aspectRatio = val
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
    const {
      borderRadius, borderColor = {}, borderWidth, borderStyle,
    } = (model.props.style || {})

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
        <div className={styles.block} style={{ position: 'relative' }}>
          <label className={styles.inputLabel}>
            <input
              style={{ marginRight: '5px' }}
              type="checkbox"
              checked={model.props.aspectRatio}
              onChange={this.changeAspectRatio}
            />
            Resize with Aspect Ratio
          </label>
        </div>
        <hr className={styles.divider} />
        <div className={styles.block} style={{ position: 'relative' }}>
          <label className={styles.inputLabel}>
            <input
              style={{ marginRight: '5px' }}
              type="checkbox"
              checked={model.props.border}
              onChange={this.changeBorder}
            />
            Border
          </label>
        </div>
        {model.props.border && (
          <>
            <Space.Compact block>
              <div className={styles.inline}>
                <label>Width</label>
                <InputNumber value={borderWidth || 0} min={0} onChange={this.changeBorderWidth} max={100} />
              </div>
              <div className={styles.inline}>
                <label>Style</label>
                <AntSelect
                  style={{ width: '100%' }}
                  onChange={this.changeBorderStyle}
                  value={borderStyle}
                  options={[
                    { value: 'solid' },
                    { value: 'dashed' },
                    { value: 'dotted' },
                    { value: 'double' },
                    { value: 'groove' },
                    { value: 'ridge' },
                    { value: 'inset' },
                    { value: 'outset' },
                  ]}
                />
              </div>
            </Space.Compact>
            <div className={styles.block} style={{ position: 'relative' }}>
              <ColorPicker value={rgba2hex(borderColor)} onChange={this.changeBorderColor} />
              Border Color
            </div>
          </>
        )}

        <div className={styles.block}>
          Rounded Corners
          <ChoicesInput value={borderRadius || 0} onChange={this.changeBorderRadius} maxValue={1000} />
        </div>
        <hr className={styles.divider} />
      </div>
    )
  }
}

export default connect(Properties)
