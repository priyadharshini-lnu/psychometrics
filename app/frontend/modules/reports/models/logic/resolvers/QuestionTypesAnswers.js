const MultipleChoice = results => results.map(result => ({ value: result.index + 1 }))

const MatrixTable = (results, answer) => results.filter(
  r => r.choice === +answer,
).map(result => ({ value: result.scale + 1 }))

const Slider = (results, answer) => results.filter(
  r => r.index === +answer,
).map(result => ({ value: result.value }))

const RankOrder = (results, answer) => results.filter(
  r => r.index === +answer,
).map(result => ({ value: result.value + 1 }))

const SideBySide = (results, answer) => {
  const [scale, choice] = answer.split(',')
  return results.filter(r => r.scale === +scale && r.choice === +choice)
    .map(result => ({ value: result.values[0].index + 1 }))
}

const GapAnalysis = (results, answer) => results.filter(
  r => r.choice === +answer,
).map(result => ({ value: result.values[0] + 1 }))

const ConstantSum = (results, answer) => results.filter(
  r => r.index === +answer,
).map(result => ({ value: result.value }))

const PickGroupRank = (results, answer) => {
  const [scale, choice] = answer.split(',')
  return results.filter(r => r.scale === +scale && r.choice === +choice)
    .map(result => ({ value: result.value + 1 }))
}

export default {
  MultipleChoice,
  MatrixTable,
  Slider,
  RankOrder,
  SideBySide,
  GapAnalysis,
  ConstantSum,
  PickGroupRank,
}
