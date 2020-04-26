import _ from 'lodash'
import { getModules } from './selectors'

const serializePage = page => ({
  id: page.isNew ? undefined : page.id,
  name: page.name,
  props: page.props,
  position: page.position,
  removed: page.removed,
  display_logic: page.displayLogic,
  modules: [],
})

const serializeModule = (module) => {
  const { props } = module
  if (module.textConditions) {
    props.textConditions = module.textConditions
  }
  if (module.styleConditions) {
    props.styleConditions = module.styleConditions
  }
  return {
    id: module.isNew ? undefined : module.id,
    page_id: module.page_id,
    type: module.type,
    props,
    removed: module.removed,
    assessment_id: module.assessment_id,
  }
}

const SerializeReport = {
  run (state) {
    const report = {
      id: state.builder.id,
      name: state.builder.name,
      pages: [],
    }

    report.pages = _.map(state.pages, (page) => {
      const data = serializePage(page)
      const modules = _.map(getModules(state, page.modules), module => serializeModule(module))
      return { ...data, modules }
    })
    return report
  },
}


export default SerializeReport
