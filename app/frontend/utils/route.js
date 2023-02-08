import pathToRegexp from 'path-to-regexp'
import qs from 'query-string'
import _ from 'lodash'

const routeUtils = {
  getBasePath (prefix) {
    const re = pathToRegexp(`(${prefix})(/*){0,1}`)
    return re.exec(location.pathname)[1]
  },
  moveTo (history, prefix, path) {
    history.push(`${this.getBasePath(prefix)}${path}`)
  },
  getActiveRoutePath (routes) {
    const route = _.find(routes, route => location.pathname.includes(route.path))
    return route ? route.path : null
  },
  getPage () {
    return parseInt(this.parsedQueryString().page, 10) || 1
  },
  getSearchTerm () {
    return this.parsedQueryString().search || null
  },
  parsedQueryString () {
    return qs.parse(location.search.substr(1))
  },
}

export default routeUtils
