import _ from 'lodash'
import { MediaResponse } from '~/modules/survey/core/preview/FlowProcessor/interfaces'
import { RawResult } from './interfaces'

export default {
  run: (rawResults: RawResult[]): MediaResponse[] => _.reduce(
    rawResults,
    (result: MediaResponse[], data: RawResult) => ([
      ...result,
      ...data.media_responses,
    ]),
    [],
  ),
}
