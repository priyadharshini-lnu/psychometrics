import { FC } from 'react'
import { ReflectiveQuestions } from '../../ReflectiveQuestions'

interface Props {
  next: () => void
}

export const ReflectiveQuestionsStep: FC<Props> = ({ next }) => (
  <div className="mt-6">
    <ReflectiveQuestions onSave={next} showSkip onSkip={next} />
  </div>
)
