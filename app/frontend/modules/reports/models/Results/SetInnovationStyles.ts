import _ from 'lodash'
import { InnovationStyleResult } from '~/modules/reports/models/Results/interfaces/RawResult'
import { RawResult } from './interfaces'

export default {
  run: (rawResults: RawResult[]): InnovationStyleResult[] => _.reduce(
    rawResults,
    (result: InnovationStyleResult[], data: RawResult) => ([
      ...result,
      ...data.innovation_styles,
    ]),
    [],
  ),
}
