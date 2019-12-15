import _ from 'lodash'

function answer (value, label, type = 'bool') {
  return {
    value,
    label,
    type,
  }
}

export default function (manager) {
  const answers = []
  const model = manager.question
  _.times(model.props.choices, (i) => {
    const choiceLabel = `${model.props.choicesTexts[i] || manager.config.defaultChoiceText(i + 1)}`
    answers.push(answer(`row_${i}`, `${choiceLabel} - Rank`, 'input'))
    _.times(model.props.scalePoints, (j) => {
      const label = `${model.props.scalePointsTexts[j] || manager.config.defaultScalePointText(j + 1)}`
      answers.push(answer(`row_${i}_col_${j}`, `${choiceLabel} - ${label}`))
    })
  })

  return answers
}
