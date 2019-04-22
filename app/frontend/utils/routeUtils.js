import pathToRegexp from 'path-to-regexp'

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
}

export default routeUtils
