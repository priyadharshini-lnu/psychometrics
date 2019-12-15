/* eslint-disable prefer-spread */
/* eslint-disable no-underscore-dangle */
/* eslint-disable prefer-rest-params */
import event from '../Event'
import EditableShape from './EditableShape'
import EditableResizer from './EditableResizer'
import Rectangle from '../Rectangle'
import Point from '../Point'

/**
 * @param x
 * @param y
 * @param width
 * @param height
 * @constructor
 */

function EditableRectangle (x, y, width, height) {
  this.shape = new Rectangle(x, y, width, height)
  this.resizer = new EditableResizer(x, y, width, height)
  this.shapeSelected = false
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

  EditableShape.call(this, [])
}

EditableRectangle.prototype = new EditableShape()
EditableRectangle.prototype.constructor = EditableRectangle

EditableRectangle.prototype.updateKeyPoints = function () {
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

EditableRectangle.prototype.resize = function (x, y, width, height) {
  width = Math.max(width, EditableRectangle.MIN_WIDTH)
  height = Math.max(height, EditableRectangle.MIN_HEIGHT)

  this.shape.resize(x, y, width, height)
  this.updateKeyPoints()
}

EditableRectangle.prototype.init = function () {
  EditableShape.prototype.init.apply(this, arguments)

  // Draw shape
  this.shape.addOnRaphaelPaper(this.raphaelPaper)
  // Draw resizer
  this.resizer.addOnRaphaelPaper(this.raphaelPaper)
  // Update points coords
  this.updateKeyPoints()

  // Init events for resize
  const self = this

  // Click on the Shape
  event.on(['shape', 'click', this.shape.id], function () {
    event.fire(['editableShape', 'click', self.id], self, arguments)
    self.selectShape()
  })

  // Drag shape (click on shape)
  event.on(['shape', 'dragProcess', this.shape.id], () => {
    const resizer = self.shape.getDataForResizer()
    self.resizer.resize(resizer.x, resizer.y, resizer.width, resizer.height)
  })

  // Drag end shape (when click on shape)
  event.on(['shape', 'dragEnd', this.shape.id], function () {
    event.fire(['editableShape', 'dragEnd', self.id], self, arguments)
  })

  // Drag end shape (when click on resizer)
  event.on(['resizer', 'dragEnd', this.resizer.shape.id], function () {
    event.fire(['editableShape', 'dragEnd', self.id], self, arguments)
  })

  // Resize shape end
  event.on(['resizer', 'resizeEnd', this.resizer.shape.id], function () {
    event.fire(['editableShape', 'resizeEnd', self.id], self, arguments)
  })

  //  Drag shape (click on resizer)
  event.on(['point', 'setCoords', this.resizer.shape.topLeftPoint.id], () => {
    const shape = self.resizer.getDataForShape()
    self.shape.resize(shape.x, shape.y, shape.width, shape.height)
    self.updateKeyPoints()
  })
}

EditableRectangle.prototype.removeFromPaper = function () {
  EditableShape.prototype.removeFromPaper.apply(this, arguments)

  this.shape.removeFromPaper()
  this.resizer.removeFromPaper()
}

EditableRectangle.prototype.getData = function () {
  return this.shape.getData()
}

EditableRectangle.prototype.getPath = function () {
  return this.shape.getPath()
}

EditableRectangle.prototype.getCloneShapeData = function () {
  const data = this.shape.getData()
  data.x += 15
  data.y += 15
  return data
}

EditableRectangle.prototype.getBBox = function () {
  return this.shape.getBBox()
}

EditableRectangle.prototype.setStyle = function (styleConfig) {
  EditableShape.prototype.setStyle.apply(this, arguments)

  const shapeStyle = styleConfig.shape || {}
  this.shape.setStyle(shapeStyle)
}

EditableRectangle.prototype.resetStyle = function () {
  EditableShape.prototype.resetStyle.apply(this, arguments)

  this.shape.resetStyle()
}

export default EditableRectangle
