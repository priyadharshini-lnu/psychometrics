
export default class BaseResolver {
  EqualTo = (subject, value) => subject === value

  NotEqualTo = (subject, value) => subject !== value

  GreaterThen = (subject, value) => subject > value

  GreaterThenOrEqual = (subject, value) => subject >= value

  LessThen = (subject, value) => subject < value

  LessThenOrEqual = (subject, value) => subject <= value
}
