import { Factor } from 'modules/reports/core/interfaces/Factor'
import { RGBColor } from 'react-color'

export default interface Module {
  id: number
  type: string
  toJSON: () => {}
  getScoreType(): string
  getValueType(): string
  assessment_id: number
  props: {
    questionId: number
    questionChoiceIds: Array<number>
    questionsChoices: Array<{ questionId: number; choiceIds: Array<number> }>
    colors: { color: string }
    source: {
      valueType: string
      factors: null | Factor[]
    }
    sourceType: 'Factor' | 'Question'
    mainHeaderColor: RGBColor | string
    secondHeaderColor: RGBColor | string
    showLabels: boolean
    showValues: boolean
    showLines: boolean
  }
  update: () => void
}
