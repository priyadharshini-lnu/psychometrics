/* eslint-disable react/no-danger */
import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Raphael from 'raphael'
import I18nStore from 'store/I18nStore'
import styles from './HotSpot.scss'


function ShapeView (raphaelPaper, model, readOnly) {
  const self = this

  self.raphaelPaper = raphaelPaper
  self.model = model
  self.props = model.props
  self.regions = []
  self.data = []
  self.model.addListener('resetDefaultValues', () => {
    _.forEach(self.regions, (region) => {
      const object = _.find(model.result.answers, { region: region.id })
      region.selected = object ? object.value : null
      self.styleShape(region)
    })
  })

  self.init = function (regions) {
    _.forEach(regions, (region, id) => {
      const object = _.find(model.result.answers, { region: id })
      const data = {
        id,
        shape: self.drawShape(region).attr({ fill: 'white', 'fill-opacity': 0 }),
        selected: object ? object.value : null,
      }
      self.regions.push(data)
      // Hover events
      if (!self.props.alwaysVisible) {
        data.shape.attr({ 'stroke-width': 0, fill: 'white', 'fill-opacity': 0 })
        data.shape.hover(() => {
          data.shape.attr({ 'stroke-width': 1 })
        }, () => {
          data.shape.attr({ 'stroke-width': 0 })
        })
      }

      self.styleShape(data)
      // Click events
      if (!readOnly) {
        data.shape.click(() => {
          self.selectShape(data)
        })
      }

      self.data.push(data)
    })
  }

  self.drawShape = function (region) {
    if (region.width) return raphaelPaper.rect(region.x, region.y, region.width, region.height)

    const path = this.buildPath(region)
    return raphaelPaper.path(path)
  }

  self.styleShape = function (data) {
    if (self.props.interactivity === 'Switcher') {
      if (!data.selected) {
        data.shape.attr({ fill: 'white', 'fill-opacity': 0 })
      } else {
        data.shape.attr({ fill: 'green', 'fill-opacity': 0.3 })
      }
    } else if (data.selected === null) {
      data.shape.attr({ fill: 'white', 'fill-opacity': 0 })
    } else if (data.selected === true) {
      data.shape.attr({ fill: 'green', 'fill-opacity': 0.3 })
    } else {
      data.shape.attr({ fill: 'red', 'fill-opacity': 0.3 })
    }
  }

  self.selectShape = function (data) {
    if (self.props.interactivity === 'Switcher') {
      if (data.selected === null) {
        data.selected = true
      } else {
        data.selected = null
      }
    } else if (data.selected === null) {
      data.selected = true
    } else if (data.selected === true) {
      data.selected = false
    } else {
      data.selected = null
    }
    model.result.answer(data.id, data.selected)
    self.styleShape(data)
  }

  self.buildPath = function (points) {
    const coordPairs = _.map(points, point => `${point.x},${point.y}`)
    return `M${coordPairs.join('L')}Z`
  }
}
export class Preview extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  componentDidMount () {
    const { model, readOnly } = this.props
    this.paper = new Raphael(this.raphaelPaper, 700, 500)
    const shapeView = new ShapeView(this.paper, model, readOnly)
    shapeView.init(model.props.regions)
  }

  onGraphicLoaded = () => {
    // Plus 30 px because all shapes have resizer border, which eat 15px from both side
    this.paper.setSize(this.graphic.width + 30, this.graphic.height + 30)
  }

  renderGraphic () {
    const { model } = this.props
    if (model.props.graphicUrl !== false) {
      return (
        <img
          className={styles.graphic}
          src={model.props.graphicUrl}
          ref={(ref) => { this.graphic = ref }}
          onLoad={this.onGraphicLoaded}
        />
      )
    }
  }

  render () {
    const { model } = this.props
    return (
      <div>
        <div
          className={styles.questionTextPreview}
          dangerouslySetInnerHTML={{ __html: I18nStore.tQuestion(model, 'questionText') }}
        />
        <div ref={(ref) => { this.raphaelPaper = ref }} className={styles.graphicWrap}>
          {this.renderGraphic()}
        </div>
        <div ref={(ref) => { this.raphaelPaper = ref }} />
      </div>
    )
  }
}


export default Preview
