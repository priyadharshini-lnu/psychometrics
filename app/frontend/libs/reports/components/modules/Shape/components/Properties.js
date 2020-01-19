import React, { Component } from 'react'
import panelStyles from 'rb/views/PropertyPanel/components/PropertyPanel.scss'
import ColorPicker from 'rb/components/ColorPicker'
import ChoicesInput from 'rb/components/ChoicesInput'
import store from 'rb/store/PropertyPanelStore'
import ConditionTextStore from 'rb/store/modals/ConditionTextStore'
import AssessmentProperties from 'rb/components/modules/CommonProperties/AssessmentProperties'
import clearAfterAssessmentChange from 'rb/components/modules/CommonMethods/clearAfterAssessmentChange'
import styles from './PropStyles.scss'

class Properties extends Component {
  changeBg = (color) => {
    store.model.props.style.backgroundColor = color.rgb
    this.forceUpdate()
  }

  changeBorder = (color) => {
    store.model.props.style.borderColor = color.rgb
    this.forceUpdate()
  }

  complete = () => {
    store.model.update()
  }

  changeBorderRadius = (val) => {
    store.model.props.style.borderRadius = val
    this.forceUpdate()
    store.model.update()
  }

  changeShadow = (val) => {
    store.model.props.style.shadow = val
    this.forceUpdate()
    store.model.update()
  }

  changeX = (val) => {
    store.model.props.style.offsetX = val
    this.forceUpdate()
    store.model.update()
  }

  changeY = (val) => {
    store.model.props.style.offsetY = val
    this.forceUpdate()
    store.model.update()
  }

  changeShapeType = (obj) => {
    store.model.props.shapeType = obj.value
    this.forceUpdate()
  }

  openConditionModal = () => {
    ConditionTextStore.open(store.model)
  }

  changeAssessment = (assessmentId) => {
    const { model } = this.props
    model.assessment_id = assessmentId
    clearAfterAssessmentChange(model)
    this.forceUpdate()
  }

  render () {
    const {
      borderRadius, backgroundColor, borderColor, shadow, offsetX, offsetY,
    } = store.model.props.style
    const { model } = this.props

    return (
      <div>
        <div className={panelStyles.title}>Shape Options</div>
        <AssessmentProperties assessmentId={model.assessment_id} changeAssessment={this.changeAssessment} />
        <hr className={panelStyles.divider} />
        <hr className={styles.divider} />
        <div className="margin-top-10 margin-bottom-10">
          <div
            style={{ width: '100%' }}
            onClick={this.openConditionModal}
            className="btn btn-default"
          >
            Manage style conditions
          </div>
        </div>
        <hr className={styles.divider} />
        <div className={styles.block} style={{ position: 'relative' }}>
          Background Color
          <ColorPicker color={backgroundColor} onChange={this.changeBg} onComplete={this.complete} />
        </div>
        <div className={styles.block} style={{ position: 'relative' }}>
          Border Color
          <ColorPicker color={borderColor} onChange={this.changeBorder} onComplete={this.complete} />
        </div>
        <hr className={panelStyles.divider} />
        <div className={styles.block}>
          Rounded Corners
          <ChoicesInput value={borderRadius} onChange={this.changeBorderRadius} maxValue={1000} />
        </div>
        <hr className={panelStyles.divider} />
        <div className={styles.block}>
          Drop Shadow
          <ChoicesInput value={shadow} onChange={this.changeShadow} maxValue={1000} />
        </div>
        <div className={styles.block}>
          Offset X
          <ChoicesInput value={offsetX} onChange={this.changeX} maxValue={1000} />
        </div>
        <div className={styles.block}>
          Offset Y
          <ChoicesInput value={offsetY} onChange={this.changeY} maxValue={1000} />
        </div>
        <hr className={panelStyles.divider} />
      </div>
    )
  }
}

export default Properties
