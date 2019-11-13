/* eslint-disable prefer-spread */
/* eslint-disable no-underscore-dangle */
/* eslint-disable prefer-rest-params */
import _ from 'lodash'
import event from '../Event'
import EditableShape from './EditableShape'
import Polygon from '../Polygon'
import Handle from '../special/Handle'
import EditableResizer from './EditableResizer'

/**
 * @param {Array} [pointsData]
 * @constructor
 */
function EditablePolygon (pointsData) {
  this.shape = new Polygon(pointsData || [])
  this.editMode = false
  this.shapeSelected = false

  EditableShape.call(this)
}

EditablePolygon.prototype = new EditableShape()
EditablePolygon.prototype.constructor = EditablePolygon

EditablePolygon.prototype.resize = function (pointId, x, y) {
  this.shape.resize(pointId, x, y)
}

EditablePolygon.prototype.addPoint = function (x, y) {
  this.shape.pushPoint(x, y)
}

EditablePolygon.prototype.removePoint = function (handle) {
  this.shape.removePoint(handle.attachmentPoint.id)
  handle.removeFromPaper()
}

EditablePolygon.prototype.init = function () {
  EditableShape.prototype.init.apply(this, arguments)

  const self = this

  this.shape.addOnRaphaelPaper(this.raphaelPaper)

  const box = this.shape.getBBox()
  this.resizer = new EditableResizer(box.x, box.y, box.width, box.height)
  this.resizer.addOnRaphaelPaper(this.raphaelPaper)

  const onAddPointEventCallback = function (point) {
    const handle = new Handle(point)

    handle.addOnRaphaelPaper(self.raphaelPaper)
    if (!self.editMode) handle.raphaelElement.hide()

    event.on(['handle', 'dragProcess', handle.id], (dx, dy, x, y) => {
      self.resize(point.id, x, y)
    })

    event.on(['handle', 'dragEnd', handle.id], function () {
      event.fire(['editableShape', 'resizeEnd', self.id], self, arguments)
    })

    event.on(['handle', 'click', handle.id], () => {
      event.fire(['editableShape', 'handleClick', self.id], self, handle)
    })

    self.resizeHandles.push(handle)
  }

  for (let i = 0; i < this.shape.points.length; i += 1) {
    onAddPointEventCallback(this.shape.points[i])
  }

  event.on(['polygon', 'addPoint', this.shape.id], (point) => {
    onAddPointEventCallback(point)
    event.fire(['editableShape', 'addPoint', self.id], self, point)
  })

  event.on(['polygon', 'removePoint', this.shape.id], () => {
    event.fire(['editableShape', 'removePoint', self.id], self)
  })

  event.on(['shape', 'click', this.shape.id], function () {
    event.fire(['editableShape', 'click', self.id], self, arguments)
    if (!self.editMode) self.selectShape()
  })

  event.on(['shape', 'dragEnd', this.shape.id], function () {
    event.fire(['editableShape', 'dragEnd', self.id], self, arguments)
  })(this.resizer.resizeHandles).forEach((handle) => {
    event.on(['handle', 'dragStart', handle.id], () => {
      self._tmpHandlePoint = handle.attachmentPoint.getData()
      self._tmpBoxResizer = self.resizer.getDataForShape()
      self._tmpShapePoints = _.map(self.resizeHandles, handle => ({
        id: handle.attachmentPoint.id,
        x: handle.attachmentPoint.x,
        y: handle.attachmentPoint.y,
      }))
    })

    event.on(['handle', 'dragProcess', handle.id], (dx, dy, x, y) => {
      (self._tmpShapePoints).forEach((point) => {
        // Dont't resize if object has min width
        if (self._tmpHandlePoint.x > point.x) {
          if (x - self._tmpBoxResizer.x <= 30) dx = 15 - self._tmpBoxResizer.width
        } else if (x - self._tmpBoxResizer.x - self._tmpBoxResizer.width >= -30) dx = self._tmpBoxResizer.width - 15

        // Dont't resize if object has min height
        if (self._tmpHandlePoint.y > point.y) {
          if (y - self._tmpBoxResizer.y <= 30) dy = 15 - self._tmpBoxResizer.height
        } else if (y - self._tmpBoxResizer.y - self._tmpBoxResizer.height >= -30) dy = self._tmpBoxResizer.height - 15

        const _dX = (point.x - self._tmpBoxResizer.x) * dx / self._tmpBoxResizer.width
        const _dY = (point.y - self._tmpBoxResizer.y) * dy / self._tmpBoxResizer.height

        const validX = self._tmpHandlePoint.x > point.x ? (point.x + _dX) : (point.x - _dX)
        const validY = self._tmpHandlePoint.y > point.y ? (point.y + _dY) : (point.y - _dY)

        self.resize(point.id, validX, validY)
      })
      const shape = self.resizer.getDataForShape()
      self.shape.setCoords(shape.x, shape.y)
    })

    event.on(['handle', 'dragEnd', handle.id], function () {
      self._tmpHandlePoint = null
      self._tmpBoxResizer = null
      self._tmpShapePoints = null
      event.fire(['editableShape', 'resizeEnd', self.id], self, arguments)
    })
  })

  // Drag shape (when click on shape)
  event.on(['shape', 'dragProcess', this.shape.id], function () {
    self.updateResizer.apply(self, arguments)
  })

  // Drag end shape (when click on shape)
  event.on(['resizer', 'dragEnd', this.resizer.shape.id], function () {
    event.fire(['editableShape', 'dragEnd', self.id], self, arguments)
  })

  // Drag shape (when click on resizer)
  event.on(['point', 'setCoords', this.resizer.shape.topLeftPoint.id], () => {
    const shape = self.resizer.getDataForShape()
    self.shape.setCoords(shape.x, shape.y)
  })
}

EditablePolygon.prototype.updateResizer = function () {
  const box = this.shape.getBBoxForResizer()
  this.resizer.resize(box.x, box.y, box.width, box.height)
}

EditablePolygon.prototype.removeFromPaper = function () {
  EditableShape.prototype.removeFromPaper.apply(this, arguments)

  this.resizer.removeFromPaper()
  this.shape.removeFromPaper()
}

EditablePolygon.prototype.getData = function () {
  return this.shape.getData()
}

EditablePolygon.prototype.getCloneShapeData = function () {
  const data = _.map(this.shape.getData(), point => ({
    x: point.x + 15,
    y: point.y + 15,
  }))
  return data
}

EditablePolygon.prototype.getPath = function () {
  return this.shape.getPath()
}

EditablePolygon.prototype.getBBox = function () {
  return this.shape.getBBox()
}

EditablePolygon.prototype.setStyle = function (styleConfig) {
  EditableShape.prototype.setStyle.apply(this, arguments)

  const polygonStyle = styleConfig.shape || {}
  this.shape.setStyle(polygonStyle)
}

EditablePolygon.prototype.resetStyle = function () {
  EditableShape.prototype.resetStyle.apply(this, arguments)

  this.shape.resetStyle()
}

// Edit mode
EditablePolygon.prototype.turnEditMode = function () {
  if (this.editMode) return
  this.editMode = true
  this.showResizeHandles()
  this.resizer.hide()
}

// Turn off edit mode
EditablePolygon.prototype.turnOffEditMode = function () {
  if (!this.editMode) return
  this.editMode = false
  this.hideResizeHandles()
  this.updateResizer()
  event.fire(['editableShape', 'closeEditMode', this.id], this, arguments)
}

EditablePolygon.prototype.deselectShape = function () {
  EditableShape.prototype.deselectShape.apply(this, arguments)

  this.turnOffEditMode()
}

export default EditablePolygon
