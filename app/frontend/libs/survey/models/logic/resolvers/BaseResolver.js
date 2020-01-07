export default class BaseResolver {
  // eslint-disable-next-line eqeqeq
  EqualTo = (subject, value) => subject == value

  // eslint-disable-next-line eqeqeq
  NotEqualTo = (subject, value) => subject != value

  GreaterThen = (subject, value) => +subject > +value

  GreaterThenOrEqual = (subject, value) => +subject >= +value

  LessThen = (subject, value) => +subject < +value

  LessThenOrEqual = (subject, value) => +subject <= +value

  Contains = (subject, value) => subject.includes(value)

  DoesNotContain = (subject, value) => !subject.includes(value)

  MatchesRegex = (subject, value) => subject.match(new RegExp(value))
}
