/* eslint-disable no-underscore-dangle */
/* eslint-disable prefer-rest-params */
import event from './Event'
import Point from './Point'
import Shape from './Shape'

function findPointIndexByPointId (pointId, points) {
  let index = 0
  for (let i = 0; i < points.length; i += 1) {
    if (points[i].id === pointId) {
      index = i
      break
    }
  }

  return index
}

/**
 * @param {Array} pointsData
 * @constructor
 */
function Polygon (pointsData) {
  /**
   * @type {Point[]}
   */
  this.points = []

  const initPointsData = pointsData || []
  for (let i = 0; i < initPointsData.length; i += 1) {
    this.pushPoint(initPointsData[i].x, initPointsData[i].y)
  }

  Shape.apply(this, arguments)
}

Polygon.prototype = new Shape()
Polygon.prototype.constructor = Polygon

Polygon.prototype.insertPointAfter = function (afterPointId, x, y) {
  const point = new Point(x, y)
  const insertIndex = findPointIndexByPointId(afterPointId, this.points)

  this.points.splice(insertIndex, 0, point)

  event.fire(['polygon', 'addPoint', this.id], this, point)
}

Polygon.prototype.removePoint = function (pointId) {
  const removeIndex = findPointIndexByPointId(pointId, this.points)

  this.points.splice(removeIndex, 1)
  this.redraw()

  event.fire(['polygon', 'removePoint', this.id], this)
}

Polygon.prototype.pushPoint = function (x, y) {
  const point = new Point(x, y)
  this.points.push(point)

  event.fire(['polygon', 'addPoint', this.id], this, point)
}

/**
 * @see http://raphaeljs.com/reference.html#Paper.path
 * @param {Point[]} points
 * @returns {string} For example, M50,50L70,70L70,40L50,50Z
 */
const buildPathString = function (points) {
  const coordPairs = []
  for (let i = 0; i < points.length; i += 1) {
    coordPairs.push(`${points[i].x},${points[i].y}`)
  }
  return `M${coordPairs.join('L')}Z`
}

/**
 * @param id
 * @returns {Point|boolean}
 */
Polygon.prototype.getPointById = function (id) {
  for (let i = 0; i < this.points.length; i += 1) {
    if (this.points[i].id === id) {
      return this.points[i]
    }
  }

  return false
}

Polygon.prototype.createRaphaelElement = function () {
  return this.raphaelPaper.path(buildPathString(this.points))
}

Polygon.prototype.initRaphaelElement = function () {
  Shape.prototype.initRaphaelElement.apply(this, arguments)

  event.on(['shape', 'dragStart', this.id], function () {
    const self = this
    const polygonBoundingBox = self.getBBox()

    self._tempPointX = polygonBoundingBox.x
    self._tempPointY = polygonBoundingBox.y
    self._tempWidth = polygonBoundingBox.width
    self._tempHeight = polygonBoundingBox.height
  })

  event.on(['shape', 'dragProcess', this.id], function (dx, dy) {
    const self = this

    const validX = Math.min(
      Math.max(0, self._tempPointX + dx), this.raphaelPaper.width - self._tempWidth,
    )

    const validY = Math.min(
      Math.max(0, self._tempPointY + dy), this.raphaelPaper.height - self._tempHeight,
    )

    self.setCoords(validX, validY)
  })

  event.on(['shape', 'dragEnd', this.id], function () {
    const self = this

    delete self._tempPointX
    delete self._tempPointY
    delete self._tempWidth
    delete self._tempHeight
  })

  event.on(['polygon', 'addPoint', this.id], function () {
    const self = this
    self.redraw()
  })
}

Polygon.prototype.redraw = function () {
  this.raphaelElement.attr({
    path: buildPathString(this.points),
  })
}

Polygon.prototype.resize = function (pointId, x, y) {
  Shape.prototype.resize.apply(this, arguments)

  const validX = Math.min(
    Math.max(0, x), this.raphaelPaper.width,
  )

  const validY = Math.min(
    Math.max(0, y), this.raphaelPaper.height,
  )

  const pointToMove = this.getPointById(pointId)

  if (pointToMove) {
    pointToMove.setCoords(validX, validY)

    this.redraw()
  }
}

Polygon.prototype.relativeResize = function (pointId, dx, dy) {
  Shape.prototype.resize.apply(this, arguments)

  const pointToMove = this.getPointById(pointId)

  const validX = Math.min(
    Math.max(0, pointToMove.x + dx), this.raphaelPaper.width,
  )

  const validY = Math.min(
    Math.max(0, pointToMove.y + dy), this.raphaelPaper.height,
  )

  if (pointToMove) {
    pointToMove.setCoords(validX, validY)

    this.redraw()
  }
}

Polygon.prototype.setCoords = function (x, y) {
  Shape.prototype.setCoords.apply(this, arguments)

  const polygonBoundingBox = this.getBBox()

  const dx = x - polygonBoundingBox.x
  const dy = y - polygonBoundingBox.y

  for (let i = 0; i < this.points.length; i += 1) {
    this.points[i].move(dx, dy)
  }

  this.redraw()
}

Polygon.prototype.removeFromPaper = function () {
  Shape.prototype.removeFromPaper.apply(this, arguments)

  for (let i = 0; i < this.points.length; i += 1) {
    this.points[i].remove()
  }
}

Polygon.prototype.getData = function () {
  const result = []

  for (let i = 0; i < this.points.length; i += 1) {
    result.push({
      x: this.points[i].x,
      y: this.points[i].y,
    })
  }

  return result
}

/**
 * Fix for IE, where Raphael's bbox doesn't work as expected
 */
Polygon.prototype.getBBox = function () {
  const firstPoint = this.points[0]
  let minX = firstPoint.x
  let minY = firstPoint.y
  let maxX = firstPoint.x
  let maxY = firstPoint.y

  for (let i = 1; i < this.points.length; i += 1) {
    const point = this.points[i]
    const pointX = point.x
    const pointY = point.y

    if (pointX < minX) {
      minX = pointX
    }

    if (pointY < minY) {
      minY = pointY
    }

    if (pointX > maxX) {
      maxX = pointX
    }

    if (pointY > maxY) {
      maxY = pointY
    }
  }

  return {
    x: minX,
    y: minY,

    x2: maxX,
    y2: maxY,

    width: maxX - minX,
    height: maxY - minY,
  }
}

Polygon.prototype.getBBoxForResizer = function () {
  const resizer = this.getBBox()
  return {
    x: resizer.x - 15,
    y: resizer.y - 15,
    width: resizer.width + 30,
    height: resizer.height + 30,
  }
}

export default Polygon
