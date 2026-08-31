import { RgbaColor } from 'react-colorful'
import { Factor } from '~/modules/reports/core/interfaces/Factor'
import { TableColumn } from '~/modules/reports/core/interfaces/TableColumn'

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
      'PipedText' | 'ResultText' | 'ResponseText' | 'AIContent' | 'AIRationaleEvidence' | 'AITranscript'
    mainHeaderColor: RgbaColor | string
    secondHeaderColor: RgbaColor | string
    scoreBackgroundColor: RgbaColor | string
    borderColor: string
    showLabels: boolean
    showValues: boolean
    showLines: boolean
    showAsBarChart: boolean
    hideHeader: boolean
    hideLegend: boolean
    precision?: number
    text?: string
    type?: string
    url?: string
    position: {width: number, height: number, top: number, left: number}
    style: any // eslint-disable-line @typescript-eslint/no-explicit-any
    question?: number
    hideRationale?: boolean
    hideEvidence?: boolean
    selectedFactors?: number[]
    tableColumns?: TableColumn
    pagination?: {
      enabled: boolean,
      position: {width: number, height: number, top: number, left: number}
    }
    enhanceWithAIEnabled?: boolean
  }
  meta: {
    hidden?: boolean
    locked?: boolean
  }
  update: () => void
  getTextByCondition: () => void
}
