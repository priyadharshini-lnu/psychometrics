/* eslint-disable prefer-rest-params */
/* eslint-disable no-underscore-dangle */
import event from '../Event'
import Shape from '../Shape'

/**
 * @param {Point} attachmentPoint
 * @param {'x'|'y'} [axisRestriction]
 * @constructor
 */
function Handle (attachmentPoint, axisRestriction) {
  /**
   * @type {Point}
   */
  this.attachmentPoint = attachmentPoint

  this.axisRestriction = axisRestriction || false

  this.radius = 4

  this.selected = false

  Shape.call(this)
}

Handle.prototype = new Shape()
Handle.prototype.constructor = Handle

Handle.prototype.createRaphaelElement = function () {
  return this.raphaelPaper.circle(this.attachmentPoint.x, this.attachmentPoint.y, this.radius)
}

Handle.prototype.getDefaultStyle = function () {
  const parentAttributes = Shape.prototype.getDefaultStyle.apply(this, arguments)

  delete parentAttributes['fill-opacity']
  parentAttributes.fill = 'white'

  return parentAttributes
}

// Select point
Handle.prototype.selectPoint = function () {
  this.setStyle({ fill: 'red' })
  this.selected = true
}

// Unselect point
Handle.prototype.deselectPoint = function () {
  this.setStyle(this.getDefaultStyle())
  this.selected = false
}

Handle.prototype.initRaphaelElement = function () {
  Shape.prototype.initRaphaelElement.apply(this, arguments)
  const self = this

  // small animation on hover:
  self.raphaelElement.hover(
    function () {
      this.animate({
        r: self.radius + 2,
      }, 150)
    },
    function () {
      this.animate({
        r: self.radius,
      }, 150)
    },
  )

  event.on(['shape', 'dragProcess', self.id], (dx, dy, x, y, domEvent) => {
    if (self.axisRestriction === 'x') {
      dy = 0
    }

    if (self.axisRestriction === 'y') {
      dx = 0
    }

    x = self._tempPointX + dx
    y = self._tempPointY + dy

    event.fire(['handle', 'dragProcess', self.id], self, dx, dy, x, y, domEvent)
  })

  event.on(['shape', 'dragStart', self.id], (x, y, domEvent) => {
    self._tempPointX = self.attachmentPoint.x
    self._tempPointY = self.attachmentPoint.y

    event.fire(['handle', 'dragStart', self.id], self, x, y, domEvent)
  })

  event.on(['shape', 'dragEnd', self.id], (x, y, domEvent) => {
    delete self._tempPointX
    delete self._tempPointY

    event.fire(['handle', 'dragEnd', self.id], self, x, y, domEvent)
  })

  event.on(['shape', 'click', self.id], function () {
    event.fire(['handle', 'click', self.id], self, arguments)
  })

  event.on(['point', 'setCoords', self.attachmentPoint.id], (x, y) => {
    self.raphaelElement.attr({
      cx: x,
      cy: y,
    })
  })
}

Handle.prototype.removeFromPaper = function () {
  Shape.prototype.removeFromPaper.apply(this, arguments)

  this.attachmentPoint.remove()

  event.off(['handle', 'dragProcess', this.id])
  event.off(['handle', 'dragStart', this.id])
  event.off(['handle', 'dragEnd', this.id])
}

Handle.prototype.show = function () {
  this.raphaelElement.show()
}

Handle.prototype.hide = function () {
  this.raphaelElement.hide()
}

export default Handle
