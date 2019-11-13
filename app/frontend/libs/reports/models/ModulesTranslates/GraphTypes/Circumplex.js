class Circumplex {
  constructor (module) {
    this.module = module
  }

  exportLocales () {
    return {
      innerCircleText: this.module.props.innerCircleText,
    }
  }
}

export default Circumplex
