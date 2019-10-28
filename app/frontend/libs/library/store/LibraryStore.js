import _ from 'lodash'
import { EventEmitter } from 'fbemitter'

const LibraryStore = function () {
  this.show = false
}

LibraryStore.prototype = new EventEmitter()

_.extend(LibraryStore.prototype, {

  openPopup (socket, onSelect, type = '') {
    this.onSelect = onSelect
    this.socket = socket
    this.type = type
    this.loadFolder(0)
  },

  loadFolder (parentId = 0, searchQuery = '') {
    const params = {
      without_notification: true, with_parent: parentId, search_query: searchQuery, with_type: this.type,
    }
    this.socket.perform('library_index', params, (data) => {
      this.data = data
      this.show = true
      this.update()
    })
  },

  select (item) {
    this.onSelect(item)
    this.show = false
    this.update()
  },

  close () {
    this.show = false
    this.update()
  },

  update () {
    this.emit('change')
  },
})

export default new LibraryStore()
