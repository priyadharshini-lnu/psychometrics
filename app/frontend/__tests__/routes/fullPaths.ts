type RouteNode = { path?: string, index?: boolean, children?: RouteNode[] }

// Every url a route table serves, parents first, in declaration order.
export const fullPaths = (routes: RouteNode[], parent = ''): string[] => routes.flatMap((route) => {
  const path = [parent, route.index ? '(index)' : route.path].filter(Boolean).join('/')
  const children = route.children ? fullPaths(route.children, path) : []

  // A pathless layout route serves no url of its own.
  return route.path !== undefined || route.index ? [path, ...children] : children
})
