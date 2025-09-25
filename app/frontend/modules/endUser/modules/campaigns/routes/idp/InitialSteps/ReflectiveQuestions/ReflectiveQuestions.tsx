import { FC } from 'react'
import { ReflectiveQuestions } from '../../ReflectiveQuestions'

interface Props {
  next: () => void
  prev: () => void
}

export const ReflectiveQuestionsStep: FC<Props> = ({ next, prev }) => (
  <ReflectiveQuestions onSave={next} showSkip onSkip={next} prev={prev} />
)
