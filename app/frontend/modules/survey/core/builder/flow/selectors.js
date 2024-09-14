import _ from 'lodash'

const loadChildren = (elements, roots) => _.map(elements, (element, i) => ({
  module: { ...element, path: element.path || [...roots, i] },
  title: element.uuid,
  children: loadChildren(element.elements, [roots, i]),
}))

export const getTree = (flow) => {
  const { elements } = flow
  const children = (flow === null) ? [] : loadChildren(elements, [])
  return {
    module: null,
    children,
  }
}
