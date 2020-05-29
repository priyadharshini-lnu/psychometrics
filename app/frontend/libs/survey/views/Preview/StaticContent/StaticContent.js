/* eslint-disable react/no-danger */
import React, { useRef, useState } from 'react'
import cs from 'classnames'
import {
  FIXED_TOP, LEFT, RIGHT, NORMAL_TOP,
} from 'views/Block/components/StaticContent/settings'
import GetBackgroundStyles from 'views/Block/components/StaticContent/getBackgroundStyles'
import styles from './StaticContent.scss'
import HighlightList from './HighlightList'

const StaticContent = ({
  block, block: { props: { staticContent } }, preview, highlight, updateHighlight,
  I18n, containerRef,
}) => {
  const contentRef = useRef(null)

  const [selection, setSelection] = useState(null)

  const handleMouseUp = () => {
    const selection = window.getSelection()
    if (selection.toString()) setSelection(selection.getRangeAt(0))
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
    >
      <div
        className={styles.box}
        style={GetBackgroundStyles.run(staticContent)}
      >
        <HighlightList
          highlight={highlight}
          contentRef={contentRef}
          selection={selection}
          updateHighlight={updateHighlight}
          preview={preview}
          staticContent={staticContent}
        />
        <div
          onMouseUp={handleMouseUp}
          ref={contentRef}
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: innerHTML }}
        />
      </div>
    </div>
  )
}

export default StaticContent
