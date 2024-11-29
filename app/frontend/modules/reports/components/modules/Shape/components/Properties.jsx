import { useCallback } from 'react'
import _ from 'lodash'
import { Button, Space } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import panelStyles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'
import { ColorPicker } from '~/glint'
import { rgba2hex } from '~/utils/color'
import ChoicesInput from '~/modules/reports/components/ChoicesInput'
import AssessmentProperties from '~/modules/reports/components/modules/CommonProperties/AssessmentProperties'
import clearAfterAssessmentChange from '~/modules/reports/components/modules/CommonMethods/clearAfterAssessmentChange'
import styles from './PropStyles.less'
import connect from '../connect'

const Properties = ({ openConditionalText, modules }) => {
  const { style } = modules[0].props
  const { assessment_id } = modules[0]

  const {
    backgroundColor, borderColor, borderRadius, shadow, offsetX, offsetY,
  } = style

  const changeStyle = useCallback(
    (property, value) => {
      modules.forEach((model) => {
        model.props.style[property] = value
        model.update()
      })
    },
    [modules],
  )

  const changeBg = useCallback(
    color => changeStyle('backgroundColor', color),
    [changeStyle],
  )

  const changeBorder = useCallback(
    color => changeStyle('borderColor', color),
    [changeStyle],
  )

  const changeBorderRadius = useCallback(
    val => changeStyle('borderRadius', val),
    [changeStyle],
  )

  const changeShadow = useCallback(
    val => changeStyle('shadow', val),
    [changeStyle],
  )

  const changeX = useCallback(
    val => changeStyle('offsetX', val),
    [changeStyle],
  )

  const changeY = useCallback(
    val => changeStyle('offsetY', val),
    [changeStyle],
  )

  const changeAssessment = useCallback(
    (assessmentId) => {
      modules.forEach((model) => {
        model.assessment_id = assessmentId
        clearAfterAssessmentChange(model)
        model.update()
      })
    },
    [modules],
  )

  const openConditionModal = useCallback(() => {
    openConditionalText({ modules })
  }, [openConditionalText, modules])

  const removeStyle = useCallback(
    (name) => {
      modules.forEach((model) => {
        model.props.style = _.omit(model.props.style, name)
        model.update()
      })
    },
    [modules],
  )

  return (
    <div>
      <div className={panelStyles.title}>Shape Options</div>
      <AssessmentProperties
        assessmentId={assessment_id}
        changeAssessment={changeAssessment}
      />
      <hr className={panelStyles.divider} />
      <hr className={styles.divider} />
      <div className="margin-top-10 margin-bottom-10">
        <div
          style={{ width: '100%' }}
          onClick={openConditionModal}
          className="btn btn-default"
        >
          Manage style conditions
        </div>
      </div>
      <hr className={styles.divider} />
      <div className={styles.block} style={{ position: 'relative' }}>
        Background Color
        <Space.Compact block className={styles.flexCenter}>
          <ColorPicker
            value={_.isObject(backgroundColor) ? rgba2hex(backgroundColor) : backgroundColor}
            onChange={changeBg}
          />
          {backgroundColor && (
            <Button
              onClick={() => removeStyle('backgroundColor')}
              size="small"
              type="link"
              danger
              icon={<DeleteOutlined />}
            />
          )}
        </Space.Compact>
      </div>
      <div className={styles.block} style={{ position: 'relative' }}>
        Border Color
        <Space.Compact block className={styles.flexCenter}>
          <ColorPicker
            value={_.isObject(borderColor) ? rgba2hex(borderColor) : borderColor}
            onChange={changeBorder}
          />
          {borderColor && (
            <Button
              onClick={() => removeStyle('borderColor')}
              size="small"
              type="link"
              danger
              icon={<DeleteOutlined />}
            />
          )}
        </Space.Compact>
      </div>
      <hr className={panelStyles.divider} />
      <div className={styles.block}>
        Rounded Corners
        <ChoicesInput value={borderRadius} onChange={changeBorderRadius} maxValue={1000} />
      </div>
      <hr className={panelStyles.divider} />
      <div className={styles.block}>
        Drop Shadow
        <ChoicesInput value={shadow} onChange={changeShadow} maxValue={1000} />
      </div>
      <div className={styles.block}>
        Offset X
        <ChoicesInput value={offsetX} onChange={changeX} maxValue={1000} />
      </div>
      <div className={styles.block}>
        Offset Y
        <ChoicesInput value={offsetY} onChange={changeY} maxValue={1000} />
      </div>
      <hr className={panelStyles.divider} />
    </div>
  )
}

export default connect(Properties)
