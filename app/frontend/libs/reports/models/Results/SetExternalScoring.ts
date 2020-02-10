/* eslint-disable @typescript-eslint/no-explicit-any */
import _ from 'lodash'
import RawResult from './interfaces/RawResult'

export default {
  run: (rawResults: RawResult[]): any => (_.last(rawResults) || {}).external_scoring,
}
