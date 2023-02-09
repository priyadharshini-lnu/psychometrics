import _ from 'lodash'
import { useRef, useState, FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'

import HighlightList from '~/modules/survey/views/Preview/StaticContent/HighlightList'
import { useCopyProtection } from '~/modules/survey/hooks/useCopyProtection'
import { useImageZoom } from '~/modules/survey/hooks/useImageZoom'

import { getHighlightByType } from '~/modules/survey/core/preview/FlowProcessor/selectors'
import { updateHighlight } from '~/modules/survey/core/preview/FlowProcessor/actions'
import { SafeHTML } from '~/components/SafeHTML'
import styles from './ResourceList.less'

const connector = connect(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (state: any, props:Record<string, any>) => ({
    highlight: getHighlightByType(state, props.resource.id, 'Question'),
  }),
  {
    updateHighlight,
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>
type OwnProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resource: Record<string, any>,
  translations: Record<string, unknown>
}
type Props = PropsFromRedux & OwnProps

const ResourceComponent: FC<Props> = ({
  resource, highlight, updateHighlight, translations,
}) => {
  const contentRef = useRef(null)
  const containerRef = useRef(null)
  const [selection, setSelection] = useState<Range | null>(null)

  useCopyProtection(containerRef)
  useImageZoom(containerRef)

  const handleMouseUp = () => {
    const selection = window.getSelection()
    if (selection && selection.toString()) {
      setSelection(selection.getRangeAt(0))
    }
  }

  return (
    <div ref={containerRef} className={`${styles.resourceContent} highlight-container position-relative`}>
      <HighlightList
        highlight={highlight}
        contentRef={contentRef}
        selection={selection}
        updateHighlight={(highlight, data, opts) => updateHighlight(
          highlight, data, _.assign({}, opts, { assessmentId: resource.assessment_id }),
        )}
      />
      <SafeHTML
        className={styles.resourceContent}
        html={_.get(translations, [resource.id, 'questionText']) || resource.props.questionText}
        ref={contentRef}
        onMouseUp={handleMouseUp}
      />
    </div>
  )
}

export const Resource = connector(ResourceComponent)
