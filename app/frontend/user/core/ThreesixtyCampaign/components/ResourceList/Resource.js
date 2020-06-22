/* eslint-disable react/no-danger */
import React, { useRef, useState } from 'react'
import './styles.scss'
import HighlightList from 'libs/survey/views/Preview/StaticContent/HighlightList'
import withCopyProtection from 'components/hocs/withCopyProtection'
import connect from './connect'

function Resource ({
  resource, highlight, updateHighlight, translations, containerRef,
}) {
  const contentRef = useRef(null)
  const [selection, setSelection] = useState(null)

  const handleMouseUp = () => {
    const selection = window.getSelection()
    if (selection && selection.toString()) {
      setSelection(selection.getRangeAt(0))
    }
  }

  return (
    <div ref={containerRef} className="resource-content">
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
        dangerouslySetInnerHTML={{
          __html: _.get(translations, [resource.id, 'questionText']) || resource.props.questionText,
        }}
      />
    </div>
  )
}

export default withCopyProtection(connect(Resource))
