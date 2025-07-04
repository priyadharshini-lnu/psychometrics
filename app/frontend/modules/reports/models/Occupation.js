import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import OccupationsFactor from './OccupationsFactor'

const Occupation = function (attrs = {}) {
  this.id = attrs.id
  this.name = attrs.name
  this.icon = attrs.icon
  this.alternativeIcon = attrs.alternative_icon
  this.indicativeRolesImage = attrs.indicative_roles_image
  this.keyCareerTracksImage = attrs.key_career_tracks_image
  this.description = attrs.description
  this.fullDescription = attrs.full_description
  this.potentialAreasOfStudy = attrs.potential_areas_of_study
  this.keyCareerTracks = attrs.key_career_tracks
  this.highSchoolEntryRoles = attrs.high_school_entry_roles
  this.diplomaQualification = attrs.diploma_qualification
  this.bachelorsOrMastersQualification = attrs.bachelors_or_masters_qualification
  this.workEnvironment = attrs.work_environment
  this.color = attrs.color
  this.factors = []
  if (attrs.factors) {
    this.factors = _.map(attrs.factors, factor => new OccupationsFactor(factor))
  }
}

Occupation.prototype = new EventEmitter()

_.extend(Occupation.prototype, {
  toJSON () {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      fullDescription: this.fullDescription,
      potentialAreasOfStudy: this.potentialAreasOfStudy,
      keyCareerTracks: this.keyCareerTracks,
      highSchoolEntryRoles: this.highSchoolEntryRoles,
      diplomaQualification: this.diplomaQualification,
      bachelorsOrMastersQualification: this.bachelorsOrMastersQualification,
      workEnvironment: this.workEnvironment,
    }
  },
})

export default Occupation
