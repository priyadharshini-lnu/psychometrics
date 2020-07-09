/* eslint-disable prefer-spread */
/* eslint-disable no-underscore-dangle */
/* eslint-disable prefer-rest-params */
import event from '../Event'

/**
 * @param {Handle[]} [resizeHandles]
 * @constructor
 */
function EditableShape (resizeHandles) {
  EditableShape._id += 1
  this.id = EditableShape._id

  /**
   * @type {Handle[]}
   */
  this.resizeHandles = resizeHandles || []
}

EditableShape._id = 0

EditableShape.prototype.addOnRaphaelPaper = function (raphaelPaper) {
  this.raphaelPaper = raphaelPaper

  this.init()
}

EditableShape.prototype.init = function () {}

EditableShape.prototype.updateKeyPoints = function () {}

EditableShape.prototype.removeFromPaper = function () {
  for (let i = 0; i < this.resizeHandles.length; i += 1) {
    this.resizeHandles[i].removeFromPaper()
  }

  event.off(['editableShape', 'click', this.id])
  event.off(['editableShape', 'dragEnd', this.id])
  event.fire(['editableShape', 'removeShape', this.id], this, arguments)
}

EditableShape.prototype.getData = function () {}

EditableShape.prototype.getPath = function () {}
EditableShape.prototype.getBBox = function () {}

EditableShape.prototype.setStyle = function (styleConfig) {
  const handleStyle = styleConfig.handle || null

  for (let i = 0; i < this.resizeHandles.length; i += 1) {
    this.resizeHandles[i].setStyle(handleStyle)
  }
}

EditableShape.prototype.resetStyle = function () {
  for (let i = 0; i < this.resizeHandles.length; i += 1) {
    this.resizeHandles[i].resetStyle()
  }
}

EditableShape.prototype.hideResizeHandles = function () {
  for (let i = 0; i < this.resizeHandles.length; i += 1) {
    this.resizeHandles[i].hide()
  }
}

EditableShape.prototype.showResizeHandles = function () {
  for (let i = 0; i < this.resizeHandles.length; i += 1) {
    this.resizeHandles[i].show()
  }
}

EditableShape.prototype.selectShape = function () {
  if (this.shapeSelected) return
  this.shapeSelected = true
  this.resizer.show()
}

EditableShape.prototype.deselectShape = function () {
  if (!this.shapeSelected) return
  this.shapeSelected = false
  this.resizer.hide()
}

export default EditableShape
