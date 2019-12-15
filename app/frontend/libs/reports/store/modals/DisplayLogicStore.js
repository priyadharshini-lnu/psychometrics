import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import PageList from 'rb/store/PageList'
import LogicElement from 'rb/models/logic/LogicElement'

class DisplayLogicStore extends EventEmitter {
  constructor () {
    super()
    this.opened = false
    this.displayLogic = null
  }

  update () {
    this.emit('change')
  }

  open (page) {
    this.page = page
    this.displayLogic = _.cloneDeep(page.displayLogic) || new LogicElement({})
    this.update()
  }

  addNewList (condition) {
    this.displayLogic.addNewList(condition)
  }

  removeList (list) {
    this.displayLogic.removeList(list)
  }

  save () {
    this.page.displayLogic = this.displayLogic
    this.opened = false
    this.displayLogic = null
    PageList.update()
    this.update()
  }

  remove (page) {
    page.displayLogic = null
    PageList.update()
  }

  close () {
    this.opened = false
    this.displayLogic = null
    this.update()
  }
}

export default new DisplayLogicStore()
