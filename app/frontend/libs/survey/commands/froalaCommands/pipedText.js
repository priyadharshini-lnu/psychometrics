import FroalaEditor from 'froala-editor'
import store from 'store/PipedTextModalStore'

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
