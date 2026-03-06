import BaseScoringModule from './BaseScoringModule'

class VideoResponse extends BaseScoringModule {
  changeAiScoringConfig (...args) {
    super.changeAiScoringConfig(...args)
  }

  removeAiScoringConfig () {
    super.removeAiScoringConfig()
  }

  initializeAiScoringConfig (defaultValue) {
    super.initializeAiScoringConfig(defaultValue)
  }
}

export default VideoResponse
