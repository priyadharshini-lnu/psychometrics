export default function TextField (condition) {
  if (condition.result.answers[0]) {
    return condition.result.answers[0].value
  }
  return ''
}
