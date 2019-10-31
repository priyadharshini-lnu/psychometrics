class BaseScoringModule {
  constructor (scoring) {
    this.scoring = scoring
  }

  fill () {
    console.error('should be implemented')
  }

  change () {
    console.error('should be implemented')
  }

  toggle () {
    console.log('should be implemented')
  }
}

export default BaseScoringModule
