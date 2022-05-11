import { AnyAction } from 'redux'
import { Request } from './ApiAction'

interface IApiActionResponse<T> extends AnyAction {
  request: Request<T>
  response: T
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type: any
}

export type ApiActionResponse<T> = IApiActionResponse<T>
