/* eslint-disable import/prefer-default-export */
import _ from 'lodash'

export const getValue = (options, value) => {
  if (_.isArray(value)) {
    return value.map(val => (_.isObject(val) ? val : _.find(options, { value: val })))
  }
  return _.isObject(value) ? value : _.find(options, { value })
}
