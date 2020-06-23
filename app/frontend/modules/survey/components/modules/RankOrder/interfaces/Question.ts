export default interface Question {
  props: QuestionProps
  changeProps: (value: object) => void
  moduleConfig: ModuleConfig
}

interface QuestionProps {
  showDescription: boolean
  descriptionList: string[]
}

interface ModuleConfig {
  defaultDescription: string
}
