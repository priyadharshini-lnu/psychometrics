import _ from 'lodash'
import { SEGMENTS } from './consts'
import Container from './Container'

class Borders {
  constructor (model, seriesData, svgContainer) {
    this.seriesData = seriesData
    this.svgContainer = svgContainer
    this.length = ((Container.getChartRadius(model) - model.props.factorsWidth) * (SEGMENTS + 0.5)) / SEGMENTS
  }

  appendLines () {
    let cursor = 0
    const angleTick = 360 / _.sumBy(this.seriesData, f => f.subFactors.length)

    this.seriesData.reverse().forEach((factor) => {
      cursor += factor.subFactors.length
      const entireAngle = (cursor * angleTick * Math.PI) / 180
      this.svgContainer
        .append('line')
        .attr('x1', 0)
        .attr('x2', -Math.sin(entireAngle) * this.length)
        .attr('y1', 0)
        .attr('y2', -Math.cos(entireAngle) * this.length)
        .style('stroke', '#000')
        .style('stroke-width', 2)
    })
    return this
  }
}

export default Borders
