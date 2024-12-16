import _ from 'lodash'
import PropTypes from 'prop-types'
import { SafeHTML } from '~/components/SafeHTML'

const TextEntry = (props) => {
  const {
    isReal, result,
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
  if (isReal && !result) { return null }

  const text = _.get(result, [answerIndex, 'value'], '')
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
  } = props
  return _.get(result, [answerIndex, 'value'], '')
}

TextEntry.propTypes = {
  model: PropTypes.object.isRequired,
  result: PropTypes.any,
  isReal: PropTypes.bool,
}

export default TextEntry
