import _ from 'lodash'
import ScoringLine from './ScoringLine'
import { SEGMENTS } from './consts'

class ScoringCollection {
  constructor (model, seriesData, svgContainer) {
    this.model = model
    this.svgContainer = svgContainer
    this.scoringLines = []
    _.times(SEGMENTS - 1, (i) => {
      this.scoringLines.push(new ScoringLine(this.model, seriesData, this.svgContainer, i))
    })
  }

  appendScoringLines () {
    _.each(this.scoringLines, (line) => {
      line.appendArcs().appendText()
    })
    return this
  }
}

export default ScoringCollection
