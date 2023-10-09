import _ from 'lodash'
import { Component } from 'react'
import Select from 'react-select'
import styles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'
import Action from '~/modules/reports/undo'
import { ColorPicker } from '~/glint'
import PropertyFonts from '~/modules/reports/components/PropertyFonts'
import ChoicesInput from '~/modules/reports/components/ChoicesInput'
import AssessmentProperties from '~/modules/reports/components/modules/CommonProperties/AssessmentProperties'
import clearAfterAssessmentChange from '~/modules/reports/components/modules/CommonMethods/clearAfterAssessmentChange'
import { getValue } from '~/modules/reports/presenters/ReactSelectPresenter'
import localStyles from './Properties.less'
import ResponseText from './SourceTypeForms/ResponseText'
import ResultText from './SourceTypeForms/ResultText'
import connect from '../connect'
import { rgba2hex } from '~/utils/color'


const SELECT_OPTIONS = [
  { label: 'Text', value: 'Text' },
  { label: 'PipedText', value: 'PipedText' },
  { label: 'ConditionalText', value: 'ConditionalText' },
  { label: 'Conditional Subfactor / Occupation Text', value: 'ConditionalFactorOccupationText' },
  { label: 'Response Text', value: 'ResponseText' },
  { label: 'Result/DataSheet Text', value: 'ResultText' },
]

class Properties extends Component {
  update = () => {
    const { model } = this.props
    model.update()
  }

  changeBg = (color) => {
    const { model } = this.props
    model.props.style.backgroundColor = color
    model.update()
  }

  changeBorder = (color) => {
    const { model } = this.props
    model.props.style.borderColor = color
    model.update()
  }

  changeType = (type, props = {}) => {
    const { model } = this.props
    if (model.type === type) { return }
    Action('QuestionChangeType', model, { oldType: model.type, newType: type })
    model.changeType(type, props)
    this.update()
  }

  changeHorizontalAlign = (type) => {
    const { model } = this.props
    if (model.props.style.horizontalAlign === type) {
      model.props.style.horizontalAlign = ''
    } else {
      model.props.style.horizontalAlign = type
    }
    model.update()
  }

  changeVerticalAlign = (type) => {
    const { model } = this.props
    model.props.style.verticalAlign = type
    this.update()
  }

  changeFontWeight = (e) => {
    const { model } = this.props
    model.props.style.fontWeight = e.currentTarget.checked ? 'bold' : 'normal'
    this.update()
  }

  changeFontStyle = (e) => {
    const { model } = this.props
    model.props.style.fontStyle = e.currentTarget.checked ? 'italic' : 'normal'
    this.update()
  }

  changeBorderRadius = (val) => {
    const { model } = this.props
    model.props.style.borderRadius = val
    this.update()
  }

  reset = () => {
    const { model } = this.props
    // eslint-disable-next-line no-alert
    if (window.confirm('Are you sure?')) {
      model.reset()
      this.forceUpdate()
    }
  }

  changeSourceType = (obj) => {
    const { model } = this.props
    model.props.sourceType = obj.value
    this.update()
  }

  openConditionModal = () => {
    const { model, openConditionalText } = this.props
    openConditionalText({ module: model })
  }

  openConditionalFactorOccupationModal = () => {
    const { model, openConditionalFactorOccupationText } = this.props
    openConditionalFactorOccupationText({ module: model })
  }

  changeAssessment = (assessmentId) => {
    const { model } = this.props
    model.assessment_id = assessmentId
    clearAfterAssessmentChange(model)
    this.update()
  }

  changeEditAndApprove = (e) => {
    const { model } = this.props
    model.props.editable = e.currentTarget.checked
    this.update()
  }

  changeModelIn = (keys, value) => {
    const { model } = this.props
    // TODO (atanych): update model by link directly in the component is not good
    // practice. We should avoid mutations in future.
    // TODO (atanych): But for now let's keep as is.
    _.set(model, keys, value)
    this.update()
  }

  changeSkipRoundValues = (e) => {
    const { model } = this.props
    model.props.skipRoundingValues = e.currentTarget.checked
    this.update()
  }


  renderPosition () {
    const { model } = this.props
    const { verticalAlign } = model.props.style
    const { horizontalAlign } = model.props.style
    return (
      <div className={localStyles.containersBox}>
        <div className={localStyles.horizontalContainer}>
          {_.map(['left', 'center', 'right'], (type, i) => (
            <div
              key={i}
              onClick={e => this.changeHorizontalAlign(type, e)}
              className={`
                ${horizontalAlign === type && localStyles.active} ${localStyles.alignedBlock} ${localStyles[type]}
              `}
            />
          ))}
        </div>
        <div className={localStyles.verticalContainer}>
          {_.map(['flex-start', 'center', 'flex-end'], (type, i) => (
            <div
              key={i}
              onClick={e => this.changeVerticalAlign(type, e)}
              className={
                `${verticalAlign === type && localStyles.active} ${localStyles.alignedBlock} ${localStyles[type]}`
              }
            />
          ))}
        </div>
      </div>
    )
  }

