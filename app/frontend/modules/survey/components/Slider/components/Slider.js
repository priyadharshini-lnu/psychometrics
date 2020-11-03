import React, {
  useRef, useCallback, useEffect, useState,
} from 'react'
import ReactSlider from 'react-slider'
import styles from './Slider.scss'

const Slider = ({
  minValue, maxValue, value, onChange,
}) => {
  const sliderRef = useRef(null)
  const [invert, setInvert] = useState(false)

  const handleChange = useCallback((percent) => {
    const value = minValue + percent * (maxValue - minValue) / 100
    onChange && onChange(value)
  }, [sliderRef])

  useEffect(() => {
    if (!sliderRef.current) return
    const isRTL = sliderRef.current.slider.closest('.rtl') !== null
    setInvert(isRTL)
  }, [sliderRef])

  const val = (value - minValue) * 100 / (maxValue - minValue)
  return (
    <ReactSlider
      ref={sliderRef}
      defaultValue={val}
      value={val}
      invert={invert}
      className={styles.sliderContainer}
      withTracks
      trackClassName={styles.bar}
      thumbClassName={styles.handler}
      onAfterChange={handleChange}
      step={0.001}
    />
  )
}


export default Slider
