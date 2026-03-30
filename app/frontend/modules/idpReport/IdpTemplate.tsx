// import './styles/reset.css'
import './styles/main.css'
import { DefaultAntThemeWrapper } from '~/glint'
import Cover from './Page/types/Cover/Cover'
import Last from './Page/types/Last/Last'
import Guidelines from './Page/types/Guidelines/Guidelines'
import ReportSummary from './Page/types/ReportSummary/ReportSummary'
import Reflections from './Page/types/Reflections/Reflections'
import IDP from './Page/types/IDP/IDP'
import { useAppSelector } from './hooks/redux'
import { IdpDataProvider } from './hooks/useIdpData'

const { I18n } = window
I18n.locale = document.body.getAttribute('data-locale')
const isRtl = () => {
  const lang = I18n.uiLocale || I18n.currentLocale()
  return lang === 'ar' || lang === 'he'
}

const IdpReport = () => {
  const template = useAppSelector(state => state.idp.template)
  const userIdp = useAppSelector(state => state.idp.userIdp)
  const guidelinePosition = template.guideline_position || 'second'
  const showGuidelines = template.show_guidelines ?? true

  return (
    <IdpDataProvider value={{ template, userIdp }}>
      <DefaultAntThemeWrapper
        locale={I18n.locale}
        direction={isRtl() ? 'rtl' : 'ltr'}
        theme={{
          token: {
            fontSize: 12,
          },
        }}
      >
        <Cover rtl={isRtl()} />
        {showGuidelines && guidelinePosition === 'second' && <Guidelines rtl={isRtl()} />}
        <ReportSummary rtl={isRtl()} />
        <IDP rtl={isRtl()} />
        <Reflections rtl={isRtl()} />
        {showGuidelines && guidelinePosition === 'second_last' && <Guidelines rtl={isRtl()} />}
        <Last rtl={isRtl()} />
      </DefaultAntThemeWrapper>
    </IdpDataProvider>
  )
}

export default IdpReport
