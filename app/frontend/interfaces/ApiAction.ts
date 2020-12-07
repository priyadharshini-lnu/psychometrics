import { AnyAction } from 'redux'
import * as t from 'io-ts'

export interface Request<T> {
  method?: string
  url: string
  loader?: boolean
  camelize?: boolean
  decamelize?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any
  typedResponse?: t.Type<T>
}
export default interface ApiAction<T> extends AnyAction {
  request: Request<T>
}
