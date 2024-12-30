import _ from 'lodash'
import PropTypes from 'prop-types'
import { SafeHTML } from '~/components/SafeHTML'

const TextEntry = (props) => {
  const {
    isReal, result,
    question: {
      props: {
        type,
      },
    },
  } = props
  if (isReal && !result) { return null }

  const text = TextEntryResult(props)
  if (type === 'RichText') {
    return (
      <SafeHTML
        html={text}
        config="richTextQuestion"
      />
    )
  }
  return <div>{text}</div>
}

export const TextEntryResult = (props) => {
  const {
    result,
    model: {
      props: {
        answerIndex = 0,
      },
    },
    question: {
      props: {
        type,
      },
    },
  } = props
  if (type === 'Email') {
    return _.get(result, ['message'], '')
  }
  return _.get(result, [answerIndex, 'value'], '')
}

TextEntry.propTypes = {
  result: PropTypes.any,
  isReal: PropTypes.bool,
}

export default TextEntry
