/* eslint-disable prefer-rest-params */
import Point from './Point'
import Rectangle from './Rectangle'
/**
 * @param x
 * @param y
 * @param {Number} width
 * @param {Number} height
 * @constructor
 */

function Resizer (x, y, width, height) {
  Rectangle.apply(this, arguments)

  /**
   * @type {Point}
   */
  this.topLeftPoint = new Point(x - 15 || 0, y - 15 || 0)

  /**
   * @type {Number}
   */
  this.width = width + 30

  /**
   * @type {Number}
   */
  this.height = height + 30

  this.defaultStyles = {
    'fill-opacity': 0,
    'stroke-width': 1,
    stroke: '#000',
    'stroke-dasharray': '- ',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  }
}

Resizer.prototype = new Rectangle()
Resizer.prototype.constructor = Resizer

Resizer.prototype.initRaphaelElement = function () {
  Rectangle.prototype.initRaphaelElement.apply(this, arguments)
  this.setStyle(this.defaultStyles)
}

Resizer.prototype.getDataForShape = function () {
  return {
    x: this.topLeftPoint.x + 15,
    y: this.topLeftPoint.y + 15,
    width: this.width - 30,
    height: this.height - 30,
  }
}
export default Resizer
