__**Note: Please use JSON:API frontend high level docs (under progress). You should use this doc only when High level docs doesn't handle some cases**__

## Resources

1. [JSON:API Specification](https://jsonapi.org/) 
2. [Jsonapi React](https://github.com/TheTalentEnterprise/jsonapi-react): Used to make request to the server.
3. [io-ts-types](https://github.com/gcanti/io-ts-types): To validate response structure after each api call.


## useResources<Resource, Meta> hook

This hooks is responsible for making CRUD request to the server in compliance with JSON:API standard. It also manages the state for the resources so that user of this hook doesn't have to. By default it uses local component state using `useState` function. It can also use Redux, Recoil, zustand (we are using this) or any other state management library to manage state globally.

### Genric Types for useResource hook
1. Resource: Type definition of resource we want to fetch, create, update or delete. This is derived out of [io-ts](https://github.com/gcanti/io-ts) types
2. Meta: Type definition for meta data in response.


### Arguments of useResource hook
useResource hook accepts following 2 arguments

1. resourceName(string): Name of the resource. This will be passed as a type in the JSON:API request payload.
2. options: Options is a Javascript object with following keys
    - trackUrl(boolean): Specifies whether to track filters and pagination data in the url or not. False by default
    - responseType: io-ts type to validate response data
    - apiConfig: This includes various keys to specify filters, pagination, sorting and which fields to load.
      Api config structure looks like below which is self explanatory.
      ```typescript
       {
          fields?: { [key: string]: string |string[] }
          page?: {
            number?: number,
            size?: number
          },
          filter?: {
            [key: string]: string
          },
          sort?: string,
          include?: string[],
          include_meta?: string[],
      }
      ```
      Example for client api with all the options specified would look like below
      ```javascript
      {
          fields: {
            users: ['name', 'email'], // Bring only name and email for project_manager association
            clients: ['name', 'number']
          }
          page: {
            number: 1,
            size: 25
          },
          filter: {
            name_cont: "Client 1"
          },
          sort: '-id', // '-' denotes Descending sorting
          include: ['project_manager'], // associations to include,
          include_meta: ['countries', 'types'] // include countries and types in the response
      }
      ```
    - stateManager: userResources hook manages the state/data by default but if the user of this hook wants to manage the state/data externally (redux, recoil, zustand etc), he can do that my passing the state manager. It's a object with following keys
        - state: external state which should be of type `ResourceState`. Check ResourceState type definition here `app/frontend/hooks/useResources/interfaces.ts`
        - setState: setState function to set/modify the state passed. This is of type `(state: ResourceState<R, M>) => void`

### Data returned by useResources hook

- data(array): It is response returned from the server. It holds list of resources as an array.
- meta(object): Holds meta which is part of server response
- pageSize(number): Number of resources that should be served by server on each fetch request.
- currentPage(number): Current page number of the resource list being loaded.
- requests(object): Holds details of api request. This can be used for showing loader/spinner.
For just showing spinner we also have method called `isLoading` which should be prefered over using requests data
requests looks like this
  ```javascript
  {
      fetch: { status: 'success' },
      create: { 
        status: 'failed',
        errors: [{ title: "can't be blank", source: { pointer: 'data/attributes/name'} }]
      },
      update@1: { status: 'loading' } // 1 after '@' specifies the id of the resource which is updated
  }
  ```
- isLoading(function): This function accepts one parameter and returns boolean. Returns true if particulat request is in progress eg: `isLoading('update@1')`
- fetch(function): Makes request to a server to load the resource. 
  Accepts 1 argument which is the object with following key
    - responseType: io-ts types for the response structure validation. If not passed it picks up the responseType which was passed to useResources hook.
    - apiConfig(object): This is of same format what is passed to `useResources` hook as apiConfig. If not passed it picks up the apiConfig which was passed to useResources 
- createResource(function): Makes request to a server to create a resource. 
  Accepts 2 arguments
    - attributes(object): Attributes for the resource that is to be created
    - config(object): For now config object have on key called apiConfig(object): apiConfig is of same format what is passed to `useResources` hook as apiConfig. If not passed it picks up the apiConfig which was passed to useResources.
- updateResource: Makes request to a server to update a resource. 
  Accepts 2 arguments which is exactly same as `createResource` arguments
- removeResource(function): Makes request to remove the resource. Accept 1 argument which is the id of the resource that needs to be deleted.
- memberAction(function): Makes request to custom crud member action.
Example:
   ```
   memberAction({ action: 'toggle_status', id: 10, method: 'patch' })
   // Above will send PATCH request to ${resource_name}/10/toogle_status
   ```
- collectionAction: Same as memberAction. Only difference is we don't pass the id for individual resource as the is action on collection and not a individual resource
Example:
  ```
  collectionAction({ action: 'import', method: 'post' })
  // Above will send POST request to ${resource_name}/imports
  ```
- getSortOrder(function): Takes argument as a column name and returns the current sort order (ascend or descend) of the column.
- changePage(function): Accept one parameter called pageNumber. It is used for pagination of the resource. 
- changeFilter(function): Accepts 2 parameters. First parameter is the filter name and second parameter is the filter value. It is used to filter the resource list
- removeFilter: Accepts one parameter which is a filterName. It is used to remove the applied filter
- getFilteredValue(function): Accepts one parameter which is filterName. It is used to get the filterValue of the passed filterName
- handleTableChange(function): This can be passed to antd Table onChange callback to handle sorting and column based filtering.
- getErrors(function): Accepts one parameter which it the request name (fetc, create, update@2 etc). It returns errors for the passed request name.

## Sample code for resource listing page
```TSX
// Define io-ts-types, typescript type and schema inside core folder
// File for clients would be in app/frontend/modules/admin/modules/client/core/clients.ts
export const ClientTR = t.intersection([
  ResourceIdentifierTR,
  t.type({
    name: t.string,
    projectManager: t.union([
      t.type({
        id: t.string,
        name: t.string,
      }),
      t.undefined]),
  }),
])
export type Client = t.TypeOf<typeof ClientTR>

// Schema is used by jsonapi-react package to serialize/deserizlize request and response.
// It should specify all relationship. It can also specify type of attribute. If type of attribute it specified it will perform coercion of the attribute. 
// Check [jsonapi-react](https://github.com/TheTalentEnterprise/jsonapi-react) doc for other functionation. // This schema is merged with all other schema in `app/frontend/libs/jsonApi/schema.ts` file.
export const Schema = {
  type: 'clients',
  relationships: {
    projectManager: {
      type: 'users',
    },
  },
}

// Client Listing page
const ClientListComponent: React.FC<{}> = () => {
  const {
    data, meta, fetch, isLoading, getSortOrder, handleTableChange, changePage,
    currentPage, pageSize, changeFilter, getFilteredValue,
  } = useResources<Client>(
    'clients',
    {
      trackUrl: true,
      responseType: ClientTR,
      apiConfig: {
        include: ['project_manager'],
        fields: { users: ['name', 'email'] },
      },
    },
  )
  
  useEffect(() => {
    fetch()
  }, [])
  const tableLoading = isLoading('fetch')
  
  // Table component
  const ClientTable = (
    <>
      <Table
        rowKey={row => row?.id ?? -1}
        dataSource={data}
        pagination={false}
        loading={tableLoading}
        onChange={handleTableChange}
      >
        <Column
          title={I18n.t('common.column.id')}
          dataIndex="id"
          key="id"
          sorter
          sortOrder={getSortOrder('id')}
        />
        <Column
          title={I18n.t('common.column.name')}
          key="name"
          width={300}
          sorter
          sortOrder={getSortOrder('name')}
          render={({ name, id }) => (
            <a href={`/administration/clients/${id}/projects`}>{name}</a>
          )}
        />
      </Table>
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={meta.recordCount}
        onChange={changePage}
        className="pl"
      />
    </>
  )
  
  // All the filters that we need
  const Filter = (
    <Space>
      <Search
        placeholder={I18n.t('common.actions.search')}
        value={getFilteredValue('name_cont')}
        onChange={({ target: { value } }) => { changeFilter('name_cont', value) }}
      />
    </Space>
  )
  
  // Use TableLayout custom component to build the table with filters
  return (
    <>
      <TableLayout
        table={ClientTable}
        filters={Filter}
        recordCount={meta.recordCount}
        loading={tableLoading}
      />
    </>
  )
}
```

## Sample code for creating or updating resource using ResourceFormModal
```TSX
<ResourceFormModal
  resourceName="clients"
  resource={client}
  readableResourceName="Client"
  showSuccessMessages
  close={close}
  scrollToFirstError
  modalProps={{ width: 620 }}
  request={{
    createResource: createResource, // This is creteResource function returned from the useResources hook
    updateResource: updateResource, // This is updateResource function returned from the useResources hook
  }}
>
 {() => (
    <>
      <Form.Item
        name="name"
        label={I18n.t('administration.campaigns.form.name')}
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="number"
        label="Number"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
    <>
 )}
</ResourceFormModal>
```