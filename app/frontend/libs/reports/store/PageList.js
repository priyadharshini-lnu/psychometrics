import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import Page from 'rb/models/Page'
import ScrollDispatcher from 'rb/dispatchers/ScrollDispatcher'
import panelStore from 'rb/store/PropertyPanelStore'
import ShowOnAllPagesStore from 'rb/store/ShowOnAllPagesStore'
import RichEditorStore from './RichEditorStore'

const PageList = function () {
  this.current = 0
  this.selected = []
  this.list = []
  this.showOnAllPages = new ShowOnAllPagesStore([])
}

PageList.prototype = new EventEmitter()

_.extend(PageList.prototype, {
  load (data, completedAssessments) {
    this.list = []
    _.each(data, (page) => {
      this.list.push(new Page(page, completedAssessments))
    })
    if (!this.list.length) {
      this.createDefault()
    }
    this.update()
  },

  createDefault () {
    this.create({ name: 'Page 1' })
  },

  addPage () {
    this.create({ name: `Page ${this.list.length + 1}` })
  },

  addPageAfter (parentPage) {
    const index = _.findIndex(this.list, parentPage)
    const page = new Page({ page: parentPage.position + 1 })
    this.moveAllAndPush(index + 1, page)
    this.selected = []
    panelStore.unselect()
    this.update()
    setTimeout(() => {
      ScrollDispatcher.scroll(page.id)
    }, 100)
    return page
  },

  moveAllAndPush (i, obj) {
    _.each(_.slice(this.list, i), (q) => { q.position += 1 })
    this.list.push(obj)
    this.sort()
  },

  sort () {
    this.list = _.sortBy(this.list, ['position'])
    _.each(this.list, (page, position) => {
      page.position = position + 1
    })
    this.emit('change')
  },

  updatePositions () {
    _.each(this.list, (page, position) => {
      page.position = position + 1
    })
  },

  removePage (page) {
    if (page.id == null) {
      _.remove(this.list, page)
    } else {
      page.removed = true
    }
    this.update()
  },

  create (data = {}) {
    const page = new Page(data)
    page.position = this.list.length + 1
    this.list.push(page)
    this.selected = []
    panelStore.unselect()
    this.update()
    setTimeout(() => {
      ScrollDispatcher.scroll(page.id)
    }, 100)
    return page
  },

  removeAll () {
    _.each(this.list, (page) => {
      page.modules.removeAll(this.selected)
    })
    this.selected = []
    panelStore.unselect()
    this.update()
  },

  addModule (page, type) {
    const module = this.list[page].addModule(type)
    this.unselectAll()
    this.selected.push(module)
    panelStore.select('Module', module)
    this.update()
  },

  destroy (model) {
    model.removed = true
    if (!this.list.length) {
      this.createDefault()
    }
    this.emit('change')
  },

  permanentDestroy (block) {
    block.permanentRemoved = true
  },

  moveDown (model) {
    const index = _.findIndex(this.list, model)
    if (index !== this.list.length - 1) {
      const block = this.list[index]
      block.moveDown()
      this.list[index] = this.list[index + 1]
      this.list[index + 1] = block
      this.list[index].moveUp()
      this.emit('change')
      return true
    }
    return false
  },

  moveUp (model) {
    const index = _.findIndex(this.list, model)
    if (index !== 0) {
      const block = this.list[index]
      block.moveUp()
      this.list[index] = this.list[index - 1]
      this.list[index - 1] = block
      this.list[index].moveDown()
      this.emit('change')
      return true
    }
    return false
  },

  unselectAll () {
    this.selected = []
    panelStore.select('Report', this)
    if (RichEditorStore.opened) {
      RichEditorStore.close()
    }
    this.update()
  },

  update () {
    this.emit('change')
  },
})

export default new PageList()
