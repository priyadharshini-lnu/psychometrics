import BaseResolver from 'models/logic/resolvers/BaseResolver'

const FlowDatasheetResolver = {
  run (condition: {
    prefix?: string
    field?: string
    predicate?: string
    value?: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }, datasheetValue: { [key: string]: any }) {
    const {
      field, value, predicate, prefix = 'Or',
    } = condition
    if (!datasheetValue || !field || !predicate) { return { prefix, value: false } }
    const resolver = new BaseResolver()

    return { prefix, value: resolver[predicate](datasheetValue[field], value) }
  },
}

export default FlowDatasheetResolver
