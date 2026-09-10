import store from '~/modules/survey/store'

const FETCH_LIBRARY = 'builder/library/FETCH'

const BuilderLibraryTransport = {
  init () {},

  perform (action, data, onResponce) {
    if (action !== 'library_index') { return }

    store.dispatch({
      type: FETCH_LIBRARY,
      request: {
        url: '/administration/builders/library',
        body: data,
        camelize: false,
      },
    })
      .then(({ response }) => {
        onResponce && onResponce(response)
      })
      .catch(() => {})
  },
}

export default BuilderLibraryTransport
