import { useEffect } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'
import { RootState } from '~/modules/survey/core/rootReducers'
import {
  getCurrentBlock,
} from '~/modules/survey/core/preview/FlowProcessor/selectors'
import { ParallaxBackground } from './ParallaxBackground'

const ParallaxWrapperComponent = ({
  initialized, block, end, blocks, ...props
}) => {
  useEffect(() => {
    if (!initialized || end) { return }

    if (!block?.props?.background?.enabled) {
      props.onLoaded()
    }

    if (initialized && props.loading) {
      const imagesToLoad: string[] = []
      _.map(blocks, (block) => {
        if (!block.props?.background?.enabled) { return }
        const { layers } = block.props.background
        layers?.map((layer: {image: string}) => layer.image && imagesToLoad.push(layer.image))
      })

      const promises = imagesToLoad.map(src => new Promise((resolve) => {
        const img = new Image()
        img.src = src
        img.onload = () => resolve(src)
        img.onerror = () => resolve(src)
      }))
      if (promises.length > 0) {
        Promise.all(promises).then(() => {
          props.onLoaded()
        })
      } else {
        props.onLoaded()
      }
    }
  }, [initialized, blocks])

  if (!initialized || end) { return null }

  if (!block?.props?.background) {
    return null
  }

  if (!block?.props?.background.enabled) {
    return null
  }

  return <ParallaxBackground {...props} />
}

export const ParallaxWrapper = connect(({ preview }: RootState) => {
  const {
    initialized, started, fixedTimed, instructions,
  } = preview

  const showInstructions = !started && (fixedTimed || instructions?.enabled)
  const loadBlock = initialized && !preview.end && !showInstructions

  return {
    initialized,
    block: loadBlock && getCurrentBlock(preview),
    blocks: initialized && preview.blocks,
    end: preview.end,
    showInstructions,
  }
})(ParallaxWrapperComponent)
