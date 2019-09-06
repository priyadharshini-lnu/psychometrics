import FroalaEditor from 'froala-editor'
import store from 'admin/store'
import { openModal } from 'admin/core/temp/modals'

FroalaEditor.DefineIcon('pipedText', { NAME: '{x}', template: 'text' })
FroalaEditor.RegisterCommand('pipedText', {
  title: 'Piped Text',
  focus: true,
  undo: true,
  refreshAfterCallback: true,
  callback () {
    store.dispatch(openModal('PipedTextModal', { type: this.opts.saveParams.type, editorRef: this }))
  },
})
