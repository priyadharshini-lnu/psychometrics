import _ from 'lodash'
import * as d3 from 'd3'
import BaseArc from './BaseArc'

class SubFactorArc extends BaseArc {
  appendArcs () {
    const pie = d3.pie().value(d => d.value).sort(null)
    this.arcs = this.svgContainer.selectAll('g.arc')
      .data(pie(this.dataset))
      .enter()
      .append('g')
      .attr('fill', '#fff')
    this.arcs.append('path')
      .attr('d', this.arc)
      .style('stroke', '#aaa')
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
      d.name = this.getShortFactorName(d.name)
      return d
    })
  }

  appendText () {
    this.arcs.append('text')
      .attr('transform', (data, i) => {
        this.calcInvertText(data, i)
        return `translate(${this.getTextTranslate(data, i)})rotate(${this.textAngle(data, i)})`
      })
      .attr('text-anchor', 'middle')
      .style('fill', '#6C6C6C')
      .style('font-size', this.model.props.style.fontSize)
      .style('font-family', this.model.props.style.fontFamily)
      .text(d => d.data.name)
    return this
  }

  getShortFactorName (name) {
    if (name === 'Ambiguity') return 'Abg'
    if (name === 'Buoyancy') return 'Byn'
    if (name === 'Extra-Role') return 'Exr'
    return _.capitalize(name[0]) + name.substr(1).replace(/[aeiouy]/ig, '').substr(0, 2)
  }
}

export default SubFactorArc
