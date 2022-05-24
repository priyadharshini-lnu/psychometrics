import { PartialDeep, Merge } from 'type-fest'
import { AdditionRelationshipAttribute } from 'libs/jsonApi/interfaces'

export enum RequestStatus {
  Loading = 'loading',
  Success = 'success',
  Failed = 'failed',
}

export type RequestType = 'fetch' | 'add' | `update@${string}` | `delete@${string}`

export type Requests = {
  [key in RequestType]?: {
    status: RequestStatus,
    errors?: { [key: string]: string }[] | null
  }
}
export interface ResourceState<D, M = BaseMeta> {
  data: D,
  requests: Requests,
  meta: M,
  query: UrlQuery
}

export interface UrlQuery {
  page?: {
    number?: number,
    size?: number
  },
  filter?: {
    [key: string]: string
  },
  sort?: string
}

export interface ApiConfig extends UrlQuery {
  include?: string[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ResponseType = any

export interface Options<R, M> {
  apiConfig?: ApiConfig,
  stateManager?: {
    setState: (state: ResourceState<R, M>) => void,
    state: ResourceState<R, M>
  },
  responseType?: ResponseType,
  trackUrl?: boolean,
}

export interface BaseMeta {
  recordCount?: number,
  pageCount?: number,
}

type ExtraArgs = { responseType?: ResponseType, apiConfig?: ApiConfig }
export type CreateResource<R> =
  (attribute:  PartialDeep<AdditionRelationshipAttribute<Omit<R, 'id'>>>, args?: ExtraArgs) => Promise<R>

export type UpdateResource<R> =
  (attribute:  { id: string } & PartialDeep<AdditionRelationshipAttribute<R>>, args?: ExtraArgs) => Promise<R>

export type RemoveResource = (id: string, args?: ExtraArgs) => Promise<void>
