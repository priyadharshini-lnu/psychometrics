import QuestionCondition from '~/libs/conditions'

const Question = ({ questions, condition }) => (
  <QuestionCondition
    preview
    questions={questions}
    condition={condition}
  />
)

export default Question
