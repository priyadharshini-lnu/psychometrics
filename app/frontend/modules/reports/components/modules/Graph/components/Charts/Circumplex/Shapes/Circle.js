import I18nStore from 'rb/store/I18nStore'
import { CIRCLE_FONT_SIZE_RATE } from './consts'

class Circle {
  constructor (model, seriesData, svgContainer) {
    this.model = model
    this.svgContainer = svgContainer
  }

  appendCircle () {
    const { innerCircleRadius } = this.model.props
    const defs = this.svgContainer.append('defs')

    const dropShadowFilter = defs.append('svg:filter').attr('id', 'drop-shadow')
    dropShadowFilter
      .append('svg:feDropShadow')
      .attr('dx', 2)
      .attr('dy', 2)
      .attr('stdDeviation', 4)
      .attr('flood-color', '#000')
      .attr('flood-opacity', 0.5)

    this.circle = this.svgContainer
      .append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', innerCircleRadius)
      .attr('fill', '#fff')
      .style('stroke', '#fff')
      .style('filter', 'url(#drop-shadow)')

    return this
  }

  appendText () {
    const { innerCircleRadius, style } = this.model.props
    const size = innerCircleRadius * 2
    this.svgContainer
      .append('foreignObject')
      .attr('y', -innerCircleRadius)
      .attr('x', -innerCircleRadius)
      .attr('width', size)
      .attr('height', size)
      .append('xhtml:div')
      .style('width', `${size}px`)
      .style('height', `${size}px`)
      .style('background', 'transparent')
      .style('text-align', 'center')
      .style('color', 'black')
      .style('display', 'flex')
      .style('font-size', `${parseInt(style.fontSize, 10) * CIRCLE_FONT_SIZE_RATE}%`)
      .style('font-family', style.fontFamily)
      .html(
        this.model.props.innerCircleText
          && `<span style='display: flex;align-items: center;justify-content: center;flex: 1;'>
${I18nStore.tModule(this.model, 'innerCircleText')}
</span>`,
      )

    return this
  }
}

export default Circle
