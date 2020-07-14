import _ from 'lodash'
import RawResult from './interfaces/RawResult'

export default {
  run: (rawResults: RawResult[]) => {
    const result = _.last(rawResults)
    if (result) { return result.subject_datasheet || result.data_sheet }

    return {}
  },
}
