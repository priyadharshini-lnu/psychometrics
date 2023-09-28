import { Route, Redirect, Switch } from 'react-router-dom'
import _ from 'lodash'
import routeUtils from '~/utils/route'

const flattenRoutes = routes => _.flatten(
  routes.map((route) => {
    if (route.routes) {
      return _.flatten(flattenRoutes(route.routes))
        .map(childRoute => ({ ...childRoute, component: route.component, childRoutes: route.routes }))
        .concat(route)
    }
    return route
  }),
)

export default function RouteList ({ routes, urlPrefix }) {
  return (
    <Switch>
      {flattenRoutes(routes).map((route, i) => {
        if (route.redirect) {
          return (
            <Redirect
              key={i}
              from={`${urlPrefix}${route.from}`}
              exact
              to={`${routeUtils.getBasePath(urlPrefix)}${route.to}`}
            />
          )
        }

        return (
          <Route
            path={`${urlPrefix}${route.path}`}
            key={i}
            render={props => <route.component {...props} routes={route.routes || route.childRoutes} />}
            exact
          />
        )
      })}
    </Switch>
  )
}
