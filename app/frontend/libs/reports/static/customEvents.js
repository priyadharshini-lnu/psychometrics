/**
* Custom events v2.0.0 (2016-09-19)
*
* (c) 2012-2016 Black Label
*
* License: Creative Commons Attribution (CC)
*/

/* global Highcharts setTimeout clearTimeout module:true */
/* eslint no-loop-func: 0 */

/**
 * @namespace customEvents
 * */

(function (factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory
  } else {
    factory(Highcharts)
  }
}((HC) => {
  /* global Highcharts :true */


  let UNDEFINED
  const DBLCLICK = 'dblclick'
  const TOUCHSTART = 'touchstart'
  const CLICK = 'click'
  const { each } = HC
  const { pick } = HC
  const { wrap } = HC
  const { merge } = HC
  const { addEvent } = HC
  const { isTouchDevice } = HC
  const defaultOptions = HC.getOptions().plotOptions
  const plotLineOrBandProto = HC.PlotLineOrBand && HC.PlotLineOrBand.prototype
  const { seriesTypes } = HC
  const seriesProto = HC.Series && HC.Series.prototype
  let customEvents
  let proto
  let methods

  /**
	 * @memberof customEvents
	 * @returns {Boolean} true if object is array
	 * */
  function isArray (obj) {
    return Object.prototype.toString.call(obj) === '[object Array]'
  }

  /**
     * WRAPPED FUNCTIONS
     */

  // reset exis events
  if (plotLineOrBandProto) { // # condition for highmaps and custom builds
    wrap(plotLineOrBandProto, 'render', function (proceed) {
      let defaultEvents = this.options && this.options.events

      // reset default events on plot lines or bands
      if (defaultEvents) {
        defaultEvents = false
      }

      proceed.apply(this, Array.prototype.slice.call(arguments, 1))
    })
  }

  if (seriesProto) { // # condition for highmaps and custom builds
    wrap(seriesProto, 'init', function (proceed, chart, options) {
      const chartOptions = chart.options
      const { plotOptions } = chartOptions
      const seriesOptions = chartOptions.plotOptions.series
      const userOptions = merge(seriesOptions, plotOptions[this.type])

      // reset default events on series and series point
      options.events = false
      options.point = {
        events: false,
      }

      // attach events to custom object, which is used in attach event
      options.customEvents = {
        series: userOptions && userOptions.events,
        point: userOptions && userOptions.point && userOptions.point.events,
      }

      // call default action
      proceed.apply(this, Array.prototype.slice.call(arguments, 1))
    })
  }

  HC.Chart.prototype.customEvent = {
    /**
		 * @description Example: [HC.Series, ['drawPoints', 'drawDataLabels']]
		 * @memberof customEvents
		 * @returns {Array} array of pairs: prototype, array of methods to wrap
		 * */
    getEventsProtoMethods () {
      return [
        [HC.Tick, ['addLabel']],
        [HC.Axis, ['render']],
        [HC.Chart, ['setTitle']],
        [HC.Legend, ['renderItem']],
        [HC.PlotLineOrBand, ['render']],
        [HC.Series, ['drawPoints', 'drawDataLabels']],
        [seriesTypes.column, ['drawPoints', 'drawDataLabels']],
        [seriesTypes.bar, ['drawPoints', 'drawDataLabels']],
        [seriesTypes.pie, ['drawPoints', 'drawDataLabels']],
        [seriesTypes.bubble, ['drawPoints', 'drawDataLabels']],
        [seriesTypes.columnrange, ['drawPoints', 'drawDataLabels']],
        [seriesTypes.arearange, ['drawPoints', 'drawDataLabels']],
        [seriesTypes.areasplinerange, ['drawPoints', 'drawDataLabels']],
        [seriesTypes.errorbar, ['drawPoints', 'drawDataLabels']],
        [seriesTypes.boxplot, ['drawPoints', 'drawDataLabels']],
        [seriesTypes.flags, ['drawPoints', 'drawDataLabels']],
      ]
    },
    /**
		 * @description Init method, based on getEventsProtoMethods() array. Iterates on array of prototypes and methods to wrap
		 * @memberof customEvents
		 * */
    init () {
      const eventsProtoMethods = this.getEventsProtoMethods() // array of pairs [object, [methods]]

      each(eventsProtoMethods, (protoMethod) => {
        proto = protoMethod[0] && protoMethod[0].prototype
        methods = protoMethod[1]

        if (proto) {
          each(methods, (method) => {
            customEvents.attach(proto, method)
          })
        }
      })
    },
    /**
		 * @description Wraps methods i.e drawPoints to extract SVG element and set an event by calling customEvents.add()
		 * @param {Object} proto Highcharts prototype i.e Highcharts.Series.prototype
 		 * @param {Object} hcMethod name of wrapped method i.e drawPoints
		 * @memberof customEvents
		 * */
    attach (proto, hcMethod) {
      wrap(proto, hcMethod, function (proceed) {
        let eventElement = {
          events: UNDEFINED,
          element: UNDEFINED,
        }
        let len
        let j

        //  call default actions
        proceed.apply(this, Array.prototype.slice.call(arguments, 1))

        //	call
        eventElement = customEvents.eventElement[hcMethod].call(this)

        //  stop, when events and SVG element do not exist
        if (!eventElement.events && !eventElement.eventsPoint) {
          return false
        }

        if (eventElement.eventsPoint) { //
          len = eventElement.elementPoint.length

          // attach events per each point
          for (j = 0; j < len; j++) {
            const elemPoint = pick(eventElement.elementPoint[j].graphic, eventElement.elementPoint[j])

            if (elemPoint && elemPoint !== UNDEFINED) {
              customEvents.add(elemPoint, eventElement.eventsPoint, eventElement.elementPoint[j], this)
            }
          }
        }

        // attach event to subtitle
        if (eventElement.eventsSubtitle) {
          customEvents.add(eventElement.elementSubtitle, eventElement.eventsSubtitle, this)
        }

        // attach event to stackLabels
        if (eventElement.eventsStackLabel) {
          customEvents.add(eventElement.elementStackLabel, eventElement.eventsStackLabel, this)
        }

        customEvents.add(eventElement.element, eventElement.events, this)
      })
    },
    /**
		 * @description adds event on a SVG element
		 * @param {Object} SVGelem graphic element
		 * @param {Object} events object with all events
		 * @param {Object} elemObj "this" object, which is available in the event
		 * @param {Object} series chart series
		 * @memberof customEvents
		 * */
    add (SVGelem, events, elemObj, series) {
      // stop when SVG element does not exist
      if (!SVGelem || !SVGelem.element) {
        return false
      }

      for (const action in events) {
        (function (event) {
          if (events.hasOwnProperty(event) && !SVGelem[event]) {
            if (isTouchDevice && event === DBLCLICK) { //  #30 - fallback for iPad
              let tapped = false

              addEvent(SVGelem.element, TOUCHSTART, (e) => {
                e.stopPropagation()
                e.preventDefault()

                if (!tapped) {
                  tapped = setTimeout(() => {
                    tapped = null
                    events[CLICK].call(elemObj, e) //	call single click action
                  }, 300)
                } else {
                  clearTimeout(tapped)

                  tapped = null
                  events[event].call(elemObj, e)
                }

                return false
              })
            } else {
              addEvent(SVGelem.element, event, (e) => {
                if (elemObj && elemObj.textStr) { // labels
                  elemObj.value = elemObj.textStr
                }

                if (series && defaultOptions[series.type] && defaultOptions[series.type].marker) {
                  const { chart } = series
                  const normalizedEvent = chart.pointer.normalize(e)

                  elemObj = series.searchPoint(normalizedEvent, true)
                }

                events[event].call(elemObj, e)

                return false
              })
            }

            SVGelem[event] = function () {
              return true
            }
          }
        }(action))
      }
    },
    eventElement: {
      /**
 			* @typedef {Object} eventElement
			* */
      /**
			 * @description Extracts SVG elements from points
			 * @property {Object} eventsPoint events for point
			 * @property {Array} elementPoint array of SVG point elements
			 * @return {Object} { events: object, element: object }
			 * @memberof customEvents
			 * */
      addLabel () {
        const { parent } = this
        const axisOptions = this.axis.options
        const eventsPoint = axisOptions.labels && axisOptions.labels.events
        const elementPoint = [this.label]
        let len
        let i

        if (parent) {
          let step = this // current label

          while (step) {
            if (isArray(step)) {
              len = step.length

              for (i = 0; i < len; i++) {
                elementPoint.push(step[i].label)
              }
            } else {
              elementPoint.push(step.label)
            }

            step = step.parent
          }
        }

        return {
          eventsPoint,
          elementPoint,
        }
      },
      /**
			 * @description Extracts SVG elements from title and subtitle
			 * @property {Object} events events for title
			 * @property {Array} elementPoint title SVG element
			 * @property {Object} eventsSubtitle events for subtitle
			 * @property {Array} elementSubtitle subtitle SVG element
			 * @return {Object} {event: object, element: object, eventsSubtitle: object, elementSubtitle: object }
			 * @memberof customEvents
			 * */
      setTitle () {
        const events = this.options.title && this.options.title.events
        const element = this.title
        const eventsSubtitle = this.options.subtitle && this.options.subtitle.events
        const elementSubtitle = this.subtitle

        return {
          events,
          element,
          eventsSubtitle,
          elementSubtitle,
        }
      },
      /**
			 * @description Extracts SVG elements from dataLabels
			 * @property {Object} events events for dataLabels
			 * @property {Array} element dataLabels SVG element
			 * @return {Object} { events: object, element: object }
			 * @memberof customEvents
			 * */
      drawDataLabels () {
        const { dataLabelsGroup } = this

        return {
          events: dataLabelsGroup ? this.options.dataLabels.events : UNDEFINED,
          element: dataLabelsGroup ? this.dataLabelsGroup : UNDEFINED,
        }
      },
      /**
			 * @description Extracts SVG elements from axis title and stackLabels
			 * @property {Object} events events for axis title
			 * @property {Array} element axis title SVG element
			 * @property {Object} eventsPoint events for stacklabels
			 * @property {Array} elementPoint stacklabels SVG element
			 * @property {Object} eventsStackLabel events for stacklabels
			 * @property {Array} elementStackLabel stacklabels group SVG element
			 * @return {Object} { events: object, element: object, eventsPoint: object, elementPoint: object, eventsStackLabel: object, elementStackLabel: object }
			 * @memberof customEvents
			 * */
      render () {
        const { stackLabels } = this.options
        let events
        let element
        let eventsPoint
        let elementPoint
        let eventsStackLabel
        let elementStackLabel

        if (this.axisTitle) {
          events = this.options.title.events
          element = this.axisTitle
        }

        if (stackLabels && stackLabels.enabled) {
          eventsPoint = stackLabels.events
          elementPoint = this.stacks
          eventsStackLabel = stackLabels.events
          elementStackLabel = this.stackTotalGroup
        }

        return {
          events,
          element,
          eventsPoint,
          elementPoint,
          eventsStackLabel,
          elementStackLabel,
        }
      },
      /**
			 * @description Extracts SVG elements from series and series points
			 * @property {Object} events events for series
			 * @property {Array} element series SVG element
			 * @property {Object} events events for series points
			 * @property {Array} element series points SVG element
			 * @return {Object} { events: object, element: object, eventsPoint: object, elementPoint: object }
			 * @memberof customEvents
			 * */
      drawPoints () {
        const op = this.options
        const { type } = this
        const events = op.customEvents ? op.customEvents.series : op.events
        const element = this.group
        const eventsPoint = op.customEvents ? op.customEvents.point : op.point.events
        let elementPoint

        if (defaultOptions[type] && defaultOptions[type].marker) {
          elementPoint = [this.markerGroup] //	get markers when enabled
        } else {
          elementPoint = this.points //	extract points
        }

        return {
          events,
          element,
          eventsPoint,
          elementPoint,
        }
      },
      /**
			 * @description Extracts SVG elements from legend item
			 * @property {Object} events events for legend item
			 * @property {Array} element legend item SVG element
			 * @return {Object} { events: object, element: object }
			 * @memberof customEvents
			 * */
      renderItem () {
        return {
          events: this.options.itemEvents,
          element: this.group,
        }
      },
    },
  }

  customEvents = HC.Chart.prototype.customEvent
  customEvents.init()
}))