  // TODO (atanych): should be extracted neighbourhood as dedicated Components according to store.model.props.sourceType
  renderResponseTextForm () {
    const { model, questions } = this.props
    if (model.props.sourceType !== 'ResponseText') { return null }
    return (
      <ResponseText model={model} onChangeModelIn={this.changeModelIn} questions={questions} />
    )
  }

  // TODO (atanych): should be extracted neighbourhood as dedicated Components according to store.model.props.sourceType
  renderResultTextForm () {
    const { model, questions } = this.props
    if (model.props.sourceType !== 'ResultText') { return null }
    return (
      <ResultText model={model} onChangeModelIn={this.changeModelIn} update={this.update} questions={questions} />
    )
  }

  renderDataSourceOptions () {
    const { model } = this.props
    if (model.props.sourceType === 'ResultText') return null

    return (
      <div>
        <hr className={styles.divider} />
        <AssessmentProperties assessmentId={model.assessment_id} changeAssessment={this.changeAssessment} />
      </div>
    )
  }

  render () {
    const { model } = this.props
    const { backgroundColor, borderColor, borderRadius } = model.props.style
    return (
      <div>
        <div className={styles.title}>Text Options</div>
        {this.renderDataSourceOptions()}
        <hr className={styles.divider} />
        <div className="margin-top-10 margin-bottom-10">
          <Select
            name="form-field-name"
            value={getValue(SELECT_OPTIONS, model.props.sourceType)}
            options={SELECT_OPTIONS}
            getOptionValue={opt => opt.value}
            autoFocus={false}
            isClearable={false}
            onChange={this.changeSourceType}
          />
          {model.props.sourceType === 'ConditionalText'
            && (
            <div
              style={{ width: '100%' }}
              onClick={this.openConditionModal}
              className="btn btn-default"
            >
              Manage condition
            </div>
            )}
          {model.props.sourceType === 'ConditionalFactorOccupationText'
            && (
            <div
              style={{ width: '100%' }}
              onClick={this.openConditionalFactorOccupationModal}
              className="btn btn-default"
            >
              Manage condition
            </div>
            )}
          {this.renderResponseTextForm()}
          {this.renderResultTextForm()}
          {
          model.props.sourceType === 'PipedText'
          && (
          <div style={{ width: '100%' }}>
            <div>
              {'{{first_name}}'}
              {' '}
              - First Name
            </div>
            <div>
              {'{{last_name}}'}
              {' '}
              - Last Name
            </div>
            <div>
              {'{{completed_at}}'}
              {' '}
              - Date of completion assessment
            </div>
            <div>
              {'{{norm_used}}'}
              {' '}
              - Norm Used
            </div>
            <div>
              {'{{locale_name}}'}
              {' '}
              - Locale
            </div>
            <br />
            <em>{'Note: {{}} Must only be used with available Piped Text Options'}</em>
          </div>
          )
        }
        </div>
        <hr className={styles.divider} />
        <div className="margin-top-10">Font</div>
        <PropertyFonts model={model} />
        <div className="margin-top-10">Paragraph</div>
        {this.renderPosition()}
        <div className="margin-top-10">
          <label className={styles.inputLabel}>
            <input
              style={{ marginRight: '5px' }}
              type="checkbox"
              checked={model.props.style.fontWeight === 'bold'}
              onChange={this.changeFontWeight}
            />
            Bold
          </label>
          <label className={styles.inputLabel}>
            <input
              style={{ marginRight: '5px' }}
              type="checkbox"
              checked={model.props.style.fontStyle === 'italic'}
              onChange={this.changeFontStyle}
            />
            Italics
          </label>
        </div>
        <hr className={styles.divider} />
        <div className={styles.block} style={{ position: 'relative' }}>
          <div className="margin-top-10">Content overriding</div>
          <label className={styles.inputLabel}>
            <input
              style={{ marginRight: '5px' }}
              type="checkbox"
              checked={model.props.editable}
              onChange={this.changeEditAndApprove}
            />
            Edit and Approve
          </label>
        </div>
        <hr className={styles.divider} />
        <div className={styles.block} style={{ position: 'relative' }}>
          Background Color
          <ColorPicker
            value={rgba2hex(backgroundColor)}
            onChange={this.changeBg}
          />
        </div>
        <div className={styles.block} style={{ position: 'relative' }}>
          Border Color
          <ColorPicker
            value={rgba2hex(borderColor)}
            onChange={this.changeBorder}
          />
        </div>
        <hr className={styles.divider} />
        <div className={styles.block}>
          Rounded Corners
          <ChoicesInput value={borderRadius} onChange={this.changeBorderRadius} maxValue={1000} />
        </div>
        <hr className={styles.divider} />
        <div className={`${styles.block} ${styles.reset}`} onClick={this.reset}>
          Reset Text...
        </div>
      </div>
    )
  }
}

export default connect(Properties)
