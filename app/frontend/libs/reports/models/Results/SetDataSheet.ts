import _ from 'lodash'
import RawResult from './interfaces/RawResult'

export default {
  run: (rawResults: RawResult[]): object => (_.last(rawResults) || {}).data_sheet,
}
