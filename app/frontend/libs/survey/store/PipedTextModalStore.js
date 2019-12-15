import { EventEmitter } from 'fbemitter'

class PipedTextModal extends EventEmitter {
  constructor () {
    super()
    this.opened = false
    this.editorRef = null
  }

  update () {
    this.emit('change')
  }

  open (editorRef) {
    this.editorRef = editorRef
    this.editorRef.selection.save()
    this.opened = true
    this.update()
  }

  insert (value) {
    this.editorRef.selection.restore()
    this.editorRef.html.insert(value)
    this.editorRef.events.trigger('change')
    this.editorRef = null
    this.opened = false
    this.update()
  }

  close () {
    this.opened = false
    this.text = ''
    this.update()
  }
}

export default new PipedTextModal()
