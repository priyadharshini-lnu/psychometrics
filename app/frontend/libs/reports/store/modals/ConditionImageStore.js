/* eslint-disable react/no-this-in-sfc */
import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import ResultStore from 'rb/store/ResultStore'

const ConditionImageStore = function () {
  this.opened = false
}

ConditionImageStore.prototype = new EventEmitter()

_.extend(ConditionImageStore.prototype, {

  update () {
    this.emit('change')
  },

  open (module) {
    this.opened = true
    this.module = module
    this.old = _.cloneDeep(this.module.imageConditions)
    this.update()
  },

  save () {
    this.module.sync()
    this.opened = false
    this.update()
  },

  close () {
    this.opened = false
    this.module.imageConditions = this.old
    this.module = false
    this.update()
  },

  getImageUrl (module) {
    this.module = module
    let base
    let attr = 'icon'
    switch (this.module.props.basedOn) {
      case 'factor':
        base = ResultStore.results[module.assessment_id].getTopFactorByRank(this.module.props.topPosition)
        break
      case 'occupation':
        base = ResultStore.results[module.assessment_id].getOccupationByRank(this.module.props.topPosition)
        break
      case 'occupation_alternative_icon':
        base = ResultStore.results[module.assessment_id].getOccupationByRank(this.module.props.topPosition)
        attr = 'alternativeIcon'
        break
      case 'occupation_indicative_roles_image':
        base = ResultStore.results[module.assessment_id].getOccupationByRank(this.module.props.topPosition)
        attr = 'indicativeRolesImage'
        break
      case 'occupation_key_career_tracks_image':
        base = ResultStore.results[module.assessment_id].getOccupationByRank(this.module.props.topPosition)
        attr = 'keyCareerTracksImage'
        break
      default:
    }
    if (base) {
      return base[attr]
    }
    return null
  },
})

export default new ConditionImageStore()
