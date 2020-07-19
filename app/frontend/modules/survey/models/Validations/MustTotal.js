import _ from 'lodash'

const MustTotal = function ({ mustTotal }) {
  this.mustTotal = +mustTotal
}

_.extend(MustTotal.prototype, {
  validate (answers) {
    const sum = _.reduce(answers, (sum, answer) => sum + parseInt(answer.value, 10), 0)

    if (sum !== this.mustTotal) {
      return {
        type: 'MustTotal',
        message: `Please total the choices to ${this.mustTotal}.`,
      }
    }
  },
})

export default MustTotal
