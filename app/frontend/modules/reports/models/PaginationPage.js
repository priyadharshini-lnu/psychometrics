import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import Utils from '~/modules/reports/utils/Utils'
import Module from '~/modules/reports/models/Module'

const PaginationPage = function (attrs = {}, module, pagination) {
  this.id = Utils.genId()
  this.position = attrs.position
  this.props = attrs.props || {}
  this.visible = true
  this.renderModules = true

  this.modules = {
    list: [
      ...attrs.repeatModules.map(module => new Module({
        ...module,
        pagination,
      }, { page: this })),
      new Module({
        ...module,
        pagination,
        props: {
          ...module.props,
          position: module.props.pagination?.position || {
            left: 50, top: 50, width: 760, height: 1000,
          },
        },
      }, { page: this }),
    ],
  }
  this.pagination = pagination
}

PaginationPage.prototype = new EventEmitter()

_.extend(PaginationPage.prototype, {
  toJSON () {
    return {
      id: this.id,
      name: this.name,
      props: this.props,
      position: this.position,
      removed: this.removed,
      display_logic: this.displayLogic,
      modules: [],
      isNew: this.isNew,
    }
  },
})

export default PaginationPage
