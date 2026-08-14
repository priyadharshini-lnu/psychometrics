import { PartialDeep } from 'type-fest'
import { AdditionRelationshipAttribute } from '~/libs/jsonApi/interfaces'

export enum RequestStatus {
  Loading = 'loading',
  Success = 'success',
  Failed = 'failed',
}

export type HttpAction = 'get' | 'post' | 'put' | 'patch' | 'delete'

export type RequestType = 'fetch' | 'add' | `update@${string}` | `delete@${string}` | `fetch@${string}`
  | `${HttpAction}/${string}@${string}` | `${HttpAction}/${string}` | `removeRelationships@${string}` |
  `addRelationships@${string}` | `upload/${string}`

export interface JsonApiErrorBody {
  title?: string
  detail?: string
}

export interface ResourceErrors {
  base?: JsonApiErrorBody[]
  [key: string]: JsonApiErrorBody | JsonApiErrorBody[] | undefined
}

export type Requests = {
  [key in RequestType]?: {
    status: RequestStatus,
    errors?: ResourceErrors[] | null
  }
}
export interface ResourceState<D, M = BaseMeta> {
  data: D,
  requests: Requests,
  meta: M,
  query: UrlQuery
}

export interface UrlQuery {
  fields?: { [key: string]: string |string[] }
  page?: {
    number?: number,
    size?: number
  },
  filter?: {
    [key: string]: string | string[]
  },
  sort?: string
}

export interface ApiConfig extends UrlQuery {
  include?: string[]
  include_meta?: string[]
  include_resource_meta?: string[]
  camelizeOnly?: string[]
  camelizeExcept?: string[]
  query?: {
    [key:string]: unknown
  }
  filter?: {
    [key:string]: string | string[]
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ResponseType = any

export interface StateManager<R, M> {
  state: ResourceState<R, M>,
  setState: ((state: ResourceState<R, M>) => void) |
    ((callback: (state: ResourceState<R, M>) => ResourceState<R, M>) => void),
}
export interface Options<R, M> {
  apiConfig?: ApiConfig,
  stateManager?: StateManager<R, M>,
  responseType?: ResponseType,
  trackUrl?: boolean,
  basePath?: string,
  initialFilter?: {[key:string]: unknown},
}

export interface BaseMeta {
  permissions?: { [key: string]: boolean },
  recordCount?: number,
  pageCount?: number,
  reportFamilyName?: { [key: string]: string },
}

type ExtraArgs = { responseType?: ResponseType, apiConfig?: ApiConfig }
export type CreateResource<R> =
  (attribute: PartialDeep<AdditionRelationshipAttribute<Omit<R, 'id'>>>, args?: ExtraArgs) => Promise<R>

export type UpdateResource<R> =
  (attribute: { id: string } & PartialDeep<AdditionRelationshipAttribute<R>>, args?: ExtraArgs) => Promise<R>

export type AddRelationship = (resourceType: string, ids: string[], args?: ExtraArgs) => Promise<void>
export type RemoveResource = (id: string, args?: ExtraArgs) => Promise<void>
export type RemoveRelationships = (resourceType: string, ids: string[], args?: ExtraArgs) => Promise<void>

export type MemberAction = (args: {
  id: string, action: string, method: HttpAction,
  body?: Record<string, unknown>,
  updateStore?: boolean, responseType?: ResponseType, apiConfig?: ApiConfig
}) => Promise<void | unknown>

export interface MemberActionOptions {
  responseType?: ResponseType
}
