import FroalaEditor from 'froala-editor'
import store from 'rstore'

FroalaEditor.DefineIcon('pipedText', { NAME: '{x}', template: 'text' })

FroalaEditor.RegisterCommand('pipedText', {
  title: 'Piped Text',
  focus: true,
  undo: true,
  refreshAfterCallback: true,
  callback () {
    this.selection.save()
    store.dispatch({ type: 'survey/modals/OPEN', name: 'pipedText', data: { editorRef: this } })
  },
})
