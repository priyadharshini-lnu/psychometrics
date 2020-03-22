import ResultStore from 'libs/reports/store/ResultStore'

const GetImageURL = {
  run (module): string | null {
    let base
    let attr = 'icon'
    switch (module.props.basedOn) {
      case 'factor':
        base = ResultStore.results[module.assessment_id].getTopFactorByRank(module.props.topPosition)
        break
      case 'occupation':
        base = ResultStore.results[module.assessment_id].getOccupationByRank(module.props.topPosition)
        break
      case 'occupation_alternative_icon':
        base = ResultStore.results[module.assessment_id].getOccupationByRank(module.props.topPosition)
        attr = 'alternativeIcon'
        break
      case 'occupation_indicative_roles_image':
        base = ResultStore.results[module.assessment_id].getOccupationByRank(module.props.topPosition)
        attr = 'indicativeRolesImage'
        break
      case 'occupation_key_career_tracks_image':
        base = ResultStore.results[module.assessment_id].getOccupationByRank(module.props.topPosition)
        attr = 'keyCareerTracksImage'
        break
      default:
    }
    if (base) {
      return base[attr]
    }
    return null
  },
}


export default GetImageURL
