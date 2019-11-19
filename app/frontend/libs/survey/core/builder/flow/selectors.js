
const loadChildren = elements => _.map(elements, element => ({
  module: element,
  children: loadChildren(element.elements),
}))

export const getTree = ({ survey: { builder: { flow } } }) => {
  const { elements } = flow
  const children = (flow === null) ? [] : loadChildren(elements)
  return {
    module: null,
    children,
  }
}
