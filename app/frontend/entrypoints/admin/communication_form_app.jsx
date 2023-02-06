import ReactDOM from 'react-dom'
import React from 'react'
import '~/modules/admin/styles/common.less'
import CommunicationForm from '~/modules/admin/modules/CommunicationForm'

window.renderCommunicationForm = (id) => {
  ReactDOM.render(<CommunicationForm elementId="body_value" />, document.getElementById(id))
}
