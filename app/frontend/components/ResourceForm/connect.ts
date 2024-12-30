import { connect, ConnectedProps } from 'react-redux'
import { fetch, create, update } from '~/core/resource'
import { OwnProps } from './ResourceForm'

const connecter = connect(
  () => ({}),
  (dispatch, {
    resourceName, resourceBaseUrl, resource, resourceId, requestScope,
  }: OwnProps) => {
    const id = resourceId || (resource && resource.id) as number
    let defaultRequest = {}
    if (resourceBaseUrl) {
      defaultRequest = {
        fetchResource: () => dispatch(fetch(requestScope, resourceName, resourceBaseUrl, id)),
        createResource: body => dispatch(create(requestScope, resourceName, resourceBaseUrl, body)),
        updateResource: body => dispatch(update(requestScope, resourceName, resourceBaseUrl, id, body)),
      }
    }
    return {
      defaultRequest,
    }
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
