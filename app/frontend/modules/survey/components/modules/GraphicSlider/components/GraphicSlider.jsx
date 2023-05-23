import _ from 'lodash'
import { useState } from 'react'
import { Slider as AntSlider } from 'antd'
import classNames from 'classnames'

import TextEditor from '~/modules/survey/components/TextEditor'

import styles from './GraphicSlider.less'

export const GraphicSlider = ({ model }) => {
  const { origin } = location
  const { props } = model
  const { value: initialVlaue } = props
  const img = props.category === 'bars' ? `${props.modification}/${props.barType}.png` : `${props.modification}.png`
  const backgroundImage = `url(${origin}/graphics/questions/graphic_slider/${img})`

  const [sliderValue, setsliderValue] = useState(initialVlaue)

  const changeText = (value) => {
    model.changeProps({ questionText: value })
  }

  const changeValue = (value) => {
    setsliderValue(_.round(value))
  }

  return (
    <div style={{ position: 'relative' }}>
      <div className={`${styles.mainrow}`}>
        <div className={`${styles.questionText}`}>
          <TextEditor model={model} value={props.questionText} onChange={changeText} />
        </div>
        <div className={`${styles.row} ${styles[props.sliderPosition]}`}>
          <div
            style={{ backgroundImage }}
            className={`${styles.graphic_slider} ${styles[`scale${props.min}-${sliderValue}`]}`}
          />
          <div className={classNames(styles[`${props.sliderPosition}-slider-container`])}>
            {props.enableLabels && (
              <span className={styles.lowLabel}>
                {props.sliderPosition === 'vertical' ? props.labelHigh : props.labelLow}
              </span>
            )}
            <AntSlider
              value={sliderValue}
              onChange={changeValue}
              min={props.min}
              max={props.max}
              vertical={props.sliderPosition === 'vertical'}
              className="mt-0 mb-0"
            />
            {props.enableLabels && (
              <span className={styles.highLabel}>
                {props.sliderPosition === 'vertical' ? props.labelLow : props.labelHigh}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
