import { Component } from 'react'
import panelStyles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'
import { ColorPicker } from '~/glint'
import { rgba2hex } from '~/utils/color'
import ChoicesInput from '~/modules/reports/components/ChoicesInput'
import AssessmentProperties from '~/modules/reports/components/modules/CommonProperties/AssessmentProperties'
import clearAfterAssessmentChange from '~/modules/reports/components/modules/CommonMethods/clearAfterAssessmentChange'
import styles from './PropStyles.less'
import connect from '../connect'

class Properties extends Component {
  changeBg = (color) => {
    const { model } = this.props
    model.props.style.backgroundColor = color
    this.forceUpdate()
  }

  changeBorder = (color) => {
    const { model } = this.props
    model.props.style.borderColor = color
    model.update()
  }

  complete = () => {
    const { model } = this.props
    model.update()
  }

  changeBorderRadius = (val) => {
    const { model } = this.props
    model.props.style.borderRadius = val
    model.update()
  }

  changeShadow = (val) => {
    const { model } = this.props
    model.props.style.shadow = val
    model.update()
  }

  changeX = (val) => {
    const { model } = this.props
    model.props.style.offsetX = val
    model.update()
  }

  changeY = (val) => {
    const { model } = this.props
    model.props.style.offsetY = val
    model.update()
  }

  changeShapeType = (obj) => {
    const { model } = this.props
    model.props.shapeType = obj.value
    model.update()
  }

  openConditionModal = () => {
    const { model, openConditionalText } = this.props
    openConditionalText({ module: model })
  }

  changeAssessment = (assessmentId) => {
    const { model } = this.props
    model.assessment_id = assessmentId
    clearAfterAssessmentChange(model)
    model.update()
  }

  render () {
    const { model } = this.props
    const {
      borderRadius, backgroundColor, borderColor, shadow, offsetX, offsetY,
    } = model.props.style

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
          <ColorPicker value={rgba2hex(backgroundColor)} onChange={this.changeBg} />
        </div>
        <div className={styles.block} style={{ position: 'relative' }}>
          Border Color
          <ColorPicker value={rgba2hex(borderColor)} onChange={this.changeBorder} />
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

export default connect(Properties)
