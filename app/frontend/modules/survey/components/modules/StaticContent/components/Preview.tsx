import { FC, useRef } from 'react'
import { connect, ConnectedProps } from 'react-redux'

import { getI18n } from '~/modules/survey/core/preview/FlowProcessor/selectors'

import { RootState } from '~/modules/survey/core/rootReducers'
import { I18nInterface, Question } from '~/modules/survey/core/preview/FlowProcessor/interfaces'

import Previews from './Previews'
import Text from './Text'

import styles from './StaticContent.less'

const mapStateToProps = (state: RootState) => ({
  I18n: getI18n(state.preview),
})

const connector = connect(mapStateToProps)

type PropsFromRedux = ConnectedProps<typeof connector>

interface OwnProps {
  model: Question
}

type Props = PropsFromRedux & OwnProps

const Preview: FC<Props> = ({ model, I18n }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={containerRef}>
      <TextRender model={model} I18n={I18n} />
      <TypeRender model={model} />
    </div>

  )
}

interface TextRenderProps {
  model: Question
  I18n: I18nInterface
}

const TextRender: FC<TextRenderProps> = ({
  model, I18n,
}): JSX.Element | null => {
  const { props: { type, graphicType }, isNeedToAddLtrManually } = model

  let className = styles.questionTextPreview || ''
  if (isNeedToAddLtrManually) {
    className += ` ${styles.ltr_direction}`
  }

  if (type === 'Text' || (type === 'Graphic' && ['WithText', 'UrlWithText'].includes(graphicType))) {
    return (
      <Text model={model} className={className} I18n={I18n} />
    )
  }

  return null
}

interface TypeRenderProps {
  model: Question
}

const TypeRender: FC<TypeRenderProps> = ({ model }): JSX.Element | null => {
  const { props: { type } } = model

  if (type === 'Text') {
    return null
  }

  const View = Previews[type]
  return <View model={model} key={type} />
}

const ConnectedPreview = connector(Preview)

export default ConnectedPreview
