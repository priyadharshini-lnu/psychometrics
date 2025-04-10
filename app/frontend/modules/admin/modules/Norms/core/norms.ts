export const IMPORT_NORMS = 'NORMS/IMPORT'

export const importNorms = (body: FormData) => ({
  type: IMPORT_NORMS,
  request: {
    method: 'post',
    url: '/api/v2/administration/norms/import',
    body,
    loader: true,
    contentType: 'multipart/form-data;' as const,
  },
})
