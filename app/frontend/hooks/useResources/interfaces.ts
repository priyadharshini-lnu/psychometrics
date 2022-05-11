export interface Requests {
  [key: string]: {
    status: 'loading' | 'failed' | 'success',
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
