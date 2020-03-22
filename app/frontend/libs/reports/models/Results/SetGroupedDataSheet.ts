import RawResult from './interfaces/RawResult'

export default {
  run: (rawResults: RawResult[]): object[] => rawResults.map(r => r.data_sheet),
}
