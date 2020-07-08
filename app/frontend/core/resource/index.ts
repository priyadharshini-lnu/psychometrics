import _ from 'lodash'

export const fetch = (
  requestScope: string | undefined,
  resourceName: string,
  resourceBaseUrl: string,
  resourceId: number,
) => ({
  type: getActionType(requestScope, resourceName, 'FETCH'),
  request: {
    url: `${resourceBaseUrl}/${resourceId}`,
    method: 'GET',
  },
})

export const create = (
  requestScope: string | undefined,
  resourceName: string,
  resourceBaseUrl: string,
  data: object,
) => ({
  type: getActionType(requestScope, resourceName, 'CREATE'),
  request: {
    url: resourceBaseUrl,
    method: 'POST',
    body: { resource: data },
  },
})

export const update = (
  requestScope: string | undefined,
  resourceName: string,
  resourceBaseUrl: string,
  resourceId: number,
  data: object,
) => ({
  type: getActionType(requestScope, resourceName, 'UPDATE'),
  request: {
    url: `${resourceBaseUrl}/${resourceId}`,
    method: 'PUT',
    body: { resource: data },
  },
})

const getActionType = (requestScope: string | undefined, resourceName: string, actionName: string) => (
  _.join(
    _.compact(['resource', requestScope, resourceName, actionName]), '/',
  )
)
