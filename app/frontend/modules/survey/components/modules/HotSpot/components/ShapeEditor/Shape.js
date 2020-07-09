/* eslint-disable prefer-rest-params */
/* eslint-disable no-underscore-dangle */
import event from './Event'
/**
 * @constructor
 */
function Shape () {
  Shape._id += 1
  this.id = Shape._id
  this.raphaelPaper = null
  this.raphaelElement = null
  self.defaultStyles = {
    fill: 'yellow',
    'fill-opacity': 0.2,
    'stroke-width': 1,
    stroke: '#000',
  }
}

Shape._id = 0

Shape.prototype.getDefaultStyle = function () {
  return self.defaultStyles
}

Shape.prototype.setStyle = function (config) {
  this.raphaelElement.attr(config)
}

Shape.prototype.resetStyle = function () {
  this.setStyle(this.getDefaultStyle())
}

Shape.prototype.addOnRaphaelPaper = function (raphaelPaper) {
  this.raphaelPaper = raphaelPaper
  this.raphaelElement = this.createRaphaelElement()

  this.initRaphaelElement()
}

Shape.prototype.createRaphaelElement = function () {}

Shape.prototype.initRaphaelElement = function () {
  const self = this

  this.resetStyle()

  /**
   * Make element draggable, @see http://raphaeljs.com/reference.html#Element.drag
   */
  this.raphaelElement.drag(
    (dx, dy, x, y, domEvent) => {
      event.fire(['shape', 'dragProcess', self.id], self, dx, dy, x, y, domEvent)
    },
    (x, y, domEvent) => {
      event.fire(['shape', 'dragStart', self.id], self, x, y, domEvent)
    },
    (x, y, domEvent) => {
      event.fire(['shape', 'dragEnd', self.id], self, x, y, domEvent)
    },
  )

  this.raphaelElement.mousedown(() => {
    event.fire(['shape', 'click', self.id], self)
  })
}

Shape.prototype.resize = function () {
  event.fire(['shape', 'resize', this.id], this, arguments)
}

Shape.prototype.setCoords = function () {
  event.fire(['shape', 'setCoords', this.id], this, arguments)
}

Shape.prototype.removeFromPaper = function () {
  this.raphaelElement.remove()

  event.off(['shape', 'dragProcess', this.id])
  event.off(['shape', 'dragStart', this.id])
  event.off(['shape', 'dragEnd', this.id])

  event.off(['shape', 'click', this.id])
  event.off(['shape', 'resize', this.id])
  event.off(['shape', 'setCoords', this.id])
}

Shape.prototype.getData = function () {
  return {}
}

Shape.prototype.getPath = function () {
  return this.raphaelElement.getPath()
}

Shape.prototype.getBBox = function () {
  return this.raphaelElement.getBBox()
}

export default Shape
