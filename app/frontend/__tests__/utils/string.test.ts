
import {shortify} from '~/utils/string'

test('shortify', () => {
  expect(shortify('Thriving Index')).toStrictEqual('TI')
  expect(shortify('T')).toStrictEqual('T')
  expect(shortify('AGILE - Element X')).toStrictEqual('AE')
  expect(shortify('Thriving')).toStrictEqual('TH')
})
