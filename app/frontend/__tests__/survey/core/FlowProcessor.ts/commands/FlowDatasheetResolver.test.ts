import FlowDatasheetResolver from 'models/logic/resolvers/FlowDatasheetResolver'

const validCondition = {
  field: 'Name',
  predicate: 'EqualTo',
  value: 'R1'
}

const dataSheetValue = { Name: 'R1' }

test('no dataSheetValue', () => {
  expect(FlowDatasheetResolver.run(validCondition, {})).toStrictEqual({ prefix: 'Or', value: false })
})

test('missing field or predicate in condition', () => {
  let condition = { ...validCondition }
  delete condition['field']
  expect(FlowDatasheetResolver.run(condition, dataSheetValue)).toStrictEqual({ prefix: 'Or', value: false })

  condition = { ...validCondition }
  delete condition['predicate']
  expect(FlowDatasheetResolver.run(condition, dataSheetValue)).toStrictEqual({ prefix: 'Or', value: false })
})

test('condition matches dataSheet', () => {
  expect(FlowDatasheetResolver.run(validCondition, dataSheetValue)).toStrictEqual({ prefix: 'Or', value: true })
})

test("condition doesn't matches dataSheet", () => {
  expect(FlowDatasheetResolver.run(validCondition, { Name: 'R2' })).toStrictEqual({ prefix: 'Or', value: false })
})
