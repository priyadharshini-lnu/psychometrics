import NextElementId from 'libs/survey/core/preview/FlowProcessor/commands/NextElementId'

test('next element should return valid id', () => {
  expect(NextElementId.run('0/0/0')).toStrictEqual('0/0/1')
  expect(NextElementId.run('0/0/1')).toStrictEqual('0/0/2')
  expect(NextElementId.run('0/1')).toStrictEqual('0/2')
  expect(NextElementId.run('1')).toStrictEqual('2')
  expect(NextElementId.run('0/1/1')).toStrictEqual('0/1/2')
})
