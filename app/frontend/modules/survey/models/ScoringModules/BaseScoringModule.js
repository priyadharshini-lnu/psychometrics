import { AI_SCORE_CONFIG_TYPES } from '~/modules/survey/constants/scoring.js'

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
    console.error('should be implemented')
  }

  changeAiScoringConfig (configType, index, value) {
    if (configType === AI_SCORE_CONFIG_TYPES.SCORE_DEFINITIONS) {
      if (!this.scoring.ai_scoring_config[configType]) {
        this.scoring.ai_scoring_config[configType] = []
      }
      const existingConfig = this.scoring.ai_scoring_config[configType].find(
        config => config.score.toString() === index.toString(),
      )
      if (existingConfig) {
        const updatedScoreLevelDefinition = this.scoring.ai_scoring_config[configType].map(
          scoreLevelConfig => (scoreLevelConfig.score.toString() === index.toString()
            ? { ...scoreLevelConfig, definition: value } : scoreLevelConfig),
        )
        this.scoring.ai_scoring_config[configType] = updatedScoreLevelDefinition
      } else {
        this.scoring.ai_scoring_config[configType].push({ score: index, definition: value })
      }
      return
    }

    if (configType === AI_SCORE_CONFIG_TYPES.WHAT_TO_LOOK_FOR) {
      this.scoring.ai_scoring_config[configType] = value
    }
  }

  removeAiScoringConfig () {
    this.scoring.ai_scoring_config = {}
  }

  initializeAiScoringConfig (defaultOverallDefinition) {
    this.scoring.ai_scoring_config = defaultOverallDefinition
  }
}

export default BaseScoringModule
