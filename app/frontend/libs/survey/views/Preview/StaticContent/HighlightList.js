import React, { useEffect, useState } from 'react'
import Highlighter from 'web-highlighter'
import { HIGHLIGHT_COLORS } from 'views/Block/components/StaticContent/settings'
import Palette from './Palette'
import styles from './StaticContent.scss'

const highlighter = new Highlighter({ style: { className: styles.highlightWrap } })

const HighlightList = ({
  highlights, contentRef, selection, updateMetaData, preview,
}) => {
  const [currentColor, setCurrentColor] = useState(HIGHLIGHT_COLORS[0])
  const [currentHighlight, setCurrentHighlight] = useState(null)

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
  }, [highlights])

  useEffect(() => {
    if (!selection) return

    if (!contentRef.current.contains(selection.startContainer)) selection.setStart(contentRef.current.firstChild, 0)
    if (!contentRef.current.contains(selection.endContainer)) selection.setEnd(contentRef.current.lastChild, 0)

    const source = highlighter.fromRange(selection)
    initHighlight(source)
    setCurrentHighlight(source.id)
    saveHighlight({ ...source, color: currentColor })
  }, [selection])

  const initHighlight = source => highlighter.getDoms(source.id).forEach((d) => {
    d.style.backgroundColor = getHighlightColor(source)
    d.onclick = handleHighlightClick
  })

  const handleHighlightClick = ({ target: { dataset: { highlightId } } }) => {
    setCurrentHighlight(highlightId)
    setCurrentColor(highlights.find(h => h.id === highlightId).color)
  }

  const getHighlightColor = (source) => {
    const { color } = highlights.find(h => h.id === source.id) || { color: currentColor }
    return color
  }

  const saveHighlight = (source) => {
    updateMetaData(preview, 'highlights', [...highlights, source])
  }

  const removeHighlight = (sourceId) => {
    highlighter.remove(sourceId)
    setCurrentHighlight(null)
    const filteredHighlight = highlights.filter(h => h.id !== sourceId)
    updateMetaData(preview, 'highlights', filteredHighlight)
  }

  const updateHighlightColor = (color, sourceId) => {
    highlighter.getDoms(sourceId).forEach((d) => {
      d.style.backgroundColor = color
    })

    const updatedHighlight = highlights.map(h => (h.id === sourceId ? { ...h, color } : h))
    setCurrentColor(color)
    updateMetaData(preview, 'highlights', updatedHighlight)
  }

  return (
    <>
      {currentHighlight && (
        <Palette
          currentHighlight={currentHighlight}
          highlighter={highlighter}
          currentColor={currentColor}
          removeHighlight={removeHighlight}
          updateHighlightColor={updateHighlightColor}
          contentRef={contentRef}
          setCurrentHighlight={setCurrentHighlight}
        />
      )}
    </>
  )
}

export default HighlightList
