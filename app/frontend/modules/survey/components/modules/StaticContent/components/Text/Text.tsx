import React, { useRef, useState } from 'react'
import HighlightList from 'modules/survey/views/Preview/StaticContent/HighlightList'
import { Highlight } from 'modules/survey/core/preview/FlowProcessor/interfaces'

interface Props {
  model: object
  style: string
  highlight: Highlight
  updateHighlight: (highlight: Highlight, data: object) => void
  I18n: {
    tQuestion: (object, string) => string
  }
}

const Text: React.FC<Props> = ({
  model, style, I18n, highlight, updateHighlight,
}) => {
  const contentRef = useRef(null)

  const [selection, setSelection] = useState<Range | null>(null)

  const handleMouseUp = () => {
    const selection = window.getSelection()
    if (selection && selection.toString()) {
      setSelection(selection.getRangeAt(0))
    }
  }

  return (
    <>
      <HighlightList
        highlight={highlight}
        contentRef={contentRef}
        selection={selection}
        updateHighlight={updateHighlight}
      />
      <div
        onMouseUp={handleMouseUp}
        className={style}
        ref={contentRef}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: I18n.tQuestion(model, 'questionText') }}
      />
    </>
  )
}

export default Text
