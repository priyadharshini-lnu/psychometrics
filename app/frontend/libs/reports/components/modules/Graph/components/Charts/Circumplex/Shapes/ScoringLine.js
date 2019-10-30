import _ from 'lodash'
import * as d3 from 'd3'
import Utils from 'rb/utils/Utils'
import BaseArc from './BaseArc'

class ScoringLine extends BaseArc {
  appendArcs () {
    const pie = d3
      .pie()
      .value(d => d.value)
      .sort(null)
    this.arcs = this.svgContainer
      .selectAll('g.arc')
      .data(pie(this.dataset))
      .enter()
      .append('g')
      .attr('fill', (d) => {
        if (this.position + 1 <= d.data.scoring) {
          return Utils.convertHex(d.data.color, 90)
        }
        return 'transparent'
      })
    this.arcs
      .append('path')
      .attr('d', this.arc)
      .style('stroke', (d) => {
        if (this.position + 1 <= d.data.scoring) {
          return d.data.color
        }
        return '#aaa'
      })
      .style('stroke-width', 0.5)
    return this
  }

  calcDataSet (seriesData) {
    let dataset = []
    _.each(seriesData, (ser) => {
      dataset = dataset.concat(ser.subFactors)
    })
    return _.map(dataset, (d) => {
      d.value = 1
      return d
    })
  }

  appendText () {
    this.arcs
      .append('text')
      .attr('transform', (data, i) => {
        this.calcInvertText(data, i)
        return `translate(${this.getTextTranslate(data, i)})rotate(${this.textAngle(data, i)})`
      })
      .attr('text-anchor', 'middle')
      .style('fill', d => d.data.color)
      .style('font-size', this.model.props.style.fontSize)
      .style('font-family', this.model.props.style.fontFamily)
      .text((d) => {
        if (this.position === d.data.scoring) {
          return d.data.scoring
        }
        return null
      })
    return this
  }
}

export default ScoringLine
