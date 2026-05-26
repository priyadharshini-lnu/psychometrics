import { useRef, useState } from 'react'
import cs from 'classnames'

import {
  FIXED_TOP, LEFT, RIGHT, NORMAL_TOP,
} from '~/modules/survey/views/Block/components/StaticContent/settings'

import { useAudioPlayer } from '~/modules/survey/hooks/useAudioPlayer'
import { useImageZoom } from '~/modules/survey/hooks/useImageZoom'

import HighlightList from '~/modules/survey/views/Preview/StaticContent/HighlightList'
import GetBackgroundStyles from '~/modules/survey/views/Block/components/StaticContent/getBackgroundStyles'
import { SafeHTML } from '~/components/SafeHTML'

import styles from './StaticContent.less'

const StaticContent = ({
  block, block: { props: { staticContent } }, preview, highlight, updateHighlight, I18n,
}) => {
  const containerRef = useRef()
  const shouldEnableContentCopy = staticContent?.allowContentCopy ?? false
  useImageZoom(containerRef, { background: 'rgba(0,0,0,0.8)', margin: 48 })

  const [selection, setSelection] = useState(null)

  const contentRef = useRef(null)
  useAudioPlayer(contentRef)

  const handleMouseUp = () => {
    if (shouldEnableContentCopy === false) {
      const selection = window.getSelection()
      if (selection.toString()) {
        setSelection(selection.getRangeAt(0))
      }
    }
  }

  const getStaticContentClasses = () => ({
    [styles.normal]: staticContent.layout === NORMAL_TOP,
    [styles.fixed]: staticContent.layout === FIXED_TOP,
    [styles.side]: staticContent.layout === LEFT || staticContent.layout === RIGHT,
    [styles.left]: staticContent.layout === LEFT,
    [styles.right]: staticContent.layout === RIGHT,
  })
  const innerHTML = I18n.tBlock(block, 'staticContent', ['staticContent', 'value'])

  return (
    <div
      ref={containerRef}
      className={cs(styles.container, getStaticContentClasses())}
      data-allow-content-copy={shouldEnableContentCopy ? 1 : 0}
    >
      <div
        className={styles.box}
        style={GetBackgroundStyles.run(staticContent)}
      >
        {!shouldEnableContentCopy && (
          <HighlightList
            highlight={highlight}
            contentRef={contentRef}
            selection={selection}
            updateHighlight={updateHighlight}
            preview={preview}
            staticContent={staticContent}
          />
        )}
        <SafeHTML
          className={`${styles.content} highlight-container`}
          html={innerHTML}
          ref={contentRef}
          onMouseUp={handleMouseUp}
          config="adminRichText"
        />
      </div>
    </div>
  )
}

export default StaticContent
