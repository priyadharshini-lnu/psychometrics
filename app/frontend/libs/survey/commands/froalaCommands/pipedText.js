import FroalaEditor from 'froala-editor'
import store from 'store'

FroalaEditor.DefineIcon('pipedText', { NAME: '{x}', template: 'text' })

FroalaEditor.RegisterCommand('pipedText', {
  title: 'Piped Text',
  focus: true,
  undo: true,
  refreshAfterCallback: true,
  callback () {
    this.selection.save()
    this.toJSON = () => '' // hack for redux logger to avoid looping
    store.dispatch({ type: 'modals/OPEN_MODAL', name: 'pipedText', data: { editorRef: this } })
  },
})
