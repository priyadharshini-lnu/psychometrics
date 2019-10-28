/* eslint-disable prefer-spread */
/* eslint-disable no-underscore-dangle */
/* eslint-disable prefer-rest-params */
import event from '../Event'
import EditableShape from './EditableShape'
import Point from '../Point'
import Resizer from '../Resizer'
import Handle from '../special/Handle'

/**
 * @param x
 * @param y
 * @param width
 * @param height
 * @constructor
 */

function EditableResizer (x, y, width, height) {
  this.shape = new Resizer(x, y, width, height)

  this.keyPoints = {
    leftTop: new Point(),
    top: new Point(),
    rightTop: new Point(),
    right: new Point(),
    rightBottom: new Point(),
    bottom: new Point(),
    bottomLeft: new Point(),
    left: new Point(),
  }

  const resizeHandles = [
    new Handle(this.keyPoints.leftTop),
    new Handle(this.keyPoints.top, 'y'),
    new Handle(this.keyPoints.rightTop),
    new Handle(this.keyPoints.right, 'x'),
    new Handle(this.keyPoints.rightBottom),
    new Handle(this.keyPoints.bottom, 'y'),
    new Handle(this.keyPoints.bottomLeft),
    new Handle(this.keyPoints.left, 'x'),
  ]

  // mapping (by array indexes) between handle and related resizeDispatcher:
  this.resizeDispatchersMap = [
    this.resizeDispatchers.leftTop,
    this.resizeDispatchers.top,
    this.resizeDispatchers.rightTop,
    this.resizeDispatchers.right,
    this.resizeDispatchers.rightBottom,
    this.resizeDispatchers.bottom,
    this.resizeDispatchers.bottomLeft,
    this.resizeDispatchers.left,
  ]

  this.updateKeyPoints()

  EditableShape.call(this, resizeHandles)
}

EditableResizer.prototype = new EditableShape()
EditableResizer.prototype.constructor = EditableResizer

EditableResizer.MIN_WIDTH = 45
EditableResizer.MIN_HEIGHT = 45

EditableResizer.prototype.updateKeyPoints = function () {
  EditableShape.prototype.updateKeyPoints.apply(this, arguments)

  const { topLeftPoint } = this.shape
  const { width } = this.shape
  const { height } = this.shape

  this.keyPoints.leftTop.setCoords(topLeftPoint.x, topLeftPoint.y)
  this.keyPoints.top.setCoords(topLeftPoint.x + width / 2, topLeftPoint.y)
  this.keyPoints.rightTop.setCoords(topLeftPoint.x + width, topLeftPoint.y)
  this.keyPoints.right.setCoords(topLeftPoint.x + width, topLeftPoint.y + height / 2)
  this.keyPoints.rightBottom.setCoords(topLeftPoint.x + width, topLeftPoint.y + height)
  this.keyPoints.bottom.setCoords(topLeftPoint.x + width / 2, topLeftPoint.y + height)
  this.keyPoints.bottomLeft.setCoords(topLeftPoint.x, topLeftPoint.y + height)
  this.keyPoints.left.setCoords(topLeftPoint.x, topLeftPoint.y + height / 2)
}

