import Custom from './index'

function find (condition) {
  if (Custom[condition.answer]) {
    return Custom[condition.answer](condition)
  }
}

export default {
  SingleLine (condition) {
    return find(condition)
  },

  MultiLine (condition) {
    return find(condition)
  },

  EssayTextBox (condition) {
    return find(condition)
  },

  Form (condition) {
    const res = condition.result.answers[condition.answer]
    if (res) {
      return res.value
    }
  },

  Password (condition) {
    return find(condition)
  },
}
