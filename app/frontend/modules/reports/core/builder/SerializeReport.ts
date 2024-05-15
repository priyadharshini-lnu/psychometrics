import _ from 'lodash'
import { getModules, getPages } from './selectors'
import PageInterface from '../interfaces/Page'

const serializePage = page => ({
  id: page.isNew ? undefined : page.id,
  name: page.name,
  props: page.props,
  position: page.position,
  removed: page.removed,
  display_logic: page.display_logic,
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
    name: module.name,
    page_id: module.page_id,
    type: module.type,
    props,
    removed: module.removed,
    assessment_id: module.assessment_id,
    meta: module.meta,
  }
}

const SerializeReport = {
  run (state) {
    const report: {
      id: number,
      name: string,
      props: object,
      data_sheet_columns: string[],
      campaign_factors: string[],
      filters: object[],
      styles: {[id: string]: object}
      pages?: object[]
    } = {
      id: state.builder.id,
      name: state.builder.name,
      props: state.builder.props,
      data_sheet_columns: state.builder.data_sheet_columns,
      campaign_factors: state.builder.campaign_factors,
      filters: state.builder.filters,
      styles: state.builder.styles,
    }
    report.pages = _.map<PageInterface, object>(getPages(state, state.builder.pages), (page) => {
      const data = serializePage(page)
      const modules = _.map(getModules(state, page.modules), module => serializeModule(module))
      return { ...data, modules }
    })
    return report
  },
}

export default SerializeReport
