import { FC, lazy, Suspense } from 'react'
import { Spin } from 'antd'

import useForceUpdate from '~/hooks/useUpdate'

import { BuilderModel } from '~/modules/survey/interfaces/questions/TextEntry'
import TextEditor from '~/modules/survey/components/TextEditor'

const SingleLineBuilder = lazy(
  () => import('~/modules/survey/components/modules/TextEntry/components/types/SingleLine'),
)
const MultiLineBuilder = lazy(
  () => import('~/modules/survey/components/modules/TextEntry/components/types/MultiLine'),
)
const FormBuilder = lazy(
  () => import('~/modules/survey/components/modules/TextEntry/components/types/Form/Builder'),
)
const DateEntryBuilder = lazy(
  () => import('~/modules/survey/components/modules/TextEntry/components/types/DateEntry'),
)
const DateTimeEntryBuilder = lazy(
  () => import('~/modules/survey/components/modules/TextEntry/components/types/DateTimeEntry'),
)
const TimeEntryBuilder = lazy(
  () => import('~/modules/survey/components/modules/TextEntry/components/types/TimeEntry'),
)
const ChatBuilder = lazy(
  () => import('~/modules/survey/components/modules/TextEntry/components/types/Chat/Builder'),
)
const EmailBuilder = lazy(
  () => import('~/modules/survey/components/modules/TextEntry/components/types/Email/Builder'),
)
const RichTextBuilder = lazy(
  () => import('~/modules/survey/components/modules/TextEntry/components/types/RichText/RichText'),
)

interface Props {
  model: BuilderModel
}

const TextEntry: FC<Props> = ({ model }) => {
  const forceUpdate = useForceUpdate()

  const handleOnTextChange = (value: string) => {
    model.changeProps({ questionText: value })
    forceUpdate()
  }

  const {
    props: { type, questionText, dateFormat },
  } = model

  return (
    <section>
      <div className="mt-4">
        <TextEditor
          value={questionText}
          onChange={handleOnTextChange}
        />
      </div>
      <Suspense fallback={<Spin />}>
        {(type === 'SingleLine' || type === 'Password') && (
          <SingleLineBuilder model={model} />
        )}
        {(type === 'MultiLine' || type === 'EssayTextBox') && (
          <MultiLineBuilder model={model} />
        )}
        {type === 'Form' && <FormBuilder model={model} />}
        {type === 'DateEntry' && (
          <DateEntryBuilder format={dateFormat} />
        )}
        {type === 'DateTimeEntry' && <DateTimeEntryBuilder />}
        {type === 'TimeEntry' && <TimeEntryBuilder />}
        {type === 'Chat' && <ChatBuilder model={model} />}
        {type === 'Email' && <EmailBuilder model={model} />}
        {type === 'RichText' && <RichTextBuilder model={model} />}
      </Suspense>
    </section>
  )
}

export default TextEntry
