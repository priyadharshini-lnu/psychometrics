import React, { useRef, useState } from 'react'

import HighlightList from 'modules/survey/views/Preview/StaticContent/HighlightList'
import { useCopyProtection } from 'utils/hooks'

import connect from './connect'

import './styles.scss'

const Resource = ({
  resource, highlight, updateHighlight, translations,
}) => {
  const contentRef = useRef(null)
  const containerRef = useRef(null)
  const [selection, setSelection] = useState(null)

  useCopyProtection(containerRef)

  const handleMouseUp = () => {
    const selection = window.getSelection()
    if (selection && selection.toString()) {
      setSelection(selection.getRangeAt(0))
    }
  }

  return (
    <div ref={containerRef} className="resource-content highlight-container position-relative">
      <HighlightList
        highlight={highlight}
        contentRef={contentRef}
        selection={selection}
        updateHighlight={(highlight, data, opts) => updateHighlight(
          highlight, data, _.assign({}, opts, { assessmentId: resource.assessment_id }),
        )}
      />
      <div
        className="resource-content"
        onMouseUp={handleMouseUp}
        ref={contentRef}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: _.get(translations, [resource.id, 'questionText']) || resource.props.questionText,
        }}
      />
    </div>
  )
}

export default connect(Resource)
