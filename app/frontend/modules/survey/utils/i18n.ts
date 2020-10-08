import _ from 'lodash'

const { I18n } = window

I18n.pluralization.ar = (count: number): [string] => {
  const keys = { 0: 'zero', 1: 'one', 2: 'two' }
  return [_.get(keys, count, 'other')]
}
