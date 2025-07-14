// import './styles/reset.css'
import './styles/main.css'
import { Provider } from 'react-redux'
import { useParams, useSearchParams } from 'react-router-dom'
import IdpTemplate from './IdpTemplate'
import store, { useGetTemplateInfoQuery } from './store'
import { I18nProvider } from './I18nContext'

const { I18n } = window
I18n.locale = document.body.getAttribute('data-locale')

const IdpReport = () => {
  const { campaignId = '', id = '' } = useParams()
  const [search] = useSearchParams()
  const lang = search.get('report_lang') || 'en'
  I18n.uiLocale = lang

  const i18n = { t: (key, ...params) => I18n.t(key, { ...params, locale: lang }) }

  const { isLoading } = useGetTemplateInfoQuery({
    lang, campaignId, id,
  })

  if (isLoading) { return null }

  return (
    <I18nProvider I18n={i18n}>
      <IdpTemplate />
    </I18nProvider>
  )
}

const IdpReportProvider = () => (
  <Provider store={store}>
    <IdpReport />
  </Provider>
)

export default IdpReportProvider
