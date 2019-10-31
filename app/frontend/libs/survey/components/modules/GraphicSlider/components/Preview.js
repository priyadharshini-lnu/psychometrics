/* eslint-disable react/no-danger */
import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactSlider from 'react-slider'
import I18nStore from 'store/I18nStore'
import classNames from 'classnames'
import styles from './GraphicSlider.scss'

export class Preview extends Component {
  origin = __DEV__ ? 'http://localhost:3000' : location.origin

  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeValue = (value) => {
    const { model } = this.props
    model.result.answer(_.round(value))
    this.forceUpdate()
  }

  render () {
    const { model, model: { props, result }, readOnly } = this.props
    const value = (result.answers[0] && result.answers[0].value) || props.value
    const img = props.category === 'bars' ? `${props.modification}/${props.barType}.png` : `${props.modification}.png`
    const backgroundImage = `url(${this.origin}/graphics/questions/graphic_slider/${img})`
    const sliderMarginDirection = props.sliderPosition === 'vertical' ? 'marginLeft' : ''

    return (
      <div style={{ position: 'relative' }}>
        <div className={`${styles.mainrow} ${styles[props.textPosition]}`}>
          <div
            className={`${styles.questionText} ${styles.column}`}
            dangerouslySetInnerHTML={{ __html: I18nStore.tQuestion(model, 'questionText') }}
          />
          <div className={`${styles.questionSlider} ${styles.column}`}>
            <div className={`${styles.row} ${styles[props.sliderPosition]}`}>
              <div className={styles.column}>
                <div
                  style={{ backgroundImage }}
                  className={`${styles.graphic_slider} ${styles[`scale${props.min}-${value}`]}`}
                />
              </div>
              <div className={classNames(styles.column, styles[`${props.sliderPosition}-slider-1-container`])}>
                {props.enableLabels && (
                  <span className={styles.label}>
                    {props.sliderPosition === 'vertical'
                      ? I18nStore.tQuestion(model, 'labelHigh')
                      : I18nStore.tQuestion(model, 'labelLow')}
                  </span>
                )}

                <div
                  className={styles[`${props.sliderPosition}-slider-2-container`]}
                  style={{ [sliderMarginDirection]: `${props.sliderMargin || 0}px`, flex: 1, display: 'flex' }}
                >
                  <ReactSlider
                    ref={(e) => { this.sliderRef = e }}
                    defaultValue={props.value}
                    value={value}
                    disabled={readOnly}
                    withBars
                    className={`${styles.slider} ${styles[`${props.sliderPosition}-slider`]}`}
                    barClassName={styles.bar}
                    handleClassName={styles.handler}
                    onChange={this.changeValue}
                    orientation={props.sliderPosition}
                    min={props.min}
                    max={props.max}
                    invert={props.sliderPosition === 'vertical'}
                  />
                </div>
                {props.enableLabels && (
                  <span className={styles.label}>
                    {props.sliderPosition === 'vertical'
                      ? I18nStore.tQuestion(model, 'labelLow')
                      : I18nStore.tQuestion(model, 'labelHigh')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Preview
