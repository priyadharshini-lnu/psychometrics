/* eslint-disable react/no-danger */
import React from 'react'
import cs from 'classnames'
import {
  REPEAT, NO_REPEAT, FIXED_TOP, LEFT, RIGHT,
} from 'views/Block/components/StaticContent/settings'
import I18nStore from 'store/I18nStore'
import styles from './StaticContent.scss'

const StaticContent = ({ staticContent, block }) => {
  const getStaticContentStyles = () => {
    const { backgroundImageOptions: options } = staticContent
    return {
      backgroundColor: staticContent.backgroundColor,
      backgroundImage: staticContent.backgroundImage && `url(${staticContent.backgroundImage})`,
      backgroundSize: options !== REPEAT && options,
      backgroundRepeat: options === REPEAT ? REPEAT : NO_REPEAT,
    }
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
      style={getStaticContentStyles()}
    >
      <div dangerouslySetInnerHTML={{ __html: innerHTML }} className={styles.content} />
    </div>
  )
}

export default StaticContent
