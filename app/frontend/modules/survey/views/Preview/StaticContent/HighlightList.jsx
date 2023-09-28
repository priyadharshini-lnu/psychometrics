import { useEffect, useState, useRef } from 'react'
import Highlighter from 'web-highlighter'
import Palette from './Palette'
import styles from './StaticContent.less'

const DEFAULT_COLOR = '#c1c4fc'

const HighlightList = ({
  highlight, contentRef, selection, updateHighlight,
}) => {
  const [currentHighlightId, setCurrentHighlightId] = useState(null)
  const highlighter = useRef(new Highlighter({ style: { className: styles.highlightWrap } }))

  useEffect(() => {
    highlighter.current.setOption({ $root: contentRef.current })

    highlight.data.forEach((h) => {
      const source = highlighter.current.fromStore(h.startMeta, h.endMeta, h.text, h.id, h.color)
      initHighlight(source)
    })

    return () => {
      highlighter.current.dispose()
      window.getSelection().empty && window.getSelection().empty()
    }
  }, [])

  useEffect(() => {
    if (!selection) return

    if (!contentRef.current.contains(selection.startContainer)) selection.setStart(contentRef.current.firstChild, 0)
    if (!contentRef.current.contains(selection.endContainer)) selection.setEnd(contentRef.current.lastChild, 0)

    const source = highlighter.current.fromRange(selection)
    // on FF browser sometimes we face the issue when source is null.
    // More details about this bug: https://tte.atlassian.net/browse/LH-649
    if (source) {
      initHighlight(source)
      setCurrentHighlightId(source.id)

      updateHighlight(highlight, [...highlight.data, {
        ...source,
        color: DEFAULT_COLOR,
        notStored: true,
      }], { notStored: true })
    }
  }, [selection])

  const initHighlight = source => source && highlighter.current.getDoms(source.id).forEach((d) => {
    d.style.backgroundColor = getHighlightColor(source)
    d.onclick = handleHighlightClick
  })

  const handleHighlightClick = ({ target: { dataset: { highlightId } } }) => {
    setCurrentHighlightId(highlightId)
  }

  const getHighlightColor = (source) => {
    const { color } = highlight.data.find(h => h.id === source.id) || { color: DEFAULT_COLOR }
    return color
  }

  const removeHighlight = (sourceId) => {
    highlighter.current.remove(sourceId)
    setCurrentHighlightId(null)
    const filteredHighlight = highlight.data.filter(h => h.id !== sourceId)
    updateHighlight(highlight, filteredHighlight)

    refreshColors(filteredHighlight)
  }

  const refreshColors = (highlights) => {
    highlights.forEach((h) => {
      highlighter.current.getDoms(h.id).forEach((d) => {
        d.style.backgroundColor = h.color
      })
    })
  }

  const updateHighlightColor = (color, sourceId) => {
    highlighter.current.getDoms(sourceId).forEach((d) => {
      d.style.backgroundColor = color
    })

    const updatedHighlight = highlight.data.map(h => (h.id === sourceId ? { ...h, color, notStored: false } : h))
    updateHighlight(highlight, updatedHighlight)
  }

  const currentHighlight = highlight.data.find(h => h.id === currentHighlightId)
  return (
    <>
      {currentHighlight && (
        <Palette
          currentHighlight={currentHighlight}
          highlighter={highlighter.current}
          removeHighlight={removeHighlight}
          updateHighlightColor={updateHighlightColor}
          contentRef={contentRef}
          setCurrentHighlightId={setCurrentHighlightId}
        />
      )}
    </>
  )
}

export default HighlightList
