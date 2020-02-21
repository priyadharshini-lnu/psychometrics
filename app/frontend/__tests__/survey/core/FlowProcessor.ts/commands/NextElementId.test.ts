import GetNextElementId from 'libs/survey/core/preview/FlowProcessor/commands/GetNextElementId'

test('next element should return valid id', () => {
  expect(GetNextElementId.run('0/0/0')).toStrictEqual('0/0/1')
  expect(GetNextElementId.run('0/0/1')).toStrictEqual('0/0/2')
  expect(GetNextElementId.run('0/1')).toStrictEqual('0/2')
  expect(GetNextElementId.run('1')).toStrictEqual('2')
  expect(GetNextElementId.run('0/1/1')).toStrictEqual('0/1/2')
})