EditableResizer.prototype.resizeDispatchers = {
  leftTop (dx, dy, x, y) {
    const { topLeftPoint } = this.shape
    const { width } = this.shape
    const { height } = this.shape

    x = Math.max(0, Math.min(x, topLeftPoint.x + width - EditableResizer.MIN_WIDTH))
    y = Math.max(0, Math.min(y, topLeftPoint.y + height - EditableResizer.MIN_HEIGHT))

    this.resize(x, y, width - (x - topLeftPoint.x), height - (y - topLeftPoint.y))
  },
  top (dx, dy, x, y) {
    const { topLeftPoint } = this.shape
    const { height } = this.shape
    const { width } = this.shape

    y = Math.max(0, Math.min(y, topLeftPoint.y + height - EditableResizer.MIN_HEIGHT))

    this.resize(topLeftPoint.x, y, width, height - (y - topLeftPoint.y))
  },
  rightTop (dx, dy, x, y) {
    const { topLeftPoint } = this.shape
    const { height } = this.shape

    x = Math.min(x, this.raphaelPaper.width)
    y = Math.max(0, Math.min(y, topLeftPoint.y + height - EditableResizer.MIN_HEIGHT))

    this.resize(topLeftPoint.x, y, x - topLeftPoint.x, height - (y - topLeftPoint.y))
  },
  right (dx, dy, x) {
    const { topLeftPoint } = this.shape
    const { height } = this.shape

    x = Math.min(x, this.raphaelPaper.width)

    this.resize(topLeftPoint.x, topLeftPoint.y, x - topLeftPoint.x, height)
  },
  rightBottom (dx, dy, x, y) {
    const { topLeftPoint } = this.shape

    x = Math.min(x, this.raphaelPaper.width)
    y = Math.min(y, this.raphaelPaper.height)

    this.resize(topLeftPoint.x, topLeftPoint.y, x - topLeftPoint.x, y - topLeftPoint.y)
  },
  bottom (dx, dy, x, y) {
    const { topLeftPoint } = this.shape
    const { width } = this.shape

    y = Math.min(y, this.raphaelPaper.height)

    this.resize(topLeftPoint.x, topLeftPoint.y, width, y - topLeftPoint.y)
  },
  bottomLeft (dx, dy, x, y) {
    const { topLeftPoint } = this.shape
    const { width } = this.shape

    x = Math.max(0, Math.min(x, topLeftPoint.x + width - EditableResizer.MIN_WIDTH))
    y = Math.min(y, this.raphaelPaper.height)

    this.resize(x, topLeftPoint.y, width - (x - topLeftPoint.x), y - topLeftPoint.y)
  },
  left (dx, dy, x) {
    const { topLeftPoint } = this.shape
    const { width } = this.shape
    const { height } = this.shape

    x = Math.max(0, Math.min(x, topLeftPoint.x + width - EditableResizer.MIN_WIDTH))

    this.resize(x, topLeftPoint.y, width - (x - topLeftPoint.x), height)
  },
}

EditableResizer.prototype.resize = function (x, y, width, height) {
  width = Math.max(width, EditableResizer.MIN_WIDTH)
  height = Math.max(height, EditableResizer.MIN_HEIGHT)

  this.shape.resize(x, y, width, height)
  this.updateKeyPoints()
}

EditableResizer.prototype.init = function () {
  EditableShape.prototype.init.apply(this, arguments)

  // Draw shape
  this.shape.addOnRaphaelPaper(this.raphaelPaper)
  // Draw resizer
  // this.resizer.addOnRaphaelPaper(this.raphaelPaper)
  this.shape.raphaelElement.hide()

  // Init events for resize
  const self = this

  for (let i = 0; i < this.resizeHandles.length; i += 1) {
    const handleElement = this.resizeHandles[i]
    const resizeDispatcher = this.resizeDispatchersMap[i]

    handleElement.addOnRaphaelPaper(this.raphaelPaper)
    handleElement.raphaelElement.hide()

    event.on(['handle', 'dragProcess', handleElement.id], (function () {
      const dispatcherInClosure = resizeDispatcher

      return function () {
        dispatcherInClosure.apply(self, arguments)
      }
    }()))

    event.on(['handle', 'dragEnd', handleElement.id], function () {
      event.fire(['resizer', 'resizeEnd', self.shape.id], self, arguments)
    })
  }
  // DRAG
  event.on(['shape', 'dragProcess', this.shape.id], () => {
    self.updateKeyPoints()
  })

  // DRAG END
  event.on(['shape', 'dragEnd', this.shape.id], function () {
    event.fire(['resizer', 'dragEnd', self.shape.id], self, arguments)
  })
}

EditableResizer.prototype.removeFromPaper = function () {
  EditableShape.prototype.removeFromPaper.apply(this, arguments)

  this.shape.removeFromPaper()
}

EditableResizer.prototype.getData = function () {
  return this.shape.getData()
}

EditableResizer.prototype.getDataForShape = function () {
  return this.shape.getDataForShape()
}

EditableResizer.prototype.getPath = function () {
  return this.shape.getPath()
}

EditableResizer.prototype.getBBox = function () {
  return this.shape.getBBox()
}

EditableResizer.prototype.setStyle = function (styleConfig) {
  EditableShape.prototype.setStyle.apply(this, arguments)

  const shapeStyle = styleConfig.shape || {}
  this.shape.setStyle(shapeStyle)
}

EditableResizer.prototype.resetStyle = function () {
  EditableShape.prototype.resetStyle.apply(this, arguments)

  this.shape.resetStyle()
}

EditableResizer.prototype.show = function () {
  this.shape.raphaelElement.show()
  this.showResizeHandles()
}

EditableResizer.prototype.hide = function () {
  this.shape.raphaelElement.hide()
  this.hideResizeHandles()
}
export default EditableResizer
