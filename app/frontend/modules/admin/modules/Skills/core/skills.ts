export const IMPORT_SKILLS = 'SKILLS/IMPORT'

export const importSkills = (body: FormData) => ({
  type: IMPORT_SKILLS,
  request: {
    method: 'post',
    url: '/api/v2/administration/skills/import',
    body,
    loader: true,
    contentType: 'multipart/form-data;' as const,
  },
})
