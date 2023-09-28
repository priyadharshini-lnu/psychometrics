import { Provider } from 'react-redux'
import EmailEditor from '~/components/EmailEditor'
import './pipedText'
import Modals from '~/modules/admin/components/Modals/'
import { PipedTextModal } from './PipedTextModal'
import store from '~/modules/admin/store'

export default function Form ({ elementId }) {
  const el = document.getElementById(elementId)

  const onChange = (value) => {
    const el = document.getElementById(elementId)
    el.value = value
  }

  return (
    <div className="ant-form-vertical">
      <Provider store={store}>
        <EmailEditor handleContentChange={onChange} content={el.value} withPipedText />
        <Modals modals={{ PipedTextModal }} />
      </Provider>
    </div>
  )
}
