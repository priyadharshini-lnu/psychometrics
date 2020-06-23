import { connect } from 'react-redux'
import { fetch, create, update } from 'core/resource'

export default connect(
  () => ({}),
  (dispatch, {
    resourceName, resourceBaseUrl, resource, resourceId,
  }) => {
    const id = resourceId || (resource && resource.id)

    return {
      defaultRequest: {
        fetchResource: () => dispatch(fetch(resourceName, resourceBaseUrl, id)),
        createResource: body => dispatch(create(resourceName, resourceBaseUrl, body)),
        updateResource: body => dispatch(update(resourceName, resourceBaseUrl, id, body)),
      },
    }
  },
)
