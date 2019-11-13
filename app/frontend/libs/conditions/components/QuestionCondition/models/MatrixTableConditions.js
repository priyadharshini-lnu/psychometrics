import _ from 'lodash'

function answer (value, label, type = 'bool') {
  return {
    value,
    label,
    type,
  }
}

const TYPES = {
  Likert (model, config) {
    const answers = []

    _.times(model.props.scalePoints, (i) => {
      const label = `${model.props.scalePointsTexts[i] || config.defaultScalePointText(i + 1)}`
      answers.push(answer(`col_${i}`, `${label}`))
      answers.push(answer(`count_col_${i}`, `${label} (Count)`, 'input'))
    })

    _.times(model.props.choices, (i) => {
      const choiceLabel = `${model.props.choicesTexts[i] || config.defaultChoiceText(i + 1)}`
      // TODO: Not implemented recode functionality
      // answers.push(answer(`recode_row_${i}`, `${choiceLabel} (Recode)`, 'input'))
      _.times(model.props.scalePoints, (j) => {
        const label = `${model.props.scalePointsTexts[j] || config.defaultScalePointText(j + 1)}`
        answers.push(answer(`row_${i}_col_${j}`, `${choiceLabel} - ${label}`))
      })
    })

    return answers
  },

  Bipolar (model, config) {
    const answers = []

    _.times(model.props.scalePoints, (i) => {
      const label = `${model.props.scalePointsTexts[i] || config.defaultScalePointText(i + 1)}`
      answers.push(answer(`col_${i}`, `${label}`))
      answers.push(answer(`count_col_${i}`, `${label} (Count)`, 'input'))
    })

    // TODO: Not implemented recode functionality
    // _.times(model.props.choices, (i) => {
    //   let choiceLabel = `${model.props.choicesTexts[i] || model.moduleConfig.defaultChoiceText(i + 1)}`
    //   answers.push(answer(`recode_row_${i}`, `${choiceLabel} (Recode)`, 'input'))
    // })

    return answers
  },

  RankOrder (model, config) {
    const answers = []

    _.times(model.props.choices, (i) => {
      const choiceLabel = `${model.props.choicesTexts[i] || config.defaultChoiceText(i + 1)}`
      _.times(model.props.scalePoints, (j) => {
        const label = `${model.props.scalePointsTexts[j] || config.defaultScalePointText(j + 1)}`
        answers.push(answer(`row_${i}_col_${j}`, `${choiceLabel} - ${label}`, 'input'))
      })
    })

    return answers
  },

  ConstantSum (model, config) {
    return this.RankOrder(model, config)
  },

  TextEntry (model, config) {
    return this.RankOrder(model, config)
  },

  Profile (model, config) {
    const answers = []

    _.times(model.props.choices, (i) => {
      const choiceLabel = `${model.props.choicesTexts[i] || config.defaultChoiceText(i + 1)}`
      _.times(model.props.scalePoints, (j) => {
        const label = `${model.props.scalePointsTexts[j] || config.defaultScalePointText(j + 1)}`
        answers.push(answer(`row_${i}_col_${j}`, `${choiceLabel} - ${label}`))
      })
    })

    return answers
  },

  MaxDiff (model, config) {
    const answers = []
    _.times(model.props.choices, (i) => {
      const choiceLabel = `${model.props.choicesTexts[i] || config.defaultChoiceText(i + 1)}`
      // TODO: Not implemented recode functionality
      // answers.push(answer(`recode_row_${i}`, `${choiceLabel} (Recode)`, 'input'))
      _.times(model.props.scalePoints, (j) => {
        const label = `${model.props.scalePointsTexts[j] || config.defaultScalePointText(j + 1)}`
        answers.push(answer(`row_${i}_col_${j}`, `${choiceLabel} - ${label}`))
      })
    })

    return answers
  },
}

export default function (manager) {
  return TYPES[manager.question.props.type](manager.question, manager.config)
}
