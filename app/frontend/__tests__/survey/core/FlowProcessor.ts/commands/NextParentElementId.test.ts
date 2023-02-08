import GetNextParentElementId from '~/modules/survey/core/preview/FlowProcessor/commands/GetNextParentElementId'

test('next parent element should return valid id', () => {
  expect(GetNextParentElementId.run('0/0/0')).toStrictEqual('0/1')
  expect(GetNextParentElementId.run('0/0/1')).toStrictEqual('0/1')
  expect(GetNextParentElementId.run('0/1')).toStrictEqual('1')
  expect(GetNextParentElementId.run('1')).toStrictEqual(null)
  expect(GetNextParentElementId.run('0/1/1')).toStrictEqual('0/2')
})
