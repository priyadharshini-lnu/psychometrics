import { Navigate, Route, Routes } from 'react-router-dom'
import _ from 'lodash'
import RouteErrorBoundary from '~/components/RouteErrorBoundary'

const flattenRoutes = routes => _.flatten(
  routes.map((route) => {
    if (route.routes) {
      return _.flatten(flattenRoutes(route.routes))
        .map(childRoute => ({
          ...childRoute,
          component: route.component,
          childRoutes: route.routes,
        }))
        .concat(route)
    }
    return route
  }),
)

export default function RouteList ({ routes, urlPrefix }) {
  const setRoutes = (_routes, _urlPrefix) => flattenRoutes(_routes).map((route, i) => {
    if (route.redirect) {
      return (
        <Route
          key={i}
          path={route.from}
          element={<Navigate to={route.to} replace />}
        />
      )
    }
    return (
      <Route
        key={i}
        path={`${_urlPrefix}${route.path}`}
        element={(
          <RouteErrorBoundary>
            {route.component}
          </RouteErrorBoundary>
          )}
      />
    )
  })

  return <Routes>{setRoutes(routes, urlPrefix)}</Routes>
}
