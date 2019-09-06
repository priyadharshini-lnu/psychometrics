import { get } from 'lodash'
import { set } from 'lodash/fp'

export { merge } from 'lodash/fp'

export const getIn = get
export const setIn = (object, path, value) => set(path, value, object)
export const updateIn = (object, path, callback) => setIn(object, path, callback(getIn(object, path)))
