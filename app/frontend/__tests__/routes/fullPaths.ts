type RouteNode = { path?: string, index?: boolean, children?: RouteNode[] }

// Every url a route table serves, parents first, in declaration order.
export const fullPaths = (routes: RouteNode[], parent = ''): string[] => routes.flatMap((route) => {
  const path = [parent, route.index ? '(index)' : route.path].filter(Boolean).join('/')

  return [path, ...(route.children ? fullPaths(route.children, path) : [])]
})
