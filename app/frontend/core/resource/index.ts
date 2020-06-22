export const fetch = (resourceName: string, resourceBaseUrl: string, resourceId: number) => ({
  type: `resource/${resourceName}/FETCH`,
  request: {
    url: `${resourceBaseUrl}/${resourceId}`,
    method: 'GET',
  },
})

export const create = (resourceName: string, resourceBaseUrl: string, body: object) => ({
  type: `resource/${resourceName}/CREATE`,
  request: {
    url: resourceBaseUrl,
    method: 'POST',
    body,
  },
})

export const update = (resourceName: string, resourceBaseUrl: string, resourceId: number, body: object) => ({
  type: `resource/${resourceName}/UPDATE`,
  request: {
    url: `${resourceBaseUrl}/${resourceId}`,
    method: 'PUT',
    body,
  },
})
