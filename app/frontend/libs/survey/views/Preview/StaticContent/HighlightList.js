import React, { useEffect, useState } from 'react'
import Highlighter from 'web-highlighter'
import Palette from './Palette'
import styles from './StaticContent.scss'

const DEFAULT_COLOR = '#c1c4fc'

const highlighter = new Highlighter({ style: { className: styles.highlightWrap } })

const HighlightList = ({
  highlights, contentRef, selection, updateMetaData, updateMetaDataLocally, preview,
}) => {
  const [currentHighlightId, setCurrentHighlightId] = useState(null)

  useEffect(() => {
    highlighter.setOption({ $root: contentRef.current })

    highlights.forEach((h) => {
      const source = highlighter.fromStore(h.startMeta, h.endMeta, h.text, h.id, h.color)
      initHighlight(source)
    })

    return () => {
      highlighter.dispose()
      window.getSelection().empty()
    }
  }, [])

  useEffect(() => {
    if (!selection) return

    if (!contentRef.current.contains(selection.startContainer)) selection.setStart(contentRef.current.firstChild, 0)
    if (!contentRef.current.contains(selection.endContainer)) selection.setEnd(contentRef.current.lastChild, 0)

    const source = highlighter.fromRange(selection)
    initHighlight(source)
    setCurrentHighlightId(source.id)
    updateMetaDataLocally(preview, 'highlights', [...highlights, { ...source, color: DEFAULT_COLOR, notStored: true }])
  }, [selection])

  const initHighlight = source => source && highlighter.getDoms(source.id).forEach((d) => {
    d.style.backgroundColor = getHighlightColor(source)
    d.onclick = handleHighlightClick
  })

  const handleHighlightClick = ({ target: { dataset: { highlightId } } }) => {
    setCurrentHighlightId(highlightId)
  }

  const getHighlightColor = (source) => {
    const { color } = highlights.find(h => h.id === source.id) || { color: DEFAULT_COLOR }
    return color
  }

  const removeHighlight = (sourceId) => {
    highlighter.remove(sourceId)
    setCurrentHighlightId(null)
    const filteredHighlight = highlights.filter(h => h.id !== sourceId)
    updateMetaData(preview, 'highlights', filteredHighlight)

    refreshColors(filteredHighlight)
  }

  const refreshColors = (highlights) => {
    highlights.forEach((h) => {
      highlighter.getDoms(h.id).forEach((d) => {
        d.style.backgroundColor = h.color
      })
    })
  }

  const updateHighlightColor = (color, sourceId) => {
    highlighter.getDoms(sourceId).forEach((d) => {
      d.style.backgroundColor = color
    })

    const updatedHighlight = highlights.map(h => (h.id === sourceId ? { ...h, color, notStored: false } : h))
    updateMetaData(preview, 'highlights', updatedHighlight)
  }

  return (
    <>
      {currentHighlightId && (
        <Palette
          currentHighlight={highlights.find(h => h.id === currentHighlightId)}
          highlighter={highlighter}
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
