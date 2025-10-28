// import './styles/reset.css'
import './styles/main.css'
import { DefaultAntThemeWrapper } from '~/glint'
import Cover from './Page/types/Cover/Cover'
import Last from './Page/types/Last/Last'
import Guidelines from './Page/types/Guidelines/Guidelines'
import ReportSummary from './Page/types/ReportSummary/ReportSummary'
import Reflections from './Page/types/Reflections/Reflections'
import IDP from './Page/types/IDP/IDP'

const { I18n } = window
I18n.locale = document.body.getAttribute('data-locale')
const isRtl = () => {
  const lang = I18n.uiLocale || I18n.currentLocale()
  return lang === 'ar' || lang === 'he'
}

const IdpReport = () => (
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
    <ReportSummary rtl={isRtl()} />
    <IDP rtl={isRtl()} />
    <Reflections rtl={isRtl()} />
    <Guidelines rtl={isRtl()} />
    <Last rtl={isRtl()} />
  </DefaultAntThemeWrapper>
)

export default IdpReport
