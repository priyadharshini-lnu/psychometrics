import ModulesStore from './ModulesStore'

export default class ShowOnAllPagesStore extends ModulesStore {
  remove (module) {
    _.remove(this.list, module)
    this.update()
  }
}
