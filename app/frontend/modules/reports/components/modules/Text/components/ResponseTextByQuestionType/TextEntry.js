import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'

const TextEntry = (props) => {
  const {
    isReal, result,
    model: {
      props: {
        answerIndex = 0,
      },
    },
  } = props
  if (isReal && !result) { return null }

  return <div>{_.get(result, [answerIndex, 'value']) || 'Default answer'}</div>
}

TextEntry.propTypes = {
  model: PropTypes.object.isRequired,
  result: PropTypes.any,
  isReal: PropTypes.bool,
}

export default TextEntry
