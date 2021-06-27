import { Factor } from 'modules/reports/core/interfaces/Factor'

export default interface Module {
  id: number

  type: string

  toJSON: () => {}

  getScoreType(): string

  getValueType(): string

  assessment_id: number

  props: {
    colors: { color: string },
    source: {
      valueType: string,
      factors: null | Factor[]
    }
  }
}
