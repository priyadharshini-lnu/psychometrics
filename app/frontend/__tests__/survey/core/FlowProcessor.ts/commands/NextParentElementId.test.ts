import NextParentElementId from 'libs/survey/core/preview/FlowProcessor/commands/NextParentElementId'

test('next parent element should return valid id', () => {
  expect(NextParentElementId.run('0/0/0')).toStrictEqual('0/1')
  expect(NextParentElementId.run('0/0/1')).toStrictEqual('0/1')
  expect(NextParentElementId.run('0/1')).toStrictEqual('1')
  expect(NextParentElementId.run('1')).toStrictEqual(null)
  expect(NextParentElementId.run('0/1/1')).toStrictEqual('0/2')
})
