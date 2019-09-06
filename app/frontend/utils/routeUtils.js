import pathToRegexp from 'path-to-regexp'
import queryString from 'query-string'
import settings from '../admin/core/threeSixtyCampaign/settings'

const routeUtils = {
  getBasePath (prefix) {
    const re = pathToRegexp(`(${prefix})(/*){0,1}`)
    return re.exec(location.pathname)[1]
  },
  moveTo (history, prefix, path) {
    history.push(`${this.getBasePath(prefix)}${path}`)
  },
  getActiveRoutePath (routes) {
    const route = routes.find(route => location.pathname.includes(route.path))
    return route ? route.path : null
  },
  getCurrentPage () {
    const getParams = queryString.parse(location.search)
    return parseInt(getParams.page, 10) || 1
  },
  getCurrentOffset () {
    return (this.getCurrentPage() - 1) * settings.pageLimit
  },
  getPage () {
    return parseInt(queryString.parse(location.search).page, 10) || 1
  },
}

export default routeUtils
