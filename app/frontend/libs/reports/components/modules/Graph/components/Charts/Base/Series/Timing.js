import _ from 'lodash'

export const TYPES = {
  firstClick: 'First Click',
  lastClick: 'Last Click',
  pageSubmit: 'Page Submit',
  clickCount: 'Click Count',
}

export const Functions = {
  Count (data) {
    return data.length
  },

  Mean (data, key) {
    const results = _.sumBy(data, key)
    return results / data.length
  },
}

export default {
  series (results, question, model, func = 'Mean') {
    const commonData = _.map(TYPES, (label, key) => {
      const data = Functions[func](results.questions[question.id], key)
      return {
        name: model.props.choicesTexts[key] || label,
        y: data,
        drilldown: label,
      }
    })
    return [{
      colorByPoint: true,
      data: commonData,
    }]
  },
  functions: _.keys(Functions),
}
