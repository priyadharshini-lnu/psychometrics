import { useEffect } from 'react'
import { connect } from 'react-redux'
import { RootState } from '~/modules/survey/core/rootReducers'
import {
  getCurrentBlock,
} from '~/modules/survey/core/preview/FlowProcessor/selectors'
import { ParallaxBackground } from './ParallaxBackground'

const ParallaxWrapperComponent = ({ initialized, block, ...props }) => {
  if (!initialized) { return null }

  useEffect(() => {
    if (!block?.props?.background?.enabled) {
      props.onLoaded()
    }
  }, [])

  if (!block?.props?.background) {
    return null
  }

  if (!block?.props?.background.enabled) {
    return null
  }

  return <ParallaxBackground {...props} />
}

export const ParallaxWrapper = connect((state: RootState) => {
  const {
    preview,
    preview: { initialized },
  } = state
  return {
    initialized,
    block: initialized && getCurrentBlock(preview),
    blcoks: preview.blocks,
  }
})(ParallaxWrapperComponent)
