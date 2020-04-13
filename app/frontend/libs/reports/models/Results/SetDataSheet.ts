import _ from 'lodash'
import RawResult from './interfaces/RawResult'

export default {
  run: (rawResults: RawResult[]): object => {
    const result = (_.last(rawResults) || {})
    return result.subject_datasheet || result.data_sheet
  }
}
