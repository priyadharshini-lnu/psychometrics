import { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'
import styles from './ParallaxBackground.less'
import { RootState } from '~/modules/survey/core/rootReducers'
import {
  getCurrentPage,
  getCurrentBlock,
  pageQuestionsWithoutHidden,
  pageErrors,
  getProgress,
} from '~/modules/survey/core/preview/FlowProcessor/selectors'

const connecter = connect((state: RootState) => {
  const {
    preview,
    preview: { initialized },
  } = state
  return {
    page: initialized && getCurrentPage(preview),
    questions: initialized && pageQuestionsWithoutHidden(preview),
    block: initialized && getCurrentBlock(preview),
    errors: initialized && pageErrors(preview),
    progress: initialized && getProgress(preview),
    backButtonPressed: preview.backButtonPressed,
    nextButtonPressed: preview.nextButtonPressed,
    blocks: preview.blocks,
  }
}, {})


const ParallaxBackgroundComponent = (props) => {
  const {
    block, page, nextButtonPressed, blocks, onLoaded, loading,
  } = props

  const {
    mainColor, layers, baseOffset,
  } = block.props.background

  const [offset, setOffset] = useState(baseOffset || 2)

  useEffect(() => {
    const imagesToLoad: string[] = []
    _.map(blocks, (block) => {
      if (!block.props?.background?.enabled) { return }
      const { layers } = block.props.background
      layers?.map((layer: {image: string}) => layer.image && imagesToLoad.push(layer.image))
    })

    const promises = imagesToLoad.map(src => new Promise((resolve, reject) => {
      const img = new Image()
      img.src = src
      img.onload = () => resolve(src)
      img.onerror = () => reject()
    }))
    Promise.all(promises).then(() => {
      onLoaded()
    })
  }, [])

  useEffect(() => {
    if (baseOffset) {
      setOffset(nextButtonPressed ? offset - baseOffset : offset + baseOffset)
    }
  }, [page.questions])

  if (loading) { return null }

  return (
    <div className={styles.main}>
      {layers?.length ? layers.map(layer => (
        <div
          key={layer.id}
          className={styles.background}
          style={{
            backgroundColor: layer.image ? 'transparent' : layer.color,
            backgroundImage: `url(${layer.image})`,
            backgroundPositionX: `${offset * layer.speed}%`,
          }}
        />
      )) : (
        <div
          className={styles.background}
          style={{
            backgroundColor: mainColor,
          }}
        />
      )}
    </div>
  )
}

export const ParallaxBackground = connecter(ParallaxBackgroundComponent)
