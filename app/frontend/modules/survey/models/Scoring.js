/* eslint-disable prefer-spread */
/* eslint-disable prefer-rest-params */
import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import { getStore } from '~/modules/survey/store/StoreWatchman'

import ScoringModules from './ScoringModules'

const Scoring = function (attrs = {}, factorId) {
  this.id = attrs.id
  this.question_id = attrs.question_id
  this.props = attrs.props || []
  this.factorId = factorId
  this.type = attrs.type || 'factor'
  this.scoring_strategy = attrs.scoring_strategy
}

Scoring.prototype = new EventEmitter()

_.extend(Scoring.prototype, {
  toJSON () {
    return {
      id: this.id,
      factor_id: this.factorId || null,
      question_id: this.question_id,
      props: this.props,
      scoring_strategy: this.scoring_strategy,
    }
  },

  setEngine (type) {
    const Res = ScoringModules[type] || function () {}
    this.engine = new Res(this)
  },

  update () {
    if (this.type === 'recoding') {
      getStore().dispatch({ type: 'builder/factors/UPDATE_RECODING', model: this })
    } else {
      getStore().dispatch({ type: 'builder/factors/UPDATE_SCORING', model: this })
    }
  },

  sync () {
  },

  reset () {
    this.props = []
    this.update()
  },

  autoFill (question) {
    this.engine.fill(question)
    this.update()
  },

  changeValue (...args) {
    this.engine.changeValue.apply(this.engine, args)
    this.update()
  },

  toggle (...args) {
    this.engine.toggle.apply(this.engine, args)
    this.update()
  },

  asc (...args) {
    this.engine.asc.apply(this.engine, args)
    this.update()
  },

  desc (...args) {
    this.engine.desc.apply(this.engine, args)
    this.update()
  },

  clear (...args) {
    this.engine.clear.apply(this.engine, args)
    this.update()
  },

  setTemplate (...args) {
    this.engine.setTemplate.apply(this.engine, args)
    this.update()
  },

  updateScoringStrategy (scoringStrategy) {
    this.engine.changeScoringStrategy(scoringStrategy)
    this.update()
  },

  /**
   * Return true, if array of props is empty
   *
   * @returns {*|boolean}
   */
  isEmpty () {
    return _.isEmpty(this.props)
  },

  /**
   * Return true, if array of props has only empty values (props[n].value === null|undefined
   *
   * @returns {*|boolean}
   */
  isEmptyValues () {
    if (this.engine.isEmptyValues) {
      return this.engine.isEmptyValues()
    }
    return !_.some(this.props, object => (object.value || object.value === 0))
  },
})

export default Scoring
