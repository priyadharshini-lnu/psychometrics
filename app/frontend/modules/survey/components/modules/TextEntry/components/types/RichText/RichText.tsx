import { FC } from 'react'

import { BuilderModel } from '~/modules/survey/interfaces/questions/TextEntry'
import Editor from './Editor'
import { characterAndWordLimit } from './characterAndWordLimit'

interface Props {
  model: BuilderModel
}

const RichText: FC<Props> = ({
  model,
  model: {
    props: {
      predefinedRichText,
    },
    validation,
  },
}) => {
  const changeProps = (value: string, key: string): void => model.changeProps({ [key]: value })

  return (
    <Editor
      content={predefinedRichText}
      handleContentChange={value => changeProps(value, 'predefinedRichText')}
      {...characterAndWordLimit(validation)}
    />
  )
}

export default RichText
