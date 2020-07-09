import { connect } from 'react-redux'
import { fetch, create, update } from 'core/resource'

export default connect(
  () => ({}),
  (dispatch, {
    resourceName, resourceBaseUrl, resource, resourceId, requestScope,
  }) => {
    const id = resourceId || (resource && resource.id)

    return {
      defaultRequest: {
        fetchResource: () => dispatch(fetch(requestScope, resourceName, resourceBaseUrl, id)),
        createResource: body => dispatch(create(requestScope, resourceName, resourceBaseUrl, body)),
        updateResource: body => dispatch(update(requestScope, resourceName, resourceBaseUrl, id, body)),
      },
    }
  },
)
