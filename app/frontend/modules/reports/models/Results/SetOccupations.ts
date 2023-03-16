import _ from 'lodash'
import { OccupationResult } from '~/modules/reports/models/Results/interfaces/RawResult'
import { RawResult } from './interfaces'

export default {
  run: (rawResults: RawResult[]): OccupationResult[] => _.reduce(
    rawResults,
    (result: OccupationResult[], data: RawResult) => ([
      ...result,
      ...data.occupations,
    ]),
    [],
  ),
}
