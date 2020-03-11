import React, { useEffect, useRef } from 'react'
import { HIGHLIGHT_COLORS } from 'views/Block/components/StaticContent/settings'
import styles from './StaticContent.scss'

const LEFT_SHIFT = 20
const TOP_SHIFT = 45

const Palette = ({
  currentColor,
  removeHighlight,
  updateHighlightColor,
  currentHighlight,
  highlighter,
  contentRef,
  setCurrentHighlight,
}) => {
  const paletteRef = useRef(null)

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  })

  const handleClickOutside = ({ target }) => {
    if (paletteRef.current && !paletteRef.current.contains(target)) {
      setCurrentHighlight(null)
    }
  }

  const handleDelete = () => removeHighlight(currentHighlight)

  const changeCurrentColor = (color) => {
    updateHighlightColor(color, currentHighlight)
  }

  const getPosition = () => {
    const [dom] = highlighter.getDoms(currentHighlight)
    const left = dom.offsetLeft - LEFT_SHIFT
    const top = dom.offsetTop - contentRef.current.scrollTop - TOP_SHIFT
    return { left: `${left}px`, top: `${Math.max(0, top)}px` }
  }
  return (
    <div
      className={styles.paletteTip}
      style={getPosition()}
      ref={paletteRef}
    >
      {HIGHLIGHT_COLORS.map((color, i) => (
        <Color key={i} color={color} currentColor={currentColor} changeCurrentColor={changeCurrentColor} />
      ))}
      <div className={styles.paletteRemove} onClick={handleDelete}>Delete</div>
    </div>
  )
}

const Color = ({ color, currentColor, changeCurrentColor }) => (
  <div
    className={styles.paletteColor}
    style={{ backgroundColor: color }}
    onClick={() => changeCurrentColor(color)}
  >
    {currentColor === color && <div className={styles.currentColor} />}
  </div>
)

export default Palette
