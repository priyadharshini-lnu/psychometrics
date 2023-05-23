import { useEffect, useRef } from 'react'
import { HIGHLIGHT_COLORS } from '~/modules/survey/views/Block/components/StaticContent/settings'
import styles from './StaticContent.less'

const LEFT_SHIFT = 20
const TOP_SHIFT = 45
const MAX_WIDTH = 180

const { $ } = window

const Palette = ({
  removeHighlight,
  updateHighlightColor,
  currentHighlight,
  highlighter,
  contentRef,
  setCurrentHighlightId,
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
      if (currentHighlight.notStored) {
        removeHighlight(currentHighlight.id)
      } else {
        setCurrentHighlightId(null)
      }
    }
  }

  const handleDelete = () => removeHighlight(currentHighlight.id)

  const changeCurrentColor = (color) => {
    updateHighlightColor(color, currentHighlight.id)
  }

  const getPosition = () => {
    const [dom] = highlighter.getDoms(currentHighlight.id)
    const containerOffset = $(dom).parents('.highlight-container').offset()
    const domOffset = $(dom).offset()
    let left = domOffset.left - containerOffset.left - LEFT_SHIFT


    if (contentRef.current.clientWidth - MAX_WIDTH < left) {
      left = contentRef.current.clientWidth - MAX_WIDTH
    }

    const top = domOffset.top - containerOffset.top - contentRef.current.scrollTop - TOP_SHIFT
    return { left: `${left < 0 ? 0 : left}px`, top: `${Math.max(0, top)}px` }
  }

  return (
    <div
      className={styles.paletteTip}
      style={getPosition()}
      ref={paletteRef}
    >
      {HIGHLIGHT_COLORS.map((color, i) => (
        <Color key={i} color={color} currentHighlight={currentHighlight} changeCurrentColor={changeCurrentColor} />
      ))}
      {!currentHighlight.notStored && <div className={styles.paletteRemove} onClick={handleDelete}>Delete</div>}
    </div>
  )
}

const Color = ({
  color, currentHighlight, changeCurrentColor,
}) => (
  <div
    className={styles.paletteColor}
    style={{ backgroundColor: color }}
    onClick={() => changeCurrentColor(color)}
  >
    {currentHighlight.color === color && <div className={styles.currentColor} />}
  </div>
)

export default Palette
