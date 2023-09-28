import FroalaEditor from 'froala-editor'
import store from '~/modules/admin/store'
import { openModal } from '~/modules/admin/core/ui/modals'

FroalaEditor.DefineIcon('pipedText', { NAME: '{x}', template: 'text' })
FroalaEditor.RegisterCommand('pipedText', {
  title: 'Piped Text',
  focus: true,
  undo: true,
  refreshAfterCallback: true,
  callback () {
    store.dispatch(openModal('PipedTextModal', {
      editorRef: this,
      communicationKind: document.querySelector<HTMLInputElement>('#resource_kind')?.value,
    }))
  },
})
