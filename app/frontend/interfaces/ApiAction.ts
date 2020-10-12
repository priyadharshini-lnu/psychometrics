import { AnyAction } from 'redux'
import * as t from 'io-ts'

export default interface ApiAction<T> extends AnyAction {
  request: {
    method?: string
    url: string
    loader?: boolean
    camelize?: boolean
    decamelize?: boolean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body?: any
    typedResponse?: t.Type<T>
  }
}
