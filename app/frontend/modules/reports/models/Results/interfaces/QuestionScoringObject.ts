export default interface QuestionScoringObject {
  [questionId: string]: Question[]
}

interface Question {
  index: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recode_value: any
}
