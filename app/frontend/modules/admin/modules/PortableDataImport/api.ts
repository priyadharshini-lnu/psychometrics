export const validateImport = (validateEndpoint: string, content: string) => fetch(validateEndpoint, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': getCsrfToken(),
  },
  body: JSON.stringify({ json_file_content: content }),
})
  .then(response => response.json())

export const submitImport = (
  importEndpoint: string,
  jsonFileContent: string,
  mappableValues: Record<string, unknown>,
) => fetch(importEndpoint, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': getCsrfToken(),
  },
  body: JSON.stringify({
    json_file_content: jsonFileContent,
    mappable_values: mappableValues,
  }),
})

export const fetchClientsApi = (clientsEndpoint: string, searchValue: string) => {
  const baseUrl = new URL(clientsEndpoint, window.location.origin)
  const params = new URLSearchParams()
  params.set('filter[filterable_fields]', searchValue)
  params.set('fields[clients]', 'name')

  const url = `${baseUrl}?${params.toString()}`

  return fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': getCsrfToken(),
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return response.json()
    })
}

const getCsrfToken = (): string => (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || ''
