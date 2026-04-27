import qs from 'qs'
import _ from 'lodash'

const routeUtils = {
  getBasePath (prefix) {
    const pattern = prefix.replace(/:[\w]+/g, '[^/]+')
    const re = new RegExp(`(${pattern})`)
    return re.exec(location.pathname)[1]
  },
  moveTo (navigate, prefix, path, replace = false, state = {}) {
    const url = `${this.getBasePath(prefix)}${path}`
    replace ? navigate(url, { replace: true }) : navigate(url, { state })
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
