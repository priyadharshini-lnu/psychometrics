import * as d3 from 'd3'
import { SEGMENTS } from './consts'
import Container from './Container'

class BaseArc {
  constructor (model, seriesData, svgContainer, position) {
    this.model = model
    this.dataset = this.calcDataSet(seriesData)
    this.svgContainer = svgContainer
    this.position = position
    const spaces = this.model.props.factorsWidth + this.model.props.innerCircleRadius
    const radius = Container.getChartRadius(this.model) - spaces
    const stepWidth = radius / SEGMENTS
    const innerRadius = this.model.props.innerCircleRadius + stepWidth * position
    const outerRadius = innerRadius + stepWidth
    this.arc = d3
      .arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
  }

  getTextTranslate (data, i) {
    const textKoeff = this.getTextShiftCoeff(i)
    const c = this.arc.centroid(data)
    return `${c[0] * textKoeff}, ${c[1] * textKoeff}`
  }

  getTextShiftCoeff (i) {
    return this.dataset[i].invertedText ? 1.02 : 0.985
  }

  textAngle (data, i) {
    const currentDataset = this.dataset[i]
    const angle = ((data.startAngle + data.endAngle) * 90) / Math.PI
    return currentDataset.invertedText ? angle - 180 : angle
  }

  calcInvertText (data, i) {
    const currentDataset = this.dataset[i]
    const angle = ((data.startAngle + data.endAngle) * 90) / Math.PI
    if (i > 0 && data.data.parent_id === this.dataset[i - 1].parent_id) {
      currentDataset.invertedText = this.dataset[i - 1].invertedText
    } else {
      currentDataset.invertedText = angle > 90 && angle < 270
    }
  }
}

export default BaseArc
