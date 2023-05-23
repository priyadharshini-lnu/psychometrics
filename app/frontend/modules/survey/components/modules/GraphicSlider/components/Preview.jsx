import _ from 'lodash'
import { Slider as Antslider } from 'antd'
import classNames from 'classnames'

import { SafeHTML } from '~/components/SafeHTML'

import styles from './GraphicSlider.less'
import connect from '../connect'

const SliderPreview = ({ model, readOnly, I18n }) => {
  const { origin } = location
  const { props, result } = model

  const value = (result.answers[0] && result.answers[0].value) || props.value
  const img = props.category === 'bars' ? `${props.modification}/${props.barType}.png` : `${props.modification}.png`
  const backgroundImage = `url(${origin}/graphics/questions/graphic_slider/${img})`

  const changeValue = (value) => {
    model.result.answer(_.round(value))
  }

  return (
    <div style={{ position: 'relative' }}>
      <div className={`${styles.mainrow}`}>
        <SafeHTML
          className={`${styles.questionText}`}
          html={I18n.tQuestion(model, 'questionText')}
          config="adminRichText"
        />
        <div className={`${styles.row} ${styles[props.sliderPosition]}`}>
          <div
            style={{ backgroundImage }}
            className={`${styles.graphic_slider} ${styles[`scale${props.min}-${value}`]}`}
          />
          <div className={classNames(styles[`${props.sliderPosition}-slider-container`])}>
            {props.enableLabels && (
              <span className={styles.lowLabel}>
                {props.sliderPosition === 'vertical'
                  ? I18n.tQuestion(model, 'labelHigh')
                  : I18n.tQuestion(model, 'labelLow')}
              </span>
            )}
            <Antslider
              value={value}
              disabled={readOnly}
              onChange={changeValue}
              min={props.min}
              max={props.max}
              vertical={props.sliderPosition === 'vertical'}
              className="mt-0 mb-0"
            />
            {props.enableLabels && (
              <span className={styles.highLabel}>
                {props.sliderPosition === 'vertical'
                  ? I18n.tQuestion(model, 'labelLow')
                  : I18n.tQuestion(model, 'labelHigh')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export const GraphicSliderPreview = connect(SliderPreview)
