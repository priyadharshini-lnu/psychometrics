import { RgbaColor } from 'react-colorful'
import { Factor } from '~/modules/reports/core/interfaces/Factor'

export default interface Module {
  id: number
  type: string
  name: string
  removed: boolean
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
      type: string
    }
    sourceType: 'Factor' | 'Question' | 'ConditionalText' | 'ConditionalFactorOccupationText' |
      'PipedText' | 'ResultText'
    mainHeaderColor: RgbaColor | string
    secondHeaderColor: RgbaColor | string
    scoreBackgroundColor: RgbaColor | string
    showLabels: boolean
    showValues: boolean
    showLines: boolean
    showAsBarChart: boolean
    text?: string
    type?: string
    url?: string
    position: {width: number, height: number}
    style: any // eslint-disable-line @typescript-eslint/no-explicit-any
  }
  meta: {
    hidden?: boolean
    locked?: boolean
  }
  update: () => void
  getTextByCondition: () => void
}
