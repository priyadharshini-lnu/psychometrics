import _ from 'lodash'

export default {
  series (results, question, model) {
    const { colors } = model.props
    const hash = {}
    _.each(results.questions[question.id], (result) => {
      _.each(result, (item) => {
        if (hash[item.value]) {
          hash[item.value] += 1
        } else {
          hash[item.value] = 1
        }
      })
    })
    results = []
    let i = 0
    _.forOwn(hash, (value, key) => {
      i += 1
      results.push({
        value: key,
        count: value,
        color: colors[i % (colors.length)].color,
        fontScale: parseInt(model.props.style.fontSize, 10) / 100,
      })
    })
    return results
  },
}
