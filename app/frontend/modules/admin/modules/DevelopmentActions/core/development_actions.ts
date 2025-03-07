import ApiAction from '~/interfaces/ApiAction'

export const IMPORT_DEVELOPMENT_ACTIONS = 'DEVELOPMENT_ACTIONS/IMPORT'
export const EXPORT_DEVELOPMENT_ACTIONS = 'DEVELOPMENT_ACTIONS/EXPORT'

export const importDevelopmentActions = (body: FormData) => ({
  type: IMPORT_DEVELOPMENT_ACTIONS,
  request: {
    method: 'post',
    url: '/api/v2/administration/development_actions/import',
    body,
    loader: true,
    contentType: 'multipart/form-data;' as const,
  },
})

export const exportDevelopmentActions = (projectId?:number):ApiAction<void> => ({
  type: EXPORT_DEVELOPMENT_ACTIONS,
  request: {
    method: 'post',
    url: '/api/v2/administration/development_actions/export',
    body: { project_id: projectId },
    loader: true,
    contentType: 'multipart/form-data;' as const,
  },
})
