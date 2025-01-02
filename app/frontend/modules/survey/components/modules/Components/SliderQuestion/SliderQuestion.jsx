import times from 'lodash/times'
import { useState, useRef, useEffect } from 'react'
import {
  Slider as AntSlider, InputNumber, Row, Col, Button,
  Checkbox,
} from 'antd'
import _ from 'lodash'

import Utils from '~/modules/survey/utils'
import LabelEditor from '~/modules/survey/components/LabelEditor'
import { scaleNumber } from '~/utils/number'

import styles from './Slider.less'

const antdSliderClassname = 'antd-slider-control'

const { I18n: I18nTextTranslations } = window

export const SliderQuestion = ({
  model, I18n, preview, changeLabel, changeValue, readOnly,
}) => {
  const {
    result, props, choicesIds, moduleConfig,
  } = model
  const {
    gridLines, maxValue, minValue, numberOfDecimals, labels, choices, hideChoiceText, hideGridValues, hideValue,
    notApplicable, notApplicableLabel,
  } = props
  const labelWidth = `${100 / labels}%`
  const questionChoices = preview ? choicesIds : times(choices, i => i)
  const scaledValue = value => _.round(scaleNumber(value, 1, 100, minValue, maxValue), numberOfDecimals)
  const unscaledValue = value => scaleNumber(value, minValue, maxValue, 1, 100)
  const scaledAnswers = (result.answers || []).map(answer => ({ ...answer, value: unscaledValue(answer.value) }))
  const [values, setValue] = useState(scaledAnswers)
  const questionRowRef = useRef(null)

  useEffect(() => {
    if (questionRowRef.current && preview) {
      const sliderHandles = questionRowRef.current.querySelectorAll(`.${antdSliderClassname}`) || []
      _.each(sliderHandles, (sliderHandle, index) => {
        sliderHandle.setAttribute('aria-describedby', `label-instruction-${model.id}`)
        sliderHandle.setAttribute('aria-labelledby', `slider-label-${model.id}-${index}`)
      })
    }
  }, [])

  const onChangeSlider = (choiceId, value, update) => {
    setValue({ ...values, [choiceId]: { index: choiceId, value: update ? unscaledValue(scaledValue(value)) : value } })

    if (update) {
      changeValue(choiceId, scaledValue(value))
    }
  }

  const handleNotApplicable = (choiceId, value) => {
    if (!preview) { return }

    result.notApplicable = result.notApplicable || {}
    result.notApplicable[choiceId] = value

    setValue({ ...values })
  }

  const changeNotApplicableLabel = (value) => {
    model.changeProps({ notApplicableLabel: value })
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
            <span aria-hidden style={{ overflowWrap: 'break-word' }}>
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

  const renderNotApplicableHeader = () => {
    const { notApplicable } = model.props
    if (!notApplicable) { return null }
    return (
      <span>{I18n.tQuestion(model, 'notApplicableLabel')}</span>
    )
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
    <div ref={questionRowRef} className={styles.responseRowContainer}>
      {questionChoices.map((choiceId, index) => (
        <Row key={choiceId} className={`${styles.gridRow} ${styles.responseRow}`}>
          {!hideChoiceText && (
            <Col span={8}>
              {preview ? (
                <span id={`slider-label-${model.id}-${index}`}>
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
            {preview && (
              <span className="sr-only" id={`label-instruction-${model.id}`}>
                {I18nTextTranslations.t(
                  'frontend.aria.slider_label_instruction',
                  {
                    min: I18n.tQuestion(model, `labelsTexts${1}`, { label: 0 }) || moduleConfig.defaultLabelText(1),
                    max: I18n.tQuestion(model, `labelsTexts${labels}`, { label: labels ? labels - 1 : 0 }),
                  },
                )}
              </span>
            )}
            <Row>{labelRow}</Row>
          </Col>

          <Col span={hideChoiceText ? 24 : 16}>
            {notApplicable && (
              <Row justify="end">
                <Col className={styles.label}>
                  <Checkbox
                    checked={result.notApplicable?.[choiceId]}
                    defaultChecked={false}
                    onChange={e => handleNotApplicable(choiceId, e.target.checked)}
                  >
                    {preview ? renderNotApplicableHeader() : (
                      <LabelEditor
                        onChange={changeNotApplicableLabel}
                        maxWidth={150}
                        value={notApplicableLabel}
                      />
                    )}
                  </Checkbox>
                </Col>
              </Row>
            )}
            <Row className={styles.responseControlsRow}>
              <Col className={styles.sliderContainer} span={hideValue ? 24 : 21}>
                <AntSlider
                  classNames={{ handle: antdSliderClassname }}
                  onAfterChange={value => onChangeSlider(choiceId, value, true)}
                  onChange={(value) => {
                    onChangeSlider(choiceId, value)
                  }}
                  value={preview
                    ? (values[choiceId]?.value)
                    : props.fakeResults[choiceId]}
                  min={minValue}
                  max={maxValue}
                  className="ms-0 me-0"
                    // Widthout this extra span with key, the tooltip doesn't move properly
                  disabled={readOnly || result.notApplicable?.[choiceId] === true}
                  tooltip={{
                    formatter: hideValue ? null : value => <span key={value}>{scaledValue(value)}</span>,
                  }}
                  aria-describedby={`label-instruction-${model.id}`}
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
                    disabled={readOnly || result.notApplicable?.[choiceId] === true}
                    aria-labelledby={`slider-label-${model.id}-${index}`}
                  />
                  {!readOnly && (
                    <Button
                      id={`clear-value-${model.id}-${index}`}
                      disabled={readOnly || result.notApplicable?.[choiceId] === true}
                      onClick={() => onChangeSlider(choiceId, minValue, true)}
                      type="link"
                      className="text-align-c"
                      aria-labelledby={`slider-label-${model.id}-${index} clear-value-${model.id}-${index}`}
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
