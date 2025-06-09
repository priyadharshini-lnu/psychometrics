// import './styles/reset.css'
import './styles/main.css'
import { Provider } from 'react-redux'
import { useParams } from 'react-router-dom'
import IdpTemplate from './IdpTemplate'
import store, { useGetTemplateInfoQuery } from './store'

const { I18n } = window
I18n.locale = document.body.getAttribute('data-locale')

const IdpReport = () => {
  const { campaignId = '', id = '' } = useParams()

  const { isLoading } = useGetTemplateInfoQuery({
    lang: I18n.locale, campaignId, id,
  })

  if (isLoading) { return null }

  return (
    <IdpTemplate />
  )
}

const IdpReportProvider = () => (
  <Provider store={store}>
    <IdpReport />
  </Provider>
)

export default IdpReportProvider
