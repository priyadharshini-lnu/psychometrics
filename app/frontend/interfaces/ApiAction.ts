import { AnyAction } from 'redux'
import * as t from 'io-ts'
import { TableConfig } from '~/modules/admin/core/filterAndPagination/interfaces'

type ContentTypes = 'multipart/form-data;' | 'application/json'

export interface Request<T> {
  method?: string
  mocked?: boolean
  url: string
  loader?: boolean
  camelize?: boolean
  decamelize?: boolean
  debounce?: number
  tableConfig?: TableConfig
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any
  typedResponse?: t.Type<T>
  camelizeExcept?: string[]
  contentType?: ContentTypes
}
export default interface ApiAction<T> extends AnyAction {
  request: Request<T>
}
