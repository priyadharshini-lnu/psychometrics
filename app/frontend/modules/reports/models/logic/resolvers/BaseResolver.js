function isNullish (value) {
  return value === null || value === 'null' || value === undefined || value === 'undefined'
}

export default class BaseResolver {
  Empty = subject => isNullish(subject)

  NotEmpty = subject => !isNullish(subject)

  EqualTo = (subject, value) => subject === value

  NotEqualTo = (subject, value) => subject !== value

  GreaterThen = (subject, value) => subject > value

  GreaterThenOrEqual = (subject, value) => subject >= value

  LessThen = (subject, value) => subject < value

  LessThenOrEqual = (subject, value) => subject <= value
}
