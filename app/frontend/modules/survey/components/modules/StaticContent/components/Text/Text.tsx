import React, { useRef, useState } from 'react'

import HighlightList from '~/modules/survey/views/Preview/StaticContent/HighlightList'
import { Highlight, Question } from '~/modules/survey/core/preview/FlowProcessor/interfaces'
import { SafeHTML } from '~/components/SafeHTML'

interface Props {
  model: Question
  className: string
  highlight: Highlight
  updateHighlight: (highlight: Highlight, data: object) => void
  I18n: {
    tQuestion: (object, string) => string
  }
}

const Text: React.FC<Props> = ({
  model, className, I18n, highlight, updateHighlight,
}) => {
  const { allowContentCopy = false } = model.props
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
      {!allowContentCopy && (
        <HighlightList
          highlight={highlight}
          contentRef={contentRef}
          selection={selection}
          updateHighlight={updateHighlight}
        />
      )}
      <SafeHTML
        className={className}
        html={I18n.tQuestion(model, 'questionText')}
        ref={contentRef}
        onMouseUp={handleMouseUp}
        config="adminRichText"
      />
    </>
  )
}

export default Text
