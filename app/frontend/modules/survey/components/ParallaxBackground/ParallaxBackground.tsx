import { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import styles from './ParallaxBackground.less'
import { RootState } from '~/modules/survey/core/rootReducers'
import {
  getCurrentPage,
  getCurrentBlock,
} from '~/modules/survey/core/preview/FlowProcessor/selectors'

const connecter = connect((state: RootState) => {
  const {
    preview,
    preview: { initialized },
  } = state
  return {
    page: initialized && getCurrentPage(preview),
    block: initialized && getCurrentBlock(preview),
    nextButtonPressed: preview.nextButtonPressed,
  }
}, {})


const ParallaxBackgroundComponent = (props) => {
  const {
    block, page, nextButtonPressed, loading,
  } = props

  const {
    mainColor, layers, baseOffset,
  } = block.props.background

  const [offset, setOffset] = useState(baseOffset || 2)

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
            backgroundPositionX: `${offset * (layer.speed / 2)}%`,
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
