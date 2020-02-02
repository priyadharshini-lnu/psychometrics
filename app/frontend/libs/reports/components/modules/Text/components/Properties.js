import _ from 'lodash'
import React, { Component } from 'react'
import styles from 'rb/views/PropertyPanel/components/PropertyPanel.scss'
import store from 'rb/store/PropertyPanelStore'
import ConditionTextStore from 'rb/store/modals/ConditionTextStore'
import Action from 'rb/undo'
import ColorPicker from 'rb/components/ColorPicker'
import PropertyFonts from 'rb/components/PropertyFonts'
import ChoicesInput from 'rb/components/ChoicesInput'
import Select from 'react-select'
import ConditionalFactorOccupationTextStore from 'rb/store/modals/ConditionalFactorOccupationTextStore'
import AssessmentProperties from 'rb/components/modules/CommonProperties/AssessmentProperties'
import clearAfterAssessmentChange from 'rb/components/modules/CommonMethods/clearAfterAssessmentChange'
import { getValue } from 'rb/presenters/ReactSelectPresenter'
import localStyles from './Properties.scss'
import ResponseText from './SourceTypeForms/ResponseText'
import ResultText from './SourceTypeForms/ResultText'

const SELECT_OPTIONS = [
  { label: 'Text', value: 'Text' },
  { label: 'PipedText', value: 'PipedText' },
  { label: 'ConditionalText', value: 'ConditionalText' },
  { label: 'Conditional Subfactor / Occupation Text', value: 'ConditionalFactorOccupationText' },
  { label: 'Response Text', value: 'ResponseText' },
  { label: 'Result/DataSheet Text', value: 'ResultText' },
]

class Properties extends Component {
  componentDidMount () {
    this.listener = store.addListener('change', () => this.forceUpdate())
  }

  componentWillUnmount () {
    this.listener.remove()
  }

  update = () => {
    store.model.update()
    this.forceUpdate()
  }

  changeBg = (color) => {
    store.model.props.style.backgroundColor = color.rgb
  }

  changeBorder = (color) => {
    store.model.props.style.borderColor = color.rgb
  }

  changeType = (type, props = {}) => {
    if (store.question.type === type) { return }
    Action('QuestionChangeType', store.question, { oldType: store.question.type, newType: type })
    store.question.changeType(type, props)
    this.update()
  }

  changeHorizontalAlign = (type) => {
    if (store.model.props.style.horizontalAlign === type) {
      store.model.props.style.horizontalAlign = ''
    } else {
      store.model.props.style.horizontalAlign = type
    }

    this.update()
  }

  changeVerticalAlign = (type) => {
    store.model.props.style.verticalAlign = type
    this.update()
  }

  changeFontWeight = (e) => {
    store.model.props.style.fontWeight = e.currentTarget.checked ? 'bold' : 'normal'
    this.update()
  }

  changeFontStyle = (e) => {
    store.model.props.style.fontStyle = e.currentTarget.checked ? 'italic' : 'normal'
    this.update()
  }

  changeBorderRadius = (val) => {
    store.model.props.style.borderRadius = val
    this.update()
  }

  reset = () => {
    // eslint-disable-next-line no-alert
    if (window.confirm('Are you sure?')) {
      store.model.reset()
      this.forceUpdate()
    }
  }

  changeSourceType = (obj) => {
    store.model.props.sourceType = obj.value
    this.update()
  }

  openConditionModal = () => {
    ConditionTextStore.open(store.model)
  }

  openConditionalFactorOccupationModal = () => {
    ConditionalFactorOccupationTextStore.open(store.model)
  }

  changeAssessment = (assessmentId) => {
    const { model } = this.props
    model.assessment_id = assessmentId
    clearAfterAssessmentChange(model)
    this.update()
  }

  // TODO (atanych): prefix _ does not makes sense, because all component methods we use inside this component
  changeModelIn = (keys, value) => {
    const { model } = this.props
    // TODO (atanych): update model by link directly in the component is not good
    // practice. We should avoid mutations in future.
    // TODO (atanych): But in now let's keep as is.
    _.set(model, keys, value)
    this.update()
  }

  renderPosition () {
    const { verticalAlign } = store.model.props.style
    const { horizontalAlign } = store.model.props.style
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
    if (store.model.props.sourceType !== 'ResponseText') { return null }
    return (
      <ResponseText model={store.model} onChangeModelIn={this.changeModelIn} />
    )
  }

  // TODO (atanych): should be extracted neighbourhood as dedicated Components according to store.model.props.sourceType
  renderResultTextForm () {
    if (store.model.props.sourceType !== 'ResultText') { return null }
    return (
      <ResultText model={store.model} onChangeModelIn={this.changeModelIn} update={this.update} />
    )
  }

  renderDataSourceOptions () {
    if (store.model.props.sourceType === 'ResultText') return null

    const { model } = this.props
    return (
      <div>
        <hr className={styles.divider} />
        <AssessmentProperties assessmentId={model.assessment_id} changeAssessment={this.changeAssessment} />
      </div>
    )
  }

  render () {
    const { backgroundColor, borderColor, borderRadius } = store.model.props.style
    return (
      <div>
        <div className={styles.title}>Text Options</div>
        {this.renderDataSourceOptions()}
        <hr className={styles.divider} />
        <div className="margin-top-10 margin-bottom-10">
          <Select
            name="form-field-name"
            value={getValue(SELECT_OPTIONS, store.model.props.sourceType)}
            options={SELECT_OPTIONS}
            getOptionValue={opt => opt.value}
            autoFocus={false}
            isClearable={false}
            onChange={this.changeSourceType}
          />
          {store.model.props.sourceType === 'ConditionalText'
            && (
            <div
              style={{ width: '100%' }}
              onClick={this.openConditionModal}
              className="btn btn-default"
            >
              Manage condition
            </div>
            )}
          {store.model.props.sourceType === 'ConditionalFactorOccupationText'
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
          store.model.props.sourceType === 'PipedText'
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
        <PropertyFonts />
        <div className="margin-top-10">Paragraph</div>
        {this.renderPosition()}
        <div className="margin-top-10">
          <label className={styles.inputLabel}>
            <input
              style={{ marginRight: '5px' }}
              type="checkbox"
              checked={store.model.props.style.fontWeight === 'bold'}
              onChange={this.changeFontWeight}
            />
            Bold
          </label>
          <label className={styles.inputLabel}>
            <input
              style={{ marginRight: '5px' }}
              type="checkbox"
              checked={store.model.props.style.fontStyle === 'italic'}
              onChange={this.changeFontStyle}
            />
            Italics
          </label>
        </div>
        <hr className={styles.divider} />
        <div className={styles.block} style={{ position: 'relative' }}>
          Background Color
          <ColorPicker color={backgroundColor} onChange={this.changeBg} onComplete={this.update} />
        </div>
        <div className={styles.block} style={{ position: 'relative' }}>
          Border Color
          <ColorPicker color={borderColor} onChange={this.changeBorder} onComplete={this.update} />
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

export default Properties
