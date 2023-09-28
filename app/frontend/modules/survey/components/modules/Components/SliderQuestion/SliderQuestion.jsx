import times from 'lodash/times'
import { useState } from 'react'
import {
  Slider as AntSlider, InputNumber, Row, Col, Button,
} from 'antd'
import cs from 'classnames'
import _ from 'lodash'

import Utils from '~/modules/survey/utils'
import LabelEditor from '~/modules/survey/components/LabelEditor'
import { scaleNumber } from '~/utils/number'

import styles from './Slider.less'

export const SliderQuestion = ({
  model, I18n, preview, changeLabel, changeValue, readOnly,
}) => {
  const {
    result, props, choicesIds, moduleConfig,
  } = model
  const {
    gridLines, maxValue, minValue, numberOfDecimals, labels, choices, hideChoiceText, hideGridValues, hideValue,
  } = props
  const labelWidth = `${100 / labels}%`
  const questionChoices = preview ? choicesIds : times(choices, i => i)
  const scaledValue = value => _.round(scaleNumber(value, 1, 100, minValue, maxValue), numberOfDecimals)
  const unscaledValue = value => scaleNumber(value, minValue, maxValue, 1, 100)
  const scaledAnswers = (result.answers || []).map(answer => ({ ...answer, value: unscaledValue(answer.value) }))
  const [values, setValue] = useState(scaledAnswers)


  const onChangeSlider = (choiceId, value, update) => {
    setValue({ ...values, [choiceId]: { index: choiceId, value: update ? unscaledValue(scaledValue(value)) : value } })

    if (update) {
      changeValue(choiceId, scaledValue(value))
    }
  }

  const labelsColspan = () => {
    if (hideChoiceText && hideValue) {
      return 24
    }
    if (hideChoiceText) {
      return 21
    }
    if (hideValue) {
      return 16
    }
    return 14
  }

  const labelRow = (
    <>
      {times(labels, i => (
        <Col key={i} flex="auto" style={{ width: labelWidth }} className={styles.label}>
          {preview ? (
            <span style={{ overflowWrap: 'break-word' }}>
              {I18n.tQuestion(model, `labelsTexts${i + 1}`, { label: i }) || moduleConfig.defaultLabelText(i + 1)}
            </span>
          ) : (
            <LabelEditor
              key={i}
              onChange={e => changeLabel('labelsTexts', i, e)}
              maxWidth={150}
              value={props.labelsTexts[i] || moduleConfig.defaultLabelText(i + 1)}
            />
          )}
        </Col>
      ))}
    </>
  )

  const gridLinesColspan = () => {
    if (hideChoiceText && hideValue) {
      return 24
    }
    if (hideChoiceText) {
      return 21
    }
    if (hideValue) {
      return 16
    }

    return 14
  }

  const gridMarkingRow = (
    <Row className={`${styles.gridRow} ${styles.gridMarksRow}`}>
      <Col span={gridLinesColspan()} offset={hideChoiceText ? 0 : 8}>
        <Row wrap={false} justify="space-between">
          {times(gridLines + 1, i => (
            <Col key={i} className="text-align-l">
              {minValue + Utils.round(((maxValue - minValue) * i) / gridLines, numberOfDecimals)}
            </Col>
          ))}
        </Row>
      </Col>
    </Row>
  )

  const questionRows = (
    <div className={styles.responseRowContainer}>
      {questionChoices.map(choiceId => (
        <Row key={choiceId} className={`${styles.gridRow} ${styles.responseRow}`}>
          {!hideChoiceText && (
          <Col span={8}>
            {preview ? (
              <span>
                {I18n.tQuestion(model, `choicesTexts${choiceId + 1}`, { choice: choiceId })
                    || moduleConfig.defaultChoiceText(choiceId + 1)}
              </span>
            ) : (
              <LabelEditor
                onChange={e => changeLabel('choicesTexts', choiceId, e)}
                maxWidth={150}
                value={props.choicesTexts[choiceId] || moduleConfig.defaultChoiceText(choiceId + 1)}
              />
            )}
          </Col>
          )}
          <Col span={hideValue ? 24 : 20} className={styles.responseLabelRowMobile}>
            <Row>{labelRow}</Row>
          </Col>
          <Col span={hideChoiceText ? 24 : 16}>
            <Row className={styles.responseControlsRow}>
              <Col className={styles.sliderContainer} span={hideValue ? 24 : 21}>
                <AntSlider
                  onAfterChange={value => onChangeSlider(choiceId, value, true)}
                  onChange={value => onChangeSlider(choiceId, value)}
                  value={preview ? values[choiceId]?.value : props.fakeResults[choiceId]}
                  min={1}
                  max={100}
                  className={cs(styles.slider, 'ms-0 me-0')}
                    // Widthout this extra span with key, the tooltip doesn't move properly
                  tipFormatter={
                    hideValue ? null : value => <span key={value}>{scaledValue(value)}</span>
                  }
                  disabled={readOnly}
                />
              </Col>
              {!hideValue && (
                <Col className={`ps-4 ${styles.inputContainer}`} span={3}>
                  <InputNumber
                    onChange={value => onChangeSlider(choiceId, unscaledValue(value), true)}
                    value={preview
                      ? values[choiceId] && scaledValue(values[choiceId].value)
                      : props.fakeResults[choiceId]}
                    style={{ maxWidth: '100%' }}
                    min={minValue}
                    max={maxValue}
                    controls={false}
                    disabled={readOnly}
                  />
                  {!readOnly && (
                    <Button
                      onClick={() => onChangeSlider(choiceId, minValue, true)}
                      type="link"
                      className="text-align-c"
                    >
                      Clear
                    </Button>
                  )}
                </Col>
              )}
            </Row>
          </Col>
        </Row>
      ))}
    </div>
  )

  return (
    <>
      <Row>
        <Col span={24}>
          <div className="labelContainer">
            <Row className={`${styles.gridRow} ${styles.responseLabelRow}`} wrap={false}>
              <Col span={labelsColspan()} offset={hideChoiceText ? 0 : 8}>
                <Row>{labelRow}</Row>
              </Col>
            </Row>
          </div>
          {!hideGridValues && gridMarkingRow}
          {questionRows}
        </Col>
      </Row>
    </>
  )
}
