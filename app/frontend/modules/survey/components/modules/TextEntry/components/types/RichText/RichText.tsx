import { FC } from 'react'

import { BuilderModel } from '~/modules/survey/interfaces/questions/TextEntry'
import Editor from './Editor'

interface Props {
  model: BuilderModel
}

const RichText: FC<Props> = ({
  model,
  model: {
    props: {
      predefinedRichText,
      maxLength,
    },
  },
}) => {
  const changeProps = (value: string, key: string): void => model.changeProps({ [key]: value })

  return (
    <Editor
      content={predefinedRichText}
      handleContentChange={value => changeProps(value, 'predefinedRichText')}
      maxCharLimit={maxLength}
    />
  )
}

export default RichText
