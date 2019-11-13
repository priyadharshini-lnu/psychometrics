import FroalaEditor from 'froala-editor'
import store from 'rb/store/modals/PipedTextModal'

FroalaEditor.DefineIcon('pipedText', { NAME: '{x}', template: 'text' })

FroalaEditor.RegisterCommand('pipedText', {
  title: 'Piped Text',
  focus: true,
  undo: true,
  refreshAfterCallback: true,
  callback () {
    store.open(this)
  },
})
