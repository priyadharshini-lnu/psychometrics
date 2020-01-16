
export default class Scoring {
  constructor ({ value, norm }) {
    this.actualValue = value
    this.value = value || 0
    this.norm = norm
  }

  getValue () {
    if ((this.norm || this.norm === 0) && this.norm >= 0) return this.norm

    if (!_.isArray(this.value)) return this.value || 0

    return _.mean(this.value)
  }

  getValueOrNaN () {
    if (!this.actualValue) { return NaN }

    return this.getValue()
  }
}
