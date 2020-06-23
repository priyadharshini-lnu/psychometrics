import FroalaEditor from 'froala-editor'
import store from 'modules/admin/store'
import { openModal } from 'modules/admin/core/temp/modals'

FroalaEditor.DefineIcon('pipedText', { NAME: '{x}', template: 'text' })
FroalaEditor.RegisterCommand('pipedText', {
  title: 'Piped Text',
  focus: true,
  undo: true,
  refreshAfterCallback: true,
  callback () {
    store.dispatch(openModal('PipedTextModal', {
      type: this.opts.saveParams.type,
      details: this.opts.saveParams.details,
      editorRef: this,
    }))
  },
})
