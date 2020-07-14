import { get, PropertyPath } from 'lodash'
import { set } from 'lodash/fp'

export { merge } from 'lodash/fp'

export const getIn = get
export const setIn = <T extends {}>(object: T, path: PropertyPath, value) => set(path, value, object)
export const updateIn = <T extends {}>(object: T, path: PropertyPath, callback) => (
  setIn(object, path, callback(getIn(object, path)))
)
