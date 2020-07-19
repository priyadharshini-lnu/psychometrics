import _ from 'lodash'
import { RawResult, UsersScoring } from './interfaces'

export default {
  run: (rawResults: RawResult[]): UsersScoring => _.reduce(
    rawResults,
    (result: UsersScoring, data: RawResult) => ({
      ...result,
      [data.user_id]: {
        firstName: data.user.first_name,
        lastName: data.user.last_name,
        email: data.user.email,
      },
    }),
    {},
  ),
}
