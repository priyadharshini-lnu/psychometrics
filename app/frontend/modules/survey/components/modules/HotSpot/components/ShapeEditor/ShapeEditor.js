import _ from 'lodash'
import event from './Event'
import EditableRectangle from './Editable/EditableRectangle'
import EditablePolygon from './Editable/EditablePolygon'

function bindEventHandlers (shapeObject) {
  const self = this

  event.on(['editableShape', 'click', shapeObject.id], () => {
    self.onSelectShape(shapeObject)
  })

  event.on(['editableShape', 'handleClick', shapeObject.id], (handle) => {
    self.onSelectPoint(handle)
  })

  event.on(['editableShape', 'dragEnd', shapeObject.id], () => {
    self.saveChanges()
  })

  event.on(['editableShape', 'resizeEnd', shapeObject.id], () => {
    self.saveChanges()
  })

  event.on(['editableShape', 'addPoint', shapeObject.id], () => {
    self.saveChanges(shapeObject)
  })

  event.on(['editableShape', 'removePoint', shapeObject.id], () => {
    self.saveChanges(shapeObject)
  })

  event.on(['editableShape', 'removeShape', shapeObject.id], () => {
    self.onShapeRemove()
  })

  event.on(['editableShape', 'closeEditMode', shapeObject.id], () => {
    self.onCloseEditMode(shapeObject)
  })
}

/**
 * @param {EditableShape} shapeObject
 * @returns {EditableShape}
 */
function createShape (shapeObject) {
  shapeObject.addOnRaphaelPaper(this.raphaelPaper)

  this.shapesCollection[shapeObject.id] = shapeObject

  this.onShapeCreate(shapeObject)

  bindEventHandlers.call(this, shapeObject)

  return shapeObject
}

function ShapeEditor (raphaelPaper, eventHandlers) {
  const self = this

  self.raphaelPaper = raphaelPaper
  self.eventHandlers = eventHandlers || {}
  self.selectedShape = null
  self.shapesCollection = {}
  self.getDefaultShapeParams = function () {
    return {
      x: Object.keys(self.shapesCollection).length * 10 + 30,
      y: Object.keys(self.shapesCollection).length * 10 + 30,
      width: 200,
      height: 200,
    }
  }

  self.createShape = function (params) {
    const shapeParams = params || this.getDefaultShapeParams()
    if (shapeParams.width) return self.createRectangle(shapeParams)
    return self.createPolygon(shapeParams)
  }

  self.createRectangle = function (params) {
    return createShape.call(self, new EditableRectangle(params.x, params.y, params.width, params.height))
  }

  self.createPolygon = function (points) {
    return createShape.call(self, new EditablePolygon(points))
  }

  self.addShape = function (params) {
    const shapeObject = this.createShape(params)
    this.saveChanges()
    return shapeObject
  }

  self.cloneShape = function () {
    const data = this.selectedShape.getCloneShapeData()
    this.addShape(data)
  }

  self.onShapeCreate = function () {
  }

  self.onShapeRemove = function () {
    this.deselectAll()
    this.saveChanges()
  }

  self.onSelectShape = function (shapeObj) {
    // Save current selected shape
    this.deselectAll()
    this.selectedShape = shapeObj
    const shapeIndex = _.indexOf(_.keys(this.shapesCollection), shapeObj.id.toString())
    this.eventHandlers.onSelectShape(shapeIndex)
  }

  self.onSelectPoint = function (handle) {
    this.deselectAllHandles()
    this.selectedPoint = handle
    this.selectedPoint.selectPoint()
    this.eventHandlers.onSelectPoint()
  }

  self.onCloseEditMode = function () {
    this.eventHandlers.onCloseEditMode()
  }

  self.saveChanges = function () {
    this.eventHandlers.onChange(self.getData())
  }

  /**
   * @param {EditablePolygon} shapeObj
   * @param x
   * @param y
   */
  self.addPoint = function () {
    const point1 = _.head(self.selectedShape.resizeHandles).attachmentPoint
    const point2 = _.last(self.selectedShape.resizeHandles).attachmentPoint
    const newX = (point1.x + point2.x) / 2
    const newY = (point1.y + point2.y) / 2
    self.selectedShape.addPoint(newX, newY)
  }

  /**
   * @param {EditablePolygon} shapeObj
   * @param {Point} point
   */
  self.removePoint = function () {
    self.selectedShape.removePoint(self.selectedPoint)
    self.deselectAllHandles()
  }

  /**
   * @param {EditableShape} shapeObject
   */
  self.removeShape = function () {
    delete this.shapesCollection[self.selectedShape.id]
    self.selectedShape.removeFromPaper()
    self.selectedShape = null
  }

  /**
   * Edit selected shape
   */
  self.editShape = function () {
    if (this.selectedShape === null) return

    // Convert rectangle to polygon
    if (this.selectedShape instanceof EditableRectangle) {
      const points = _.map(Object.values(this.selectedShape.keyPoints), point => point.getData())
      this.removeShape()
      const shapeObj = this.createShape(points)
      this.selectedShape = shapeObj
    }

    this.selectedShape.turnEditMode()
  }

  /*
   * Deselect all handlse from all shapes
   */
  self.deselectAllHandles = function () {
    this.selectedPoint = null
    _(this.shapesCollection).forEach((s) => {
      (s.resizeHandles).forEach((handle) => {
        handle.deselectPoint()
      })
    })
    this.eventHandlers.onDeselectPoint()
  }

  /*
   * Deselect all shapes
   */
  self.deselectAllShapes = function () {
    self.selectedShape = null
    _(this.shapesCollection).forEach((shapeObj) => {
      shapeObj.deselectShape()
    })
    this.eventHandlers.onDeselectShape()
  }

  /*
   * Deselect all handlse and shapes
   */
  self.deselectAll = function () {
    self.deselectAllShapes()
    self.deselectAllHandles()
  }

  self.getData = function () {
    return _.map(this.shapesCollection, shapeObj => shapeObj.getData())
  }

  return self
}

export default ShapeEditor
