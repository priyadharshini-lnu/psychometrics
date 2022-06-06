import find from 'lodash/find'
import times from 'lodash/times'
import React from 'react'
import {
  Slider as AntSlider, InputNumber, Row, Col, Button,
} from 'antd'

import LabelEditor from 'components/LabelEditor'
import Utils from 'utils'

import styles from './Slider.less'

export const SliderQuestion = ({
  model, I18n, preview, changeLabel, changeValue,
}) => {
  const {
    result, props, choicesIds, moduleConfig,
  } = model
  const {
    gridLines, maxValue, minValue, numberOfDecimals, labels, choices,
  } = props
  const labelWidth = `${100 / labels}%`

  const questionChoices = preview ? choicesIds : times(choices, i => i)

  const labelRow = (
    <>
      {times(labels, i => (
        <Col key={i} flex="auto" style={{ width: labelWidth }} className="text-align-l">
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

  const gridMarkingRow = (
    <Row className={`${styles.gridRow} ${styles.gridMarksRow}`}>
      <Col span={14} offset={8}>
        <Row>
          {times(gridLines, i => (
            <Col key={i} flex="auto" className="text-align-l">
              {minValue + Utils.round(((maxValue - minValue) * i) / gridLines, numberOfDecimals)}
            </Col>
          ))}
        </Row>
      </Col>
      <Col span={2} className={`${styles.gridLastCount} text-align-l`}>
        {minValue + Utils.round(((maxValue - minValue) * gridLines) / gridLines, numberOfDecimals)}
      </Col>
    </Row>
  )

  const questionRows = (
    <div className={styles.responseRowContainer}>
      {questionChoices.map((choiceId) => {
        const currentChoice = find(result.answers, { index: choiceId }) || {}
        return (
          <Row key={choiceId} className={`${styles.gridRow} ${styles.responseRow}`}>
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
            <Col span={20} className={styles.responseLabelRowMobile}>
              <Row>{labelRow}</Row>
            </Col>
            <Col span={16}>
              <Row className={styles.responseControlsRow}>
                <Col className={styles.sliderContainer} span={21}>
                  <AntSlider
                    onChange={value => changeValue(choiceId, value)}
                    value={preview ? currentChoice.value : props.fakeResults[choiceId]}
                    min={minValue}
                    max={maxValue}
                    tooltipVisible={false}
                    className="ms-0 me-0"
                  />
                </Col>
                <Col className={`ps-4 ${styles.inputContainer}`} span={3}>
                  <InputNumber
                    onChange={value => changeValue(choiceId, value)}
                    value={preview ? currentChoice.value : props.fakeResults[choiceId]}
                    style={{ maxWidth: '100%' }}
                    min={minValue}
                    max={maxValue}
                  />
                  <Button
                    onClick={() => changeValue(choiceId, minValue)}
                    type="link"
                    className="ps-0 text-align-l"
                    block
                  >
                    Clear
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
        )
      })}
    </div>
  )

  return (
    <>
      <Row>
        <Col span={24}>
          <div className="labelContainer">
            <Row className={`${styles.gridRow} ${styles.responseLabelRow}`} wrap={false}>
              <Col offset={8} />
              {labelRow}
            </Row>
          </div>
          {gridMarkingRow}
          {questionRows}
        </Col>
      </Row>
    </>
  )
}
