import Custom from './index'

export default {
  MultipleAnswer (condition) {
    if (Custom[condition.answer]) {
      return Custom[condition.answer](condition)
    }
  },
}
