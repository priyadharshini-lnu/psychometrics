/* eslint-disable react/no-danger */
import React, { useRef, useState } from 'react'
import cs from 'classnames'
import { FIXED_TOP, LEFT, RIGHT } from 'views/Block/components/StaticContent/settings'
import GetBackgroundStyles from 'views/Block/components/StaticContent/getBackgroundStyles'
import I18nStore from 'store/I18nStore'
import styles from './StaticContent.scss'
import HighlightList from './HighlightList'

const StaticContent = ({
  block, block: { props: { staticContent } }, preview, highlights, updateMetaData,
}) => {
  const contentRef = useRef(null)

  const [selection, setSelection] = useState(null)

  const handleMouseUp = () => {
    const selection = window.getSelection()
    if (selection.toString()) setSelection(selection.getRangeAt(0))
  }

  const getStaticContentClasses = () => ({
    [styles.fixed]: staticContent.layout === FIXED_TOP,
    [styles.side]: staticContent.layout === LEFT || staticContent.layout === RIGHT,
    [styles.left]: staticContent.layout === LEFT,
    [styles.right]: staticContent.layout === RIGHT,
  })
  const innerHTML = I18nStore.tBlock(block, 'staticContent', ['staticContent', 'value'])

  return (
    <div
      className={cs(styles.container, getStaticContentClasses())}
      style={GetBackgroundStyles.run(staticContent)}
    >
      <HighlightList
        highlights={highlights}
        contentRef={contentRef}
        selection={selection}
        updateMetaData={updateMetaData}
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
  )
}

export default StaticContent
