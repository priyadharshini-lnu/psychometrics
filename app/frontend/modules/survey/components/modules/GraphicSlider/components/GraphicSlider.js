/* eslint-disable no-underscore-dangle */
import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import TextEditor from 'components/TextEditor'
import ReactSlider from 'react-slider'
import classNames from 'classnames'
import styles from './GraphicSlider.scss'

export class GraphicSlider extends Component {
  origin = location.origin

  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  constructor (props) {
    super(props)
    this.state = {
      value: props.model.props.value,
    }
  }

  componentDidUpdate () {
    // We have ugly lib 'react-slider' and have problems when we dynamicly change height/width of the slider
    this.sliderRef && this.sliderRef._resize()
  }

  changeText = (value) => {
    const { model } = this.props
    model.changeProps({ questionText: value })
    this.forceUpdate()
  }

  changeValue = (value) => {
    this.setState({ value: _.round(value) })
    this.forceUpdate()
  }

  render () {
    const { model, model: { props } } = this.props
    const img = props.category === 'bars' ? `${props.modification}/${props.barType}.png` : `${props.modification}.png`
    const backgroundImage = `url(${this.origin}/graphics/questions/graphic_slider/${img})`
    const sliderMarginDirection = props.sliderPosition === 'vertical' ? 'marginLeft' : ''
    const { value } = this.state

    return (
      <div style={{ position: 'relative' }}>
        <div className={`${styles.mainrow} ${styles[props.textPosition]}`}>
          <div className={`${styles.questionText} ${styles.column}`}>
            <TextEditor model={model} value={props.questionText} onChange={this.changeText} />
          </div>
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
                    {props.sliderPosition === 'vertical' ? props.labelHigh : props.labelLow}
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
                    withTracks
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
                    {props.sliderPosition === 'vertical' ? props.labelLow : props.labelHigh}
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

export default GraphicSlider
