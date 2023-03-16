import {isRtl} from '~/utils/locales'

test('isRtl', () => {
  expect(isRtl('ar')).toStrictEqual(true)
  expect(isRtl('en')).toStrictEqual(false)
  expect(isRtl('ru')).toStrictEqual(false)
  expect(isRtl('ar_SA ')).toStrictEqual(true)
})
