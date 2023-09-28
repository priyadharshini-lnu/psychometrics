import pathToRegexp from 'path-to-regexp'
import qs from 'qs'
import _ from 'lodash'

const routeUtils = {
  getBasePath (prefix) {
    const re = pathToRegexp(`(${prefix})(/*){0,1}`)
    return re.exec(location.pathname)[1]
  },
  moveTo (history, prefix, path, replace = false) {
    const url = `${this.getBasePath(prefix)}${path}`
    replace ? history.replace(url) : history.push(url)
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
