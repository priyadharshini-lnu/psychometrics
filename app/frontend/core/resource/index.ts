import _ from 'lodash'

export const fetch = (
  requestScope: string | undefined,
  resourceName: string,
  resourceBaseUrl: string,
  resourceId: number | string,
  mocked?: boolean,
) => ({
  type: getActionType(requestScope, resourceName, 'FETCH'),
  request: {
    url: `${resourceBaseUrl}/${resourceId}`,
    method: 'GET',
    loader: true,
    mocked,
  },
})

export const create = (
  requestScope: string | undefined,
  resourceName: string,
  resourceBaseUrl: string,
  data: object,
  mocked?: boolean,
) => ({
  type: getActionType(requestScope, resourceName, 'CREATE'),
  request: {
    url: resourceBaseUrl,
    method: 'POST',
    mocked,
    loader: true,
    body: { resource: data },
  },
})

export const update = (
  requestScope: string | undefined,
  resourceName: string,
  resourceBaseUrl: string,
  resourceId: number | string,
  data: object,
  mocked?: boolean,
) => ({
  type: getActionType(requestScope, resourceName, 'UPDATE'),
  id: resourceId,
  request: {
    url: `${resourceBaseUrl}/${resourceId}`,
    method: 'PUT',
    loader: true,
    mocked,
    body: { resource: data },
  },
})

const getActionType = (requestScope: string | undefined, resourceName: string, actionName: string) => (
  _.join(
    _.compact(['resource', requestScope, resourceName, actionName]), '/',
  )
)
