import RawResult from './interfaces/RawResult'

export default {
  run: (rawResults: RawResult[]): object[] => rawResults.map(r => r.subject_datasheet || r.data_sheet),
}
