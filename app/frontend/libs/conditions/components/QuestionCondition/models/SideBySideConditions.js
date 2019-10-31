import _ from 'lodash'

function answer (value, label, type = 'bool') {
  return {
    value,
    label,
    type,
  }
}

const TYPES = {
  Likert (model, data, index, config) {
    const answers = []

    _.times(data.answers, (i) => {
      const label = `${data.answersTexts[i] || config.defaultAnswerText(i + 1)}`
      answers.push(answer(`c_${index}col_${i}`, `${label}`))
      answers.push(answer(`count_c_${index}col_${i}`, `${label} (Count)`, 'input'))
    })

    _.times(model.props.choices, (i) => {
      const choiceLabel = `${model.props.choicesTexts[i] || config.defaultStatementText(i + 1)}`
      // TODO: Not implemented recode functionality
      // answers.push(answer(`recode_c_${index}row_${i}`, `${choiceLabel} (Recode)`, 'input'))
      _.times(data.answers, (j) => {
        const label = `${data.answersTexts[j] || config.defaultAnswerText(j + 1)}`
        answers.push(answer(`c_${index}row_${i}_col_${j}`, `${choiceLabel} - ${label}`))
      })
    })

    return answers
  },

  Text (model, data, index, config) {
    const answers = []

    _.times(model.props.choices, (i) => {
      const choiceLabel = `${model.props.choicesTexts[i] || config.defaultStatementText(i + 1)}`
      _.times(data.answers, (j) => {
        const label = `${data.answersTexts[j] || config.defaultAnswerText(j + 1)}`
        answers.push(answer(`c_${index}row_${i}_col_${j}`, `${choiceLabel} - ${label}`, 'input'))
      })
    })

    return answers
  },
}

export default function (manager) {
  let answers = []
  _.each(manager.question.props.columnsData, (colData, i) => {
    answers = answers.concat(TYPES[colData.type](manager.question, colData, i, manager.config))
  })
  return answers
}
