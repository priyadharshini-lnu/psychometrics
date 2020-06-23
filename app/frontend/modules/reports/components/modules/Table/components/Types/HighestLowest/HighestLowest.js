import React from 'react'
import QuestionHighestLowest from './QuestionHighestLowest'
import FactorHighestLowest from './FactorHighestLowest'


const HighestLowest = (props) => {
  const { module } = props
  if (module.props.sourceType === 'Question') {
    return <QuestionHighestLowest {...props} />
  }
  return <FactorHighestLowest {...props} />
}

export default HighestLowest
