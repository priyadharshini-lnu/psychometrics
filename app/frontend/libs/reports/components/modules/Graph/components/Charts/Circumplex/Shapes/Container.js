import Borders from './Borders'
import Circle from './Circle'
import FactorArc from './FactorArc'
import SubFactorArc from './SubFactorArc'
import ScoringCollection from './ScoringCollection'
import { CHART_SIZE, SEGMENTS } from './consts'

class Container {
  constructor (model, seriesData, svgContainer) {
    this.model = model
    this.seriesData = seriesData
    this.svgContainer = svgContainer
  }

  render () {
    const factorArc = new FactorArc(this.model, this.seriesData, this.svgContainer)
    factorArc.appendArcs().appendText()
    const subFactorArc = new SubFactorArc(this.model, this.seriesData, this.svgContainer, SEGMENTS - 1)
    subFactorArc.appendArcs().appendText()
    const scoringCollection = new ScoringCollection(this.model, this.seriesData, this.svgContainer)
    scoringCollection.appendScoringLines()

    const borders = new Borders(this.model, this.seriesData, this.svgContainer)
    borders.appendLines()
    const circle = new Circle(this.model, this.seriesData, this.svgContainer)
    circle.appendCircle().appendText()
  }

  static getChartRadius (model) {
    return (model.getMinSide() * CHART_SIZE) / 2
  }
}

export default Container
