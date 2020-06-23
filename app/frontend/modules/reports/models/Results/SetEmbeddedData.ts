/* eslint-disable arrow-body-style */
import _ from 'lodash'
import { EmbeddedData, RawResult } from './interfaces'

export default {
  run: (rawResults: RawResult[]): EmbeddedData => _.reduce(
    rawResults,
    (result: EmbeddedData, data: RawResult) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return _.reduce(data.embedded_data, (result: EmbeddedData, embeddedDataResults: any, key: string) => {
        const embeddedData = result[key] || []
        return { ...result, [key]: [...embeddedData, { value: embeddedDataResults }] }
      }, result)
    },
    {},
  ),
}
