import { AnyAction } from 'redux'
import { Request } from './ApiAction'

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface IApiActionResponse<T> extends AnyAction {
  request: Request<T>
  response: T
}

export type ApiActionResponse<T> = IApiActionResponse<T>
