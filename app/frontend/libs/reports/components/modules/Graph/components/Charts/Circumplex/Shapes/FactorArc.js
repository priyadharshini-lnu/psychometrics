import _ from 'lodash'
import * as d3 from 'd3'
import { FACTOR_FONT_SIZE_RATE } from './consts'
import Container from './Container'

class FactorArc {
  constructor (model, seriesData, svgContainer) {
    this.model = model
    this.dataset = this.calcDataSet(seriesData)
    this.svgContainer = svgContainer
    const radius = Container.getChartRadius(this.model)
    this.arc = d3
      .arc()
      .innerRadius(radius - this.model.props.factorsWidth)
      .outerRadius(radius)
  }

  appendArcs () {
    this.arcs = this.svgContainer
      .selectAll('.factor-container')
      .data(this.getPie()(this.dataset))
      .enter()
      .append('path')
      .attr('class', 'factor-container')
      .attr('d', this.arc)
      .style('stroke', '#000')
      .attr('id', (d, i) => `factor-container-${i}-${this.model.id}`)
      .style('stroke-width', 0)
      .attr('fill', '#393939')
      .each((d, i) => {
        const element = document.getElementById(`factor-container-${i}-${this.model.id}`)
        const firstArcSection = /(^.+?)L/
        const arcs = firstArcSection.exec(d3.select(element).attr('d'))
        if (!arcs || !arcs.length) return null

        let newArc = arcs[1]
        newArc = newArc.replace(/,/g, ' ')
        const angle = ((d.startAngle + d.endAngle) * 90) / Math.PI
        if (angle > 90 && angle < 270) {
          const startLoc = /M(.*?)A/
          const middleLoc = /A(.*?)0 0 1/
          const endLoc = /0 0 1 (.*?)$/
          const newStart = endLoc.exec(newArc)[1]
          const newEnd = startLoc.exec(newArc)[1]
          const middleSec = middleLoc.exec(newArc)[1]
          newArc = `M${newStart}A${middleSec}0 0 0 ${newEnd}`
        }
        this.svgContainer
          .append('path')
          .attr('class', 'hiddenDonutArcs')
          .attr('id', `factor-hidden-container-${i}-${this.model.id}`)
          .attr('d', newArc)
          .style('fill', 'none')
      })
    return this
  }

  calcDataSet (seriesData) {
    return _.map(seriesData, ser => ({
      name: ser.name,
      value: ser.subFactors.length,
      color: ser.color,
    }))
  }

  appendText () {
    this.svgContainer
      .selectAll('.factor-text')
      .data(this.getPie()(this.dataset))
      .enter()
      .append('text')
      .attr('class', 'factor-text')
      .attr('dy', (d, i) => this.getTextDy(d, i))
      .style('fill', '#fff')
      .append('textPath')
      .attr('startOffset', '50%')
      .style('text-anchor', 'middle')
      .style('font-size', `${parseInt(this.model.props.style.fontSize, 10) * FACTOR_FONT_SIZE_RATE}%`)
      .style('font-family', this.model.props.style.fontFamily)
      .attr('xlink:href', (d, i) => `#factor-hidden-container-${i}-${this.model.id}`)
      .text(d => d.data.name)
    return this
  }

  getPie () {
    if (!this.pie) {
      this.pie = d3
        .pie()
        .value(d => d.value)
        .sort(null)
    }
    return this.pie
  }

  getTextDy (d) {
    const factorWidth = this.model.props.factorsWidth
    const angle = ((d.startAngle + d.endAngle) * 90) / Math.PI
    // i'm sorry for magic numbers, but it is necessary
    if (angle > 90 && angle < 270) {
      return -7 - (11 * (factorWidth - 25)) / 25
    }
    return 19 + (11 * (factorWidth - 25)) / 25
  }
}

export default FactorArc
